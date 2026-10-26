import { notFound } from 'next/navigation';
import { AdminProjectPage } from '@/features/admin/components/projects/AdminProjectPage';
import { AdminProjectGovernancePanel } from '@/features/admin/components/projects/AdminProjectGovernancePanel';
import { getAdminProject } from '@/features/admin/server/projects/get-admin-project';
import { requireAdmin } from '@/features/auth/server/require-admin';
import { readProjectActivitySummaries } from '@/server/rcentz-api/project-activity-client';
type AdminProjectRouteProps = { params: Promise<{projectId:string}> };
export default async function AdminProjectRoute({params}:AdminProjectRouteProps) {
 const actor=await requireAdmin();
 const {projectId}=await params;
 const project=await getAdminProject(projectId);
 if (!project) notFound();
 const activity = (await readProjectActivitySummaries([projectId]))[projectId];
 return <><AdminProjectPage project={project} canReconcile={actor.role==='SUPER_ADMIN'} activity={activity}/><div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6"><details className="rounded-xl border border-border p-4"><summary className="cursor-pointer text-sm font-medium">Manual milestone review and exceptions</summary><AdminProjectGovernancePanel projectId={projectId}/></details></div></>;
}
