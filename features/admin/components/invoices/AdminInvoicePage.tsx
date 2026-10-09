import type { ReactNode } from 'react';

import Link from 'next/link';

import {
  ArrowLeft,
  CircleDollarSign,
  ExternalLink,
  FileClock,
  FilePenLine,
  FileText,
  History,
  ReceiptText,
  UserRound
} from 'lucide-react';

import {
  AdminCancelRevisionButton,
  AdminIssueInvoiceButton
} from '@/features/admin/components/invoices/AdminInvoiceLifecycleActions';

import { AdminRequestInvoiceApprovalButton } from '@/features/admin/components/invoices/AdminInvoiceApprovalActions';

import type { AdminInvoiceData } from '@/features/admin/server/invoices/get-admin-invoice';

type AdminInvoicePageProps = {
  invoice: AdminInvoiceData;
};

type PaymentRecord = AdminInvoiceData['payments'][number];
type ApprovalRecord = AdminInvoiceData['approvals'][number];
type RevisionRecord = AdminInvoiceData['revisions'][number];

type BillingHistoryEntry =
  | {
      id: string;
      type: 'ISSUED';
      date: Date;
    }
  | {
      id: string;
      type: 'PAYMENT';
      date: Date;
      payment: PaymentRecord;
    }
  | {
      id: string;
      type: 'APPROVAL_REQUESTED';
      date: Date;
      approval: ApprovalRecord;
    }
  | {
      id: string;
      type: 'APPROVAL_ACCEPTED';
      date: Date;
      approval: ApprovalRecord;
    }
  | {
      id: string;
      type: 'APPROVAL_REJECTED';
      date: Date;
      approval: ApprovalRecord;
    }
  | {
      id: string;
      type: 'APPROVAL_CANCELLED';
      date: Date;
      approval: ApprovalRecord;
    }
  | {
      id: string;
      type: 'REVISION_PROPOSED';
      date: Date;
      revision: RevisionRecord;
    }
  | {
      id: string;
      type: 'REVISION_ACCEPTED';
      date: Date;
      revision: RevisionRecord;
    }
  | {
      id: string;
      type: 'REVISION_REJECTED';
      date: Date;
      revision: RevisionRecord;
    }
  | {
      id: string;
      type: 'REVISION_CANCELLED';
      date: Date;
      revision: RevisionRecord;
    };

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(amount);
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat('en-NG', {
    maximumFractionDigits: 2
  }).format(value);
}

function formatDate(value: Date | null) {
  if (!value) {
    return 'Not set';
  }

  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(value);
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(value);
}

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function buildHistory(invoice: AdminInvoiceData) {
  const history: BillingHistoryEntry[] = [];

  if (invoice.issuedAt) {
    history.push({
      id: `issued-${invoice.id}`,
      type: 'ISSUED',
      date: invoice.issuedAt
    });
  }

  for (const payment of invoice.payments) {
    history.push({
      id: `payment-${payment.id}`,
      type: 'PAYMENT',
      date: payment.paidAt ?? payment.createdAt,
      payment
    });
  }

  for (const approval of invoice.approvals) {
    history.push({
      id: `approval-requested-${approval.id}`,
      type: 'APPROVAL_REQUESTED',
      date: approval.requestedAt,
      approval
    });

    if (approval.status === 'ACCEPTED' && approval.respondedAt) {
      history.push({
        id: `approval-accepted-${approval.id}`,
        type: 'APPROVAL_ACCEPTED',
        date: approval.respondedAt,
        approval
      });
    }

    if (approval.status === 'REJECTED' && approval.respondedAt) {
      history.push({
        id: `approval-rejected-${approval.id}`,
        type: 'APPROVAL_REJECTED',
        date: approval.respondedAt,
        approval
      });
    }

    if (approval.status === 'CANCELLED' && approval.cancelledAt) {
      history.push({
        id: `approval-cancelled-${approval.id}`,
        type: 'APPROVAL_CANCELLED',
        date: approval.cancelledAt,
        approval
      });
    }
  }

  for (const revision of invoice.revisions) {
    history.push({
      id: `revision-created-${revision.id}`,
      type: 'REVISION_PROPOSED',
      date: revision.createdAt,
      revision
    });

    if (revision.acceptedAt) {
      history.push({
        id: `revision-accepted-${revision.id}`,
        type: 'REVISION_ACCEPTED',
        date: revision.acceptedAt,
        revision
      });
    }

    if (revision.rejectedAt) {
      history.push({
        id: `revision-rejected-${revision.id}`,
        type: 'REVISION_REJECTED',
        date: revision.rejectedAt,
        revision
      });
    }

    if (revision.cancelledAt) {
      history.push({
        id: `revision-cancelled-${revision.id}`,
        type: 'REVISION_CANCELLED',
        date: revision.cancelledAt,
        revision
      });
    }
  }

  history.sort((first, second) => {
    return second.date.getTime() - first.date.getTime();
  });

  return history;
}

