import { notFound } from 'next/navigation';

import { requireAuth } from '@/features/auth/server/require-auth';

import { ClientInvoicePage } from '@/features/client/components/billing/ClientInvoicePage';

import { getClientInvoice } from '@/features/client/server/billing/get-client-invoice';

type DashboardInvoicePageProps = {
  params: Promise<{
    invoiceId: string;
  }>;
};

export default async function DashboardInvoicePage({
  params
}: DashboardInvoicePageProps) {
  const user = await requireAuth('/dashboard/billing');

  const { invoiceId } = await params;

  const invoice = await getClientInvoice(user.id, invoiceId);

  if (!invoice) {
    notFound();
  }

  return <ClientInvoicePage invoice={invoice} />;
}
