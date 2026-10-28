import { readProjectRuntimeMetrics } from '@/server/runtime-monitor/read';
import { readProjectIntelligence } from '@/server/intelligence/read-project-intelligence';
import { getClientProjectAnalytics } from '@/features/analytics/server/read/get-client-project-analytics';
import { notFound } from 'next/navigation';
import { AdminProjectPage } from '@/features/admin/components/projects/AdminProjectPage';
import { AdminProjectGovernancePanel } from '@/features/admin/components/projects/AdminProjectGovernancePanel';
import { getAdminProject } from '@/features/admin/server/projects/get-admin-project';
import { requireAdmin } from '@/features/auth/server/require-admin';
import { readProjectActivitySummaries } from '@/server/rcentz-api/project-activity-client';
import { getAdminProjects } from '@/features/admin/server/projects/get-admin-projects';
import type { WorkspaceTab } from '@/features/admin/components/projects/ProjectWorkspaceTabs';
type AdminProjectRouteProps = { params: Promise<{projectId:string}>; searchParams: Promise<{ tab?: string }> };
export default async function AdminProjectRoute({params,searchParams}:AdminProjectRouteProps) {
 const actor=await requireAdmin();
 const {projectId}=await params;
 const project=await getAdminProject(projectId);
 if (!project) notFound();
 const activity = (await readProjectActivitySummaries([projectId]))[projectId];
 const analytics = await getClientProjectAnalytics({ userId: actor.id, projectId, adminPreview: true });
 const runtimeMetrics = await readProjectRuntimeMetrics(projectId);
 const intelligence = (await searchParams).tab === 'analytics' ? await readProjectIntelligence(projectId) : null;
 const requestedTab = (await searchParams).tab;
 const tab: WorkspaceTab = requestedTab === 'resources' || requestedTab === 'logs' || requestedTab === 'analytics' || requestedTab === 'settings' ? requestedTab : 'overview';
 const register = await getAdminProjects();
 const selectorProjects = register.projects.map(item => ({id:item.id,name:item.name}));
 return <><AdminProjectPage project={project} canReconcile={actor.role==='SUPER_ADMIN'} activity={activity} analytics={analytics} runtimeMetrics={runtimeMetrics} intelligence={intelligence} tab={tab} selectorProjects={selectorProjects}/><div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6"><details className="rounded-xl border border-border p-4"><summary className="cursor-pointer text-sm font-medium">Manual milestone review and exceptions</summary><AdminProjectGovernancePanel projectId={projectId}/></details></div></>;
}
