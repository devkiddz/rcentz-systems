import { AdminInvoicesPage } from '@/features/admin/components/invoices/AdminInvoicesPage';

import { getAdminInvoices } from '@/features/admin/server/invoices/get-admin-invoices';

import { requireAdmin } from '@/features/auth/server/require-admin';

export default async function AdminInvoicesRoute() {
  await requireAdmin();

  const data = await getAdminInvoices();

  return <AdminInvoicesPage data={data} />;
}