export function AdminInvoicePage({ invoice }: AdminInvoicePageProps) {
  const history = buildHistory(invoice);

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-[var(--section-max)] space-y-6">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/admin/invoices"
              className="inline-flex items-center gap-2 text-xs font-medium text-muted transition-colors hover:text-foreground">
              <ArrowLeft className="size-4" />
              Back to invoices
            </Link>

            <p className="mt-5 font-mono text-xs uppercase tracking-[0.14em] text-theme-accent">
              Finance / Invoice
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-3xl">
              {invoice.invoiceNumber}
            </h1>

            <p className="mt-2 text-sm text-muted">Complete administrative billing record.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {invoice.pdfUrl ? (
              <a
                href={invoice.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-surface">
                <ExternalLink className="size-4" />
                Open PDF
              </a>
            ) : null}

            <Link
              href={`/admin/invoices/${invoice.id}/edit`}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-surface">
              <FilePenLine className="size-4" />
              Edit Invoice
            </Link>

            {invoice.permissions.canIssue ? <AdminIssueInvoiceButton invoiceId={invoice.id} /> : null}

            {invoice.permissions.canRequestAgreement && invoice.agreementState === 'NOT_REQUESTED' ? (
              <AdminRequestInvoiceApprovalButton invoiceId={invoice.id} />
            ) : null}

            <StatusBadge status={invoice.effectiveStatus} />

            {invoice.status !== 'DRAFT' ? (
              <StatusBadge status={`Agreement: ${formatStatus(invoice.agreementState)}`} formatted />
            ) : null}
          </div>
        </section>

        {invoice.latestUnresolvedRevision ? (
          <section className="overflow-hidden rounded-2xl border border-border bg-background">
            <header className="flex flex-col gap-3 border-b border-border bg-surface-raised px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-base font-semibold text-foreground">Payment update awaiting resolution</p>

                <p className="mt-1 text-sm text-muted">
                  Revision #{invoice.latestUnresolvedRevision.revisionNumber}
                  {' · '}
                  {formatStatus(invoice.latestUnresolvedRevision.status)}
                </p>
              </div>

              <AdminCancelRevisionButton revisionId={invoice.latestUnresolvedRevision.id} />
            </header>

            <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto]">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {invoice.latestUnresolvedRevision.title}
                </p>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                  {invoice.latestUnresolvedRevision.explanation}
                </p>

                {invoice.latestUnresolvedRevision.clientResponse ? (
                  <div className="mt-4 rounded-xl border border-border bg-surface p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                      Client response
                    </p>

                    <p className="mt-2 text-sm leading-6 text-foreground">
                      {invoice.latestUnresolvedRevision.clientResponse}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="min-w-[220px] rounded-xl border border-border bg-surface-muted/40 p-4">
                <p className="text-xs text-muted">Current → Proposed</p>

                <p className="mt-2 text-lg font-semibold text-foreground">
                  {formatMoney(
                    invoice.latestUnresolvedRevision.previousTotal,
                    invoice.latestUnresolvedRevision.previousCurrency
                  )}
                </p>

                <p className="my-1 text-xs text-muted">to</p>

                <p className="text-lg font-semibold text-foreground">
                  {formatMoney(
                    invoice.latestUnresolvedRevision.proposedTotal,
                    invoice.latestUnresolvedRevision.proposedCurrency
                  )}
                </p>
              </div>
            </div>
          </section>
        ) : null}

        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Card
            title="Invoice identity"
            description="Billing source, dates and project association."
            icon={<FileText className="size-4 text-theme-accent" />}>
            <div className="grid gap-4 sm:grid-cols-2">
              <InformationCell label="Invoice number" value={invoice.invoiceNumber} />

              <InformationCell label="Status" value={formatStatus(invoice.effectiveStatus)} />

              <InformationCell label="Agreement" value={formatStatus(invoice.agreementState)} />

              <InformationCell label="Source" value={invoice.source.label} />

              <InformationCell
                label="Source reference"
                value={invoice.source.reference ?? 'Not applicable'}
              />

              <InformationCell label="Issued" value={formatDate(invoice.issuedAt)} />

              <InformationCell label="Due" value={formatDate(invoice.dueAt)} />

              <InformationCell
                label="Project"
                value={invoice.association.project?.name ?? 'No project attached'}
              />

              <InformationCell label="Source type" value={formatStatus(String(invoice.source.type))} />
            </div>
          </Card>

          <Card
            title="Client"
            description="Account and billing identity."
            icon={<UserRound className="size-4 text-theme-accent" />}>
            <p className="text-lg font-semibold text-foreground">{invoice.client.displayName}</p>

            <p className="mt-1 text-sm text-muted">{invoice.client.email ?? 'No account email'}</p>

            <div className="mt-5 grid gap-4">
              <InformationCell
                label="Invoice customer"
                value={invoice.customer.name ?? invoice.client.displayName}
              />

              <InformationCell
                label="Billing email"
                value={invoice.customer.email ?? invoice.client.email ?? 'Not recorded'}
              />

              <InformationCell label="Phone" value={invoice.customer.phone ?? 'Not recorded'} />

              {invoice.customer.billingAddress ? (
                <InformationCell label="Billing address" value={invoice.customer.billingAddress} />
              ) : null}
            </div>
          </Card>
        </section>

        <Card
          title="Invoice items"
          description="Everything currently included in this invoice."
          icon={<ReceiptText className="size-4 text-theme-accent" />}>
          {invoice.items.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-foreground">No line items</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="hidden grid-cols-[minmax(0,1fr)_100px_150px_150px] border-b border-border bg-surface-raised px-4 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-muted sm:grid">
                <span>Item</span>
                <span>Qty</span>
                <span>Unit price</span>
                <span className="text-right">Total</span>
              </div>

              <div className="divide-y divide-border">
                {invoice.items.map(item => {
                  return (
                    <div
                      key={item.id}
                      className="grid gap-4 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_100px_150px_150px] sm:items-center">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{item.name}</p>

                        {item.description ? (
                          <p className="mt-1 text-sm leading-6 text-muted">{item.description}</p>
                        ) : null}

                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                          <span>{formatStatus(String(item.type))}</span>

                          {item.service ? (
                            <>
                              <span>·</span>
                              <span>{item.service.name}</span>
                            </>
                          ) : null}
                        </div>
                      </div>

                      <ItemValue label="Quantity" value={formatQuantity(item.quantity)} />

                      <ItemValue label="Unit price" value={formatMoney(item.unitPrice, invoice.currency)} />

                      <ItemValue label="Total" value={formatMoney(item.total, invoice.currency)} alignRight />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        <section className="grid gap-4 lg:grid-cols-[1fr_380px]">
          <Card
            title="Payment position"
            description="Current receivable position for this invoice."
            icon={<CircleDollarSign className="size-4 text-theme-accent" />}>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">Remaining balance</p>

            <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-foreground">
              {formatMoney(invoice.balanceDue, invoice.currency)}
            </p>

            <p className="mt-2 text-sm text-muted">
              {invoice.balanceDue === 0
                ? 'This invoice is fully settled.'
                : `${formatMoney(invoice.amountPaid, invoice.currency)} has been recorded as paid.`}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <InformationCell label="Total invoice" value={formatMoney(invoice.total, invoice.currency)} />

              <InformationCell
                label="Amount paid"
                value={formatMoney(invoice.amountPaid, invoice.currency)}
              />

              <InformationCell
                label="Balance due"
                value={formatMoney(invoice.balanceDue, invoice.currency)}
              />
            </div>
          </Card>

          <Card title="Totals" description="Current invoice calculation.">
            <TotalRow label="Subtotal" value={formatMoney(invoice.subtotal, invoice.currency)} />

            <TotalRow label="Discount" value={formatMoney(invoice.discount, invoice.currency)} />

            <TotalRow label="Tax" value={formatMoney(invoice.tax, invoice.currency)} />

            <div className="my-3 border-t border-border" />

            <TotalRow label="Total" value={formatMoney(invoice.total, invoice.currency)} strong />

            <TotalRow label="Paid" value={formatMoney(invoice.amountPaid, invoice.currency)} />

            <TotalRow label="Balance" value={formatMoney(invoice.balanceDue, invoice.currency)} strong />
          </Card>
        </section>

        {invoice.status !== 'DRAFT' ? (
          <Card
            title="Client agreement"
            description="Original invoice verification and agreement history."
            icon={<FileClock className="size-4 text-theme-accent" />}>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={invoice.agreementState} />

                  {invoice.latestApproval ? (
                    <span className="text-xs text-muted">
                      Latest version {invoice.latestApproval.version}
                    </span>
                  ) : null}
                </div>

                {invoice.pendingApproval ? (
                  <>
                    <p className="mt-4 text-base font-semibold text-foreground">
                      Awaiting client verification
                    </p>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                      The client must review and accept the original invoice agreement before payment becomes
                      available.
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <InformationCell
                        label="Requested"
                        value={formatDateTime(invoice.pendingApproval.requestedAt)}
                      />

                      <InformationCell
                        label="Requested by"
                        value={invoice.pendingApproval.requestedBy.name}
                      />
                    </div>
                  </>
                ) : null}

                {invoice.acceptedApproval ? (
                  <>
                    <p className="mt-4 text-base font-semibold text-foreground">
                      Client accepted the invoice
                    </p>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                      Version {invoice.acceptedApproval.version} is the accepted original agreement. Financial
                      changes from this point require an invoice revision.
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <InformationCell
                        label="Accepted by"
                        value={
                          invoice.acceptedApproval.respondedBy?.name ?? invoice.acceptedApproval.client.name
                        }
                      />

                      <InformationCell
                        label="Accepted"
                        value={
                          invoice.acceptedApproval.respondedAt
                            ? formatDateTime(invoice.acceptedApproval.respondedAt)
                            : 'Recorded'
                        }
                      />
                    </div>
                  </>
                ) : null}

                {invoice.rejectedApproval ? (
                  <>
                    <p className="mt-4 text-base font-semibold text-foreground">
                      Client returned the invoice
                    </p>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                      Edit the original invoice based on the client response. Saving the correction will close
                      the stale agreement and send a new approval version.
                    </p>

                    {invoice.rejectedApproval.response ? (
                      <div className="mt-4 rounded-xl border border-border bg-surface p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">
                          Client response
                        </p>

                        <p className="mt-2 text-sm leading-6 text-foreground">
                          {invoice.rejectedApproval.response}
                        </p>
                      </div>
                    ) : null}
                  </>
                ) : null}

                {invoice.agreementState === 'NOT_REQUESTED' ? (
                  <>
                    <p className="mt-4 text-base font-semibold text-foreground">
                      Verification has not been requested
                    </p>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                      This invoice does not yet have an active original agreement. Request client verification
                      before payment.
                    </p>

                    {invoice.permissions.canRequestAgreement ? (
                      <div className="mt-4">
                        <AdminRequestInvoiceApprovalButton invoiceId={invoice.id} />
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>

              <div className="rounded-xl border border-border bg-surface-muted/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">
                  Agreement record
                </p>

                <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground">
                  {invoice.approvals.length}
                </p>

                <p className="mt-1 text-sm text-muted">
                  approval version
                  {invoice.approvals.length === 1 ? '' : 's'} recorded
                </p>

                {invoice.latestApproval?.snapshot ? (
                  <div className="mt-5 border-t border-border pt-4">
                    <p className="text-xs text-muted">Latest recorded value</p>

                    <p className="mt-1 text-lg font-semibold text-foreground">
                      {formatMoney(
                        invoice.latestApproval.snapshot.total,
                        invoice.latestApproval.snapshot.currency
                      )}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            {invoice.approvals.length > 0 ? (
              <div className="mt-5 overflow-hidden rounded-xl border border-border">
                <div className="hidden grid-cols-[100px_140px_minmax(0,1fr)_180px] border-b border-border bg-surface-raised px-4 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-muted sm:grid">
                  <span>Version</span>
                  <span>Status</span>
                  <span>Activity</span>
                  <span className="text-right">Date</span>
                </div>

                <div className="divide-y divide-border">
                  {invoice.approvals.map(approval => {
                    return (
                      <div
                        key={approval.id}
                        className="grid gap-3 px-4 py-4 sm:grid-cols-[100px_140px_minmax(0,1fr)_180px] sm:items-center">
                        <div>
                          <p className="text-xs uppercase tracking-[0.06em] text-muted sm:hidden">Version</p>

                          <p className="mt-1 text-sm font-semibold text-foreground sm:mt-0">
                            v{approval.version}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-[0.06em] text-muted sm:hidden">Status</p>

                          <div className="mt-1 sm:mt-0">
                            <StatusBadge status={approval.status} />
                          </div>
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            Requested by {approval.requestedBy.name}
                          </p>

                          {approval.respondedBy ? (
                            <p className="mt-1 text-xs text-muted">
                              Responded by {approval.respondedBy.name}
                            </p>
                          ) : null}

                          {approval.cancelledBy ? (
                            <p className="mt-1 text-xs text-muted">Closed by {approval.cancelledBy.name}</p>
                          ) : null}

                          {approval.response ? (
                            <p className="mt-2 text-sm leading-5 text-muted">“{approval.response}”</p>
                          ) : null}
                        </div>

                        <div className="sm:text-right">
                          <p className="text-xs uppercase tracking-[0.06em] text-muted sm:hidden">
                            Requested
                          </p>

                          <p className="mt-1 text-xs text-muted sm:mt-0">
                            {formatDateTime(approval.requestedAt)}
                          </p>

                          {approval.respondedAt ? (
                            <p className="mt-1 text-xs text-muted">
                              Responded {formatDateTime(approval.respondedAt)}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </Card>
        ) : null}

        {invoice.revisions.length > 0 ? (
          <Card
            title="Invoice revisions"
            description="Before-and-after billing changes after the original agreement."
            icon={<FileClock className="size-4 text-theme-accent" />}>
            <div className="space-y-4">
              {invoice.revisions.map(revision => {
                return (
                  <div
                    key={revision.id}
                    className="overflow-hidden rounded-2xl border border-border bg-background">
                    <header className="flex flex-col gap-3 border-b border-border bg-surface-raised px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">
                            Revision #{revision.revisionNumber}
                          </p>

                          <StatusBadge status={revision.status} />
                        </div>

                        <p className="mt-2 text-base font-semibold text-foreground">{revision.title}</p>
                      </div>

                      {revision.status === 'PENDING' || revision.status === 'REJECTED' ? (
                        <AdminCancelRevisionButton revisionId={revision.id} />
                      ) : null}
                    </header>

                    <div className="grid gap-5 p-4 lg:grid-cols-[1fr_260px]">
                      <div>
                        <p className="text-sm leading-6 text-muted">{revision.explanation}</p>

                        {revision.clientResponse ? (
                          <div className="mt-4 rounded-xl border border-border bg-surface p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                              Client response
                            </p>

                            <p className="mt-2 text-sm leading-6 text-foreground">
                              {revision.clientResponse}
                            </p>
                          </div>
                        ) : null}

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <InformationCell label="Proposed by" value={revision.proposedBy.name} />

                          <InformationCell label="Proposed" value={formatDateTime(revision.createdAt)} />

                          {revision.acceptedBy ? (
                            <InformationCell label="Accepted by" value={revision.acceptedBy.name} />
                          ) : null}

                          {revision.rejectedBy ? (
                            <InformationCell label="Rejected by" value={revision.rejectedBy.name} />
                          ) : null}
                        </div>
                      </div>

                      <div className="rounded-xl border border-border bg-surface-muted/40 p-4">
                        <RevisionMoney
                          label="Total"
                          previous={revision.previousTotal}
                          proposed={revision.proposedTotal}
                          previousCurrency={revision.previousCurrency}
                          proposedCurrency={revision.proposedCurrency}
                        />

                        <RevisionMoney
                          label="Balance"
                          previous={revision.previousBalanceDue}
                          proposed={revision.proposedBalanceDue}
                          previousCurrency={revision.previousCurrency}
                          proposedCurrency={revision.proposedCurrency}
                        />

                        <div className="mt-4 border-t border-border pt-4">
                          <p className="text-xs text-muted">Amount already paid when proposed</p>

                          <p className="mt-1 text-sm font-semibold text-foreground">
                            {formatMoney(revision.amountPaidAtProposal, revision.previousCurrency)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ) : null}

        <Card
          title="Billing history"
          description="Invoice, agreement, revision and actual payment events in one chronological record."
          icon={<History className="size-4 text-theme-accent" />}>
          {history.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">No billing activity yet.</p>
          ) : (
            <div className="divide-y divide-border rounded-xl border border-border">
              {history.map(entry => {
                return <BillingHistoryRow key={entry.id} entry={entry} invoice={invoice} />;
              })}
            </div>
          )}
        </Card>

        {invoice.notes ? (
          <Card title="Invoice notes" description="Additional information attached to this record.">
            <p className="whitespace-pre-line text-sm leading-6 text-muted">{invoice.notes}</p>
          </Card>
        ) : null}
      </div>
    </main>
  );
}

function BillingHistoryRow({ entry, invoice }: { entry: BillingHistoryEntry; invoice: AdminInvoiceData }) {
  if (entry.type === 'ISSUED') {
    return (
      <HistoryRow
        title="Invoice issued"
        description={`${invoice.invoiceNumber} became client-visible.`}
        date={entry.date}
      />
    );
  }

  if (entry.type === 'PAYMENT') {
    return (
      <HistoryRow
        title={`Payment · ${formatStatus(entry.payment.status)}`}
        description={
          entry.payment.reference ??
          entry.payment.providerReference ??
          formatStatus(String(entry.payment.method))
        }
        value={formatMoney(entry.payment.amount, entry.payment.currency)}
        date={entry.date}
      />
    );
  }

  if (entry.type === 'APPROVAL_REQUESTED') {
    return (
      <HistoryRow
        title={`Invoice verification v${entry.approval.version} requested`}
        description={`Requested by ${entry.approval.requestedBy.name}.`}
        value={
          entry.approval.snapshot
            ? formatMoney(entry.approval.snapshot.total, entry.approval.snapshot.currency)
            : undefined
        }
        date={entry.date}
      />
    );
  }

  if (entry.type === 'APPROVAL_ACCEPTED') {
    return (
      <HistoryRow
        title={`Invoice verification v${entry.approval.version} accepted`}
        description={`Client${
          entry.approval.respondedBy ? ` · ${entry.approval.respondedBy.name}` : ''
        } confirmed the original invoice agreement.`}
        date={entry.date}
      />
    );
  }

  if (entry.type === 'APPROVAL_REJECTED') {
    return (
      <HistoryRow
        title={`Invoice verification v${entry.approval.version} rejected`}
        description={entry.approval.response ?? 'Client returned the original invoice for changes.'}
        date={entry.date}
      />
    );
  }

  if (entry.type === 'APPROVAL_CANCELLED') {
    return (
      <HistoryRow
        title={`Invoice verification v${entry.approval.version} closed`}
        description="The verification request was withdrawn before acceptance."
        date={entry.date}
      />
    );
  }

  if (entry.type === 'REVISION_PROPOSED') {
    return (
      <HistoryRow
        title={`Revision #${entry.revision.revisionNumber} proposed`}
        description={entry.revision.title}
        value={`${formatMoney(entry.revision.previousTotal, entry.revision.previousCurrency)} → ${formatMoney(
          entry.revision.proposedTotal,
          entry.revision.proposedCurrency
        )}`}
        date={entry.date}
      />
    );
  }

  if (entry.type === 'REVISION_ACCEPTED') {
    return (
      <HistoryRow
        title={`Revision #${entry.revision.revisionNumber} accepted`}
        description="Client accepted the updated billing obligation."
        date={entry.date}
      />
    );
  }

  if (entry.type === 'REVISION_REJECTED') {
    return (
      <HistoryRow
        title={`Revision #${entry.revision.revisionNumber} rejected`}
        description={entry.revision.clientResponse ?? 'Client returned the update for review.'}
        date={entry.date}
      />
    );
  }

  return (
    <HistoryRow
      title={`Revision #${entry.revision.revisionNumber} closed`}
      description="The proposed update was cancelled and the accepted invoice remained unchanged."
      date={entry.date}
    />
  );
}

function Card({
  title,
  description,
  icon,
  children
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-background">
      <header className="flex items-start justify-between gap-4 border-b border-border bg-surface-raised px-5 py-4">
        <div>
          <p className="text-base font-semibold text-foreground">{title}</p>

          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>

        {icon}
      </header>

      <div className="p-5">{children}</div>
    </section>
  );
}

function InformationCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">{label}</p>

      <p className="mt-1.5 text-sm font-medium leading-6 text-foreground">{value}</p>
    </div>
  );
}

function ItemValue({
  label,
  value,
  alignRight = false
}: {
  label: string;
  value: string;
  alignRight?: boolean;
}) {
  return (
    <div className={alignRight ? 'sm:text-right' : ''}>
      <p className="text-xs uppercase tracking-[0.06em] text-muted sm:hidden">{label}</p>

      <p className="mt-1 text-sm font-medium text-foreground sm:mt-0">{value}</p>
    </div>
  );
}

function TotalRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className={strong ? 'font-semibold text-foreground' : 'text-muted'}>{label}</span>

      <span className={strong ? 'font-semibold text-foreground' : 'font-medium text-foreground'}>
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status, formatted = false }: { status: string; formatted?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground">
      <span className="size-1.5 rounded-full bg-theme-accent" />

      {formatted ? status : formatStatus(status)}
    </span>
  );
}

function RevisionMoney({
  label,
  previous,
  proposed,
  previousCurrency,
  proposedCurrency
}: {
  label: string;
  previous: number;
  proposed: number;
  previousCurrency: string;
  proposedCurrency: string;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="text-xs text-muted">{label}</p>

      <p className="mt-1 text-sm text-muted line-through">{formatMoney(previous, previousCurrency)}</p>

      <p className="mt-1 text-base font-semibold text-foreground">
        {formatMoney(proposed, proposedCurrency)}
      </p>
    </div>
  );
}

function HistoryRow({
  title,
  description,
  value,
  date
}: {
  title: string;
  description: string;
  value?: string;
  date: Date;
}) {
  return (
    <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>

        <p className="mt-1 text-sm leading-5 text-muted">{description}</p>
      </div>

      <div className="shrink-0 sm:text-right">
        {value ? <p className="text-sm font-semibold text-foreground">{value}</p> : null}

        <p className="mt-1 text-xs text-muted">{formatDateTime(date)}</p>
      </div>
    </div>
  );
}
