import { notFound } from 'next/navigation';

import { AdminInvoiceEditor } from '@/features/admin/components/invoices/AdminInvoiceEditor';

import { getAdminInvoice } from '@/features/admin/server/invoices/get-admin-invoice';
import { getAdminInvoiceEditorOptions } from '@/features/admin/server/invoices/get-admin-invoice-editor-options';

import { requireAdmin } from '@/features/auth/server/require-admin';

type AdminInvoiceEditRouteProps = {
  params: Promise<{
    invoiceId: string;
  }>;
};

export default async function AdminInvoiceEditRoute({ params }: AdminInvoiceEditRouteProps) {
  await requireAdmin();

  const { invoiceId } = await params;

  const [invoice, options] = await Promise.all([getAdminInvoice(invoiceId), getAdminInvoiceEditorOptions()]);

  if (!invoice) {
    notFound();
  }

  return <AdminInvoiceEditor invoice={invoice} options={options} />;
}
