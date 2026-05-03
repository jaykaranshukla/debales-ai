import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { projectService } from '@/lib/services/projectService';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const projects = await projectService.getUserProjects(session.user.memberships);
  return NextResponse.json({ projects });
}
