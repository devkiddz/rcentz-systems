import { requireAdmin } from '@/features/auth/server/require-admin';
import { AdminTasksOverview } from '@/features/admin/components/overview/AdminTasksOverview';
import { getOverviewTasks } from '@/features/admin/server/overview/get-overview-tasks';
export default async function Page() {
  await requireAdmin();
  const data = await getOverviewTasks();
  return <main className="mx-auto w-full max-w-6xl p-4 sm:p-6"><h1 className="mb-6 text-2xl font-semibold">Tasks</h1><AdminTasksOverview data={data} /></main>;
}
