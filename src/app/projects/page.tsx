import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth/authOptions';
import { projectService } from '@/lib/services/projectService';

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const projects = await projectService.getUserProjects(session.user.memberships);

  if (projects.length === 1) {
    redirect(`/projects/${projects[0].slug}`);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/8 rounded-full blur-[120px]" />
      </div>
      <div className="relative w-full max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">Your Workspaces</h1>
              <p className="text-sm text-[#9999b3] mt-1">Select a project to continue</p>
            </div>
            <span className="text-sm text-[#555570]">Signed in as {session.user.email}</span>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-[#9999b3]">No projects found. Contact your administrator.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {projects.map((project) => {
              const membership = session.user.memberships.find(
                (m) => m.projectId === project._id.toString()
              );
              return (
                <Link
                  key={project._id.toString()}
                  href={`/projects/${project.slug}`}
                  className="glass rounded-xl p-5 hover:border-indigo-500/30 hover:bg-white/5 transition-all group flex items-center justify-between"
                  data-testid="project-card"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-semibold text-sm">
                      {project.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-white group-hover:text-indigo-300 transition-colors">
                        {project.name}
                      </div>
                      <div className="text-sm text-[#555570]">{project.description || `/${project.slug}`}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      membership?.role === 'admin'
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'bg-white/5 text-[#9999b3]'
                    }`}>
                      {membership?.role ?? 'member'}
                    </span>
                    <svg className="w-4 h-4 text-[#555570] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
