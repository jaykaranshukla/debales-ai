import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { projectService } from '@/lib/services/projectService';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'not logged in' }, { status: 401 });
  const project = await projectService.getBySlug('acme');
  return NextResponse.json({
    userId: session.user.id,
    memberships: session.user.memberships,
    acmeProjectIdFromDB: project?._id?.toString(),
    match: session.user.memberships?.some(m => m.projectId === project?._id?.toString()),
  });
}