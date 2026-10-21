import { notFound } from 'next/navigation';
import { AdminProjectPage } from '@/features/admin/components/projects/AdminProjectPage';
import { AdminProjectGovernancePanel } from '@/features/admin/components/projects/AdminProjectGovernancePanel';
import { getAdminProject } from '@/features/admin/server/projects/get-admin-project';
import { requireAdmin } from '@/features/auth/server/require-admin';
type AdminProjectRouteProps = { params: Promise<{projectId:string}> };
export default async function AdminProjectRoute({params}:AdminProjectRouteProps) {
 await requireAdmin();
 const {projectId}=await params;
 const project=await getAdminProject(projectId);
 if (!project) notFound();
 return <><AdminProjectPage project={project}/><div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6"><AdminProjectGovernancePanel projectId={projectId}/></div></>;
}
