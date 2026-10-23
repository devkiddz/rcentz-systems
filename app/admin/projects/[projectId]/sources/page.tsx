import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/features/auth/server/require-admin';
import { getAdminProject } from '@/features/admin/server/projects/get-admin-project';
import { ProjectDevelopmentSources } from '@/features/admin/components/projects/ProjectDevelopmentSources';

export default async function ProjectSourcesPage({ params }: { params: Promise<{ projectId: string }> }) {
  const user = await requireAdmin();
  const { projectId } = await params;
  const project = await getAdminProject(projectId);
  if (!project) notFound();
  return <main className="rcentz-dashboard-frame px-4 py-6 sm:px-6 lg:px-8"><div className="rcentz-dashboard-inner mx-auto w-full max-w-[1200px] space-y-5">
    <Link className="text-sm text-muted underline" href={`/admin/projects/${projectId}`}>Back to project</Link>
    <div><h1 className="text-xl font-semibold">{project.name} — development sources</h1><p className="text-xs text-muted">Optional GitHub repository connection after project registration.</p></div>
    {user.role === 'SUPER_ADMIN' ? <ProjectDevelopmentSources projectId={projectId} /> : <p className="text-sm text-muted">Source connections require super-admin access.</p>}
  </div></main>;
}
