import { notFound } from "next/navigation";

import { requireAuth } from "@/features/auth/server/require-auth";

import { ClientInvoicePage } from "@/features/client/components/billing/ClientInvoicePage";

import { getClientInvoice } from "@/features/client/server/billing/get-client-invoice";

type DashboardInvoicePageProps = {
  params: Promise<{
    invoiceId: string;
  }>;
};

export default async function DashboardInvoicePage({
  params,
}: DashboardInvoicePageProps) {
  const user = await requireAuth("/dashboard/billing");

  const { invoiceId } = await params;

  const invoice = await getClientInvoice(user.id, invoiceId);

  if (!invoice) {
    notFound();
  }

  return (
    <>
      {invoice.invoiceNumber.startsWith("DEMO-DENNIS-INV-") ? (
        <p className="my-4 rounded-xl border border-border bg-surface-muted p-4 text-xs leading-6 text-muted-foreground">
          Demonstration invoice and simulated payment. No funds were charged or
          received. This is not a tax invoice or payment receipt.
        </p>
      ) : null}
      <ClientInvoicePage invoice={invoice} />
    </>
  );
}
