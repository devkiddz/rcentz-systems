import { notFound } from 'next/navigation';

import { AdminInvoicePage } from '@/features/admin/components/invoices/AdminInvoicePage';
import { getAdminInvoice } from '@/features/admin/server/invoices/get-admin-invoice';
import { requireAdmin } from '@/features/auth/server/require-admin';

type AdminInvoiceRouteProps = {
  params: Promise<{
    invoiceId: string;
  }>;
};

export default async function AdminInvoiceRoute({ params }: AdminInvoiceRouteProps) {
  await requireAdmin();

  const { invoiceId } = await params;

  const invoice = await getAdminInvoice(invoiceId);

  if (!invoice) {
    notFound();
  }

  return <AdminInvoicePage invoice={invoice} />;
}
