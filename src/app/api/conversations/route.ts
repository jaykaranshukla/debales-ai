import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { canAccessProject } from '@/lib/access/rules';
import { projectService } from '@/lib/services/projectService';
import { conversationService } from '@/lib/services/conversationService';
import { ConversationQuerySchema, CreateConversationSchema } from '@/lib/zod/schemas';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const parsed = ConversationQuerySchema.safeParse({
    projectSlug: searchParams.get('projectSlug'),
  });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const project = await projectService.getBySlug(parsed.data.projectSlug);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  if (!canAccessProject(session.user.id, project._id.toString(), session.user.memberships)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const conversations = await conversationService.list(project._id.toString(), session.user.id);
  return NextResponse.json({ conversations });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = CreateConversationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { searchParams } = req.nextUrl;
  const projectSlug = searchParams.get('projectSlug');
  if (!projectSlug) return NextResponse.json({ error: 'projectSlug required' }, { status: 400 });

  const project = await projectService.getBySlug(projectSlug);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  if (!canAccessProject(session.user.id, project._id.toString(), session.user.memberships)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const conversation = await conversationService.create(
    project._id.toString(),
    session.user.id,
    parsed.data
  );
  return NextResponse.json({ conversation }, { status: 201 });
}
