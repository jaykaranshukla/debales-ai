import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/authOptions';
import { canAccessAdminDashboard } from '@/lib/access/rules';
import { projectService } from '@/lib/services/projectService';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AdminPage({ params }: Props) {
  const { slug } = await params;

  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const project = await projectService.getBySlug(slug);
  if (!project) redirect('/projects');

  const projectId = project._id.toString();

  if (!canAccessAdminDashboard(session.user.id, projectId, session.user.memberships)) {
    redirect(`/projects/${slug}`);
  }

  return (
    <AdminDashboard
      projectSlug={slug}
      projectName={project.name}
    />
  );
}