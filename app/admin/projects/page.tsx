import { AdminProjectsPage } from '@/features/admin/components/projects/AdminProjectsPage';
import Link from 'next/link';

import { getAdminProjects } from '@/features/admin/server/projects/get-admin-projects';

import { requireAdmin } from '@/features/auth/server/require-admin';
import { readProjectActivitySummaries } from '@/server/rcentz-api/project-activity-client';

export default async function AdminProjectsRoute() {
  await requireAdmin();

  const data = await getAdminProjects();
  const activity = await readProjectActivitySummaries(data.projects.map(project => project.id));

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl justify-end px-4 pt-5 sm:px-6">
        <Link href="/admin/projects/deletion-requests"
          className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-semibold hover:bg-surface-muted">
          Review deletion requests
        </Link>
      </div>
      <AdminProjectsPage data={data} activity={activity} />
    </>
  );
}
