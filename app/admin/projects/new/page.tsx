import { AdminProjectBuilder } from '@/features/admin/components/projects/AdminProjectBuilder';

import { getAdminProjectBuilderData } from '@/features/admin/server/projects/get-admin-project-builder-data';

import { requireAdmin } from '@/features/auth/server/require-admin';

export default async function NewAdminProjectRoute() {
  await requireAdmin();

  const data = await getAdminProjectBuilderData();

  return <AdminProjectBuilder clients={data.clients} />;
}
