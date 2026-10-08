import { AdminInvoiceBuilder } from '@/features/admin/components/invoices/AdminInvoiceBuilder';

import { getAdminInvoiceBuilderData } from '@/features/admin/server/invoices/get-admin-invoice-builder-data';

import { requireAdmin } from '@/features/auth/server/require-admin';

export default async function CreateAdminInvoicePage() {
  await requireAdmin();

  const data = await getAdminInvoiceBuilderData();

  return <AdminInvoiceBuilder clients={data.clients} />;
}
