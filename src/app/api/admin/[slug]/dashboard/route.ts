import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { canAccessAdminDashboard } from '@/lib/access/rules';
import { projectService } from '@/lib/services/projectService';
import { dashboardService } from '@/lib/services/dashboardService';
import { conversationService } from '@/lib/services/conversationService';
import { integrationService } from '@/lib/services/integrationService';

interface Params { params: { slug: string } }

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const project = await projectService.getBySlug(slug);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  if (!canAccessAdminDashboard(session.user.id, project._id.toString(), session.user.memberships)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let config = await dashboardService.getConfig(project._id.toString());
  if (!config) {
    config = await dashboardService.createDefaultConfig(project._id.toString(), project.name);
  }

  const [stats, recentConversations, integrations] = await Promise.all([
    dashboardService.getStats(project._id.toString()),
    conversationService.recentByProject(project._id.toString(), 5),
    integrationService.getByProject(project._id.toString()),
  ]);

  return NextResponse.json({ config, stats, recentConversations, integrations });
}
