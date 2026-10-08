import { requireAdmin } from '@/features/auth/server/require-admin';
import { AdminClientsOverview } from '@/features/admin/components/overview/AdminClientsOverview';
import { getOverviewClients } from '@/features/admin/server/overview/get-overview-clients';
export default async function Page() {
  await requireAdmin();
  const data = await getOverviewClients();
  return <main className="mx-auto w-full max-w-6xl p-4 sm:p-6"><h1 className="mb-6 text-2xl font-semibold">Clients</h1><AdminClientsOverview clients={data} /></main>;
}
