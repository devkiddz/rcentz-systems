import { AdminProjectsPage } from '@/features/admin/components/projects/AdminProjectsPage';

import { getAdminProjects } from '@/features/admin/server/projects/get-admin-projects';

import { requireAdmin } from '@/features/auth/server/require-admin';

export default async function AdminProjectsRoute() {
  await requireAdmin();

  const data = await getAdminProjects();

  return <AdminProjectsPage data={data} />;
}
