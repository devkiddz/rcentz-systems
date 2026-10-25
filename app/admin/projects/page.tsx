import { AdminProjectsPage } from '@/features/admin/components/projects/AdminProjectsPage';

import { getAdminProjects } from '@/features/admin/server/projects/get-admin-projects';

import { requireAdmin } from '@/features/auth/server/require-admin';
import { readProjectActivitySummaries } from '@/server/rcentz-api/project-activity-client';

export default async function AdminProjectsRoute() {
  await requireAdmin();

  const data = await getAdminProjects();
  const activity = await readProjectActivitySummaries(data.projects.map(project => project.id));

  return <AdminProjectsPage data={data} activity={activity} />;
}
