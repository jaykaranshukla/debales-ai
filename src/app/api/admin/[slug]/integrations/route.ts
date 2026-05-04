import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { canManageIntegrations } from '@/lib/access/rules';
import { projectService } from '@/lib/services/projectService';
import { integrationService } from '@/lib/services/integrationService';
import { ToggleIntegrationSchema } from '@/lib/zod/schemas';

interface Params { params: Promise<{ slug: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const project = await projectService.getBySlug(slug);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  if (!canManageIntegrations(session.user.id, project._id.toString(), session.user.memberships)) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const integrations = await integrationService.getByProject(project._id.toString());
  return NextResponse.json({ integrations });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const project = await projectService.getBySlug(slug);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  if (!canManageIntegrations(session.user.id, project._id.toString(), session.user.memberships)) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = ToggleIntegrationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const integration = await integrationService.toggle(
    project._id.toString(),
    parsed.data.type,
    parsed.data.enabled
  );
  return NextResponse.json({ integration });
}