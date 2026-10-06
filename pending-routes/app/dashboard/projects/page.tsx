import { requireAuth } from '@/features/auth/server/require-auth';

import { ClientProjectsPage } from '@/features/client/components/projects/ClientProjectsPage';

import { getClientProjectMonitors } from '@/features/client/server/projects/get-client-project-monitors';

export default async function DashboardProjectsPage() {
  const user = await requireAuth('/dashboard/projects');

  const projects = await getClientProjectMonitors(user.id);

  return <ClientProjectsPage projects={projects} />;
}
