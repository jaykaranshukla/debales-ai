import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/authOptions';
import { projectService } from '@/lib/services/projectService';
import { ChatShell } from '@/components/chat/ChatShell';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProjectChatPage({ params }: Props) {
  const { slug } = await params;

  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const project = await projectService.getBySlug(slug);
  if (!project) redirect('/projects');

  const membership = session.user.memberships.find(
    (m) => m.projectId === project._id.toString()
  );
  if (!membership) redirect('/projects');

  const productInstances = await projectService.getProductInstances(
    project._id.toString()
  );

  const defaultInstance = productInstances[0];

  return (
    <ChatShell
      project={{ id: project._id.toString(), name: project.name, slug: project.slug }}
      productInstances={productInstances.map((p: any) => ({
        id: p._id.toString(),
        name: p.name,
        productType: p.productType,
      }))}
      defaultProductInstanceId={defaultInstance?._id?.toString() ?? ''}
      isAdmin={membership.role === 'admin'}
      user={{
        id: session.user.id,
        name: session.user.name ?? '',
        email: session.user.email ?? '',
      }}
    />
  );
}