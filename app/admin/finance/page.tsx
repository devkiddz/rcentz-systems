import { requireAdmin } from '@/features/auth/server/require-admin';
import { AdminFinanceOverview } from '@/features/admin/components/overview/AdminFinanceOverview';
import { getFinanceOverview } from '@/features/admin/server/overview/get-finance-overview';
export default async function Page() {
  await requireAdmin();
  const data = await getFinanceOverview();
  return <main className="mx-auto w-full max-w-6xl p-4 sm:p-6"><h1 className="mb-6 text-2xl font-semibold">Finance</h1><AdminFinanceOverview finance={data} /></main>;
}
