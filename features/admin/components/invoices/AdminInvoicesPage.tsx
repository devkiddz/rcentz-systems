'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import { CircleDollarSign, FileClock, FilePlus2, FileText, ReceiptText, Search } from 'lucide-react';

import type {
  AdminInvoiceListItem,
  AdminInvoicesData
} from '@/features/admin/server/invoices/get-admin-invoices';

type AdminInvoicesPageProps = {
  data: AdminInvoicesData;
};

type InvoiceFilter = 'ALL' | 'OPEN' | 'OVERDUE' | 'PAID' | 'DRAFT';

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
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

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function AdminInvoicesPage({ data }: AdminInvoicesPageProps) {
  const [filter, setFilter] = useState<InvoiceFilter>('ALL');
  const [search, setSearch] = useState('');

  function handleSummaryFilter(nextFilter: InvoiceFilter) {
    setFilter(nextFilter);
    setSearch('');
  }

  const filteredInvoices = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return data.invoices.filter(invoice => {
      const matchesSearch =
        searchValue.length === 0 ||
        invoice.invoiceNumber.toLowerCase().includes(searchValue) ||
        invoice.client.displayName.toLowerCase().includes(searchValue) ||
        invoice.client.email?.toLowerCase().includes(searchValue) ||
        invoice.source.label.toLowerCase().includes(searchValue) ||
        invoice.items.some(item => {
          return item.name.toLowerCase().includes(searchValue);
        });

      if (!matchesSearch) {
        return false;
      }

      switch (filter) {
        case 'OPEN':
          return (
            invoice.balanceDue > 0 &&
            invoice.status !== 'PAID' &&
            invoice.status !== 'VOID' &&
            invoice.status !== 'CANCELLED' &&
            invoice.status !== 'REFUNDED'
          );

        case 'OVERDUE':
          return invoice.effectiveStatus === 'OVERDUE';

        case 'PAID':
          return invoice.status === 'PAID';

        case 'DRAFT':
          return invoice.status === 'DRAFT';

        case 'ALL':
        default:
          return true;
      }
    });
  }, [data.invoices, filter, search]);

  const filters: Array<{
    key: InvoiceFilter;
    label: string;
    count: number;
  }> = [
    {
      key: 'ALL',
      label: 'All',
      count: data.summary.total
    },
    {
      key: 'OPEN',
      label: 'Open',
      count: data.summary.open
    },
    {
      key: 'OVERDUE',
      label: 'Overdue',
      count: data.summary.overdue
    },
    {
      key: 'PAID',
      label: 'Paid',
      count: data.summary.paid
    },
    {
      key: 'DRAFT',
      label: 'Drafts',
      count: data.summary.drafts
    }
  ];

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[var(--section-max)] space-y-6">
        <section>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-theme-accent">Finance</p>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-[-0.04em] text-foreground sm:text-2xl">
                Invoice management
              </h1>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">
                Review client charges, payment position, outstanding balances and invoice status.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <p className="hidden text-xs text-muted sm:block">
                <span className="font-semibold text-foreground">{data.summary.total}</span> invoice
                {data.summary.total === 1 ? '' : 's'}
              </p>

              <Link
                href="/admin/invoices/new"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-xs font-semibold text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/40">
                <FilePlus2 aria-hidden="true" className="size-3.5" />
                Create invoice
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon="invoice"
            label="Total invoices"
            value={data.summary.total}
            note="All billing records"
            active={filter === 'ALL'}
            onClick={() => handleSummaryFilter('ALL')}
          />

          <SummaryCard
            icon="open"
            label="Open"
            value={data.summary.open}
            note="Balances still receivable"
            active={filter === 'OPEN'}
            onClick={() => handleSummaryFilter('OPEN')}
          />

          <SummaryCard
            icon="paid"
            label="Paid"
            value={data.summary.paid}
            note="Fully settled invoices"
            active={filter === 'PAID'}
            onClick={() => handleSummaryFilter('PAID')}
          />

          <SummaryCard
            icon="overdue"
            label="Overdue"
            value={data.summary.overdue}
            note="Past due obligations"
            active={filter === 'OVERDUE'}
            onClick={() => handleSummaryFilter('OVERDUE')}
          />
        </section>

        {data.totalsByCurrency.length > 0 ? (
          <section>
            <div>
              <p className="text-sm font-semibold text-foreground">Financial position</p>

              <p className="mt-1 text-xs text-muted">
                Currency totals are kept separate to avoid mixing financial values.
              </p>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {data.totalsByCurrency.map(position => {
                return <CurrencyPositionCard key={position.currency} position={position} />;
              })}
            </div>
          </section>
        ) : null}

        <section className="overflow-hidden rounded-[20px] border border-border bg-background">
          <div className="border-b border-border bg-surface-raised px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Invoice records</p>

                <p className="mt-1 text-xs text-muted">Search and review client billing records.</p>
              </div>

              <div className="relative w-full lg:max-w-[320px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />

                <input
                  type="search"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Invoice, client or item..."
                  className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-xs text-foreground outline-none placeholder:text-muted focus:border-foreground/30"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {filters.map(item => {
                const active = filter === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFilter(item.key)}
                    className={
                      active
                        ? 'inline-flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-foreground bg-foreground px-3 text-xs font-medium text-background'
                        : 'inline-flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-3 text-xs font-medium text-muted transition-colors hover:text-foreground'
                    }>
                    {item.label}

                    <span className={active ? 'text-background/60' : 'text-muted'}>{item.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {filteredInvoices.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center">
                <FileText className="mx-auto size-5 text-muted" />

                <p className="mt-3 text-xs font-semibold text-foreground">No matching invoices</p>

                <p className="mt-1 text-xs text-muted">Try another filter or search term.</p>
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {filteredInvoices.map(invoice => {
                  return <AdminInvoiceCard key={invoice.id} invoice={invoice} />;
                })}
              </div>
            )}
          </div>

          <div className="border-t border-border bg-surface-muted/40 px-5 py-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-muted">
                Showing {filteredInvoices.length} of {data.summary.total} invoice records.
              </p>

              <p className="text-xs uppercase tracking-[0.08em] text-muted">{formatStatus(filter)}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function AdminInvoiceCard({ invoice }: { invoice: AdminInvoiceListItem }) {
  const primaryItem = invoice.items[0] ?? null;

  return (
    <Link
      href={`/admin/invoices/${invoice.id}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-background transition-[border-color,transform] hover:-translate-y-0.5 hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/40">
      <div className="flex items-start justify-between gap-4 border-b border-border bg-surface-raised px-4 py-3.5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-foreground">
            {invoice.invoiceNumber}
          </p>

          <p className="mt-1 truncate text-xs text-muted">{invoice.client.displayName}</p>
        </div>

        <StatusBadge status={invoice.effectiveStatus} />
      </div>

      <div className="p-4">
        <div>
          <p className="text-xs uppercase tracking-[0.08em] text-muted">Billed for</p>

          <h2 className="mt-1.5 text-sm font-semibold text-foreground">
            {primaryItem?.name ?? invoice.source.label}
          </h2>

          <p className="mt-1 text-xs text-muted">
            {invoice.source.label}
            {' · '}
            {invoice.itemCount} item{invoice.itemCount === 1 ? '' : 's'}
            {' · '}
            {invoice.paymentCount} payment{invoice.paymentCount === 1 ? '' : 's'}
          </p>
        </div>

        {primaryItem?.description ? (
          <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted">{primaryItem.description}</p>
        ) : null}

        <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-xl border border-border">
          <MoneyCell label="Total" value={formatMoney(invoice.total, invoice.currency)} />

          <MoneyCell label="Paid" value={formatMoney(invoice.amountPaid, invoice.currency)} />

          <MoneyCell label="Balance" value={formatMoney(invoice.balanceDue, invoice.currency)} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <InformationCell label="Issued" value={formatDate(invoice.issuedAt ?? invoice.createdAt)} />

          <InformationCell label="Due" value={formatDate(invoice.dueAt)} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-border bg-surface-muted/40 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-foreground">
            {invoice.client.email ?? 'No client email'}
          </p>

          {invoice.source.reference ? (
            <p className="mt-0.5 truncate text-xs text-muted">Ref: {invoice.source.reference}</p>
          ) : null}
        </div>

        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-theme-accent">
          View invoice
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </span>
      </div>
    </Link>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  note,
  active,
  onClick
}: {
  icon: 'invoice' | 'open' | 'paid' | 'overdue';
  label: string;
  value: number;
  note: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'group w-full cursor-pointer overflow-hidden rounded-2xl border bg-background text-left',
        'transition-[border-color,transform] duration-200',
        'hover:-translate-y-0.5 hover:border-foreground/25',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/40',
        active ? 'border-foreground/30' : 'border-border'
      ].join(' ')}>
      <div
        className={[
          'flex items-center justify-between gap-3 border-b px-4 py-3',
          'transition-colors duration-200',
          active ? 'border-foreground/20 bg-surface-muted' : 'border-border bg-surface-raised'
        ].join(' ')}>
        <div className="flex items-center gap-2">
          {active ? <span className="size-1.5 shrink-0 rounded-full bg-theme-accent" /> : null}

          <p className="text-xs font-semibold text-foreground">{label}</p>
        </div>

        <SummaryIcon icon={icon} />
      </div>

      <div className="px-4 py-4">
        <p className="text-xl font-semibold tracking-[-0.04em] text-foreground">{value}</p>

        <p className="mt-1 text-xs text-muted">{note}</p>
      </div>

      <div
        className={[
          'border-t px-4 py-2.5 transition-colors duration-200',
          active ? 'border-foreground/15 bg-surface-muted' : 'border-border bg-surface-muted/40'
        ].join(' ')}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.08em] text-muted">
            {active ? 'Currently viewing' : 'View invoices'}
          </p>

          <span
            className={
              active
                ? 'text-xs font-semibold text-theme-accent'
                : 'text-xs text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-foreground'
            }>
            →
          </span>
        </div>
      </div>
    </button>
  );
}

function SummaryIcon({ icon }: { icon: 'invoice' | 'open' | 'paid' | 'overdue' }) {
  switch (icon) {
    case 'open':
      return <FileClock className="size-3.5 text-theme-accent" />;

    case 'paid':
      return <CircleDollarSign className="size-3.5 text-theme-accent" />;

    case 'overdue':
      return <ReceiptText className="size-3.5 text-theme-accent" />;

    case 'invoice':
    default:
      return <FileText className="size-3.5 text-theme-accent" />;
  }
}

function CurrencyPositionCard({ position }: { position: AdminInvoicesData['totalsByCurrency'][number] }) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-border bg-background">
      <div className="border-b border-border bg-surface-raised px-4 py-3">
        <p className="text-xs font-semibold text-foreground">{position.currency} position</p>
      </div>

      <div className="grid grid-cols-2">
        <PositionValue label="Billed" value={formatMoney(position.billed, position.currency)} />

        <PositionValue label="Paid" value={formatMoney(position.paid, position.currency)} />

        <PositionValue label="Outstanding" value={formatMoney(position.outstanding, position.currency)} />

        <PositionValue label="Overdue" value={formatMoney(position.overdue, position.currency)} />
      </div>

      <div className="border-t border-border bg-surface-muted/40 px-4 py-2.5">
        <p className="text-xs text-muted">Values are calculated from current invoice records.</p>
      </div>
    </div>
  );
}

function PositionValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-r border-border px-4 py-3 even:border-r-0 last:border-b-0">
      <p className="text-xs uppercase tracking-[0.08em] text-muted">{label}</p>

      <p className="mt-1 text-xs font-semibold text-foreground">{value}</p>
    </div>
  );
}

function MoneyCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-r border-border px-3 py-3 last:border-r-0">
      <p className="text-xs uppercase tracking-[0.08em] text-muted">{label}</p>

      <p className="mt-1 truncate text-xs font-semibold text-foreground">{value}</p>
    </div>
  );
}

function InformationCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2.5">
      <p className="text-xs uppercase tracking-[0.08em] text-muted">{label}</p>

      <p className="mt-1 text-xs font-medium text-foreground">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const attention = status === 'OVERDUE' || status === 'CANCELLED' || status === 'VOID';

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1">
      <span
        className={attention ? 'size-1.5 rounded-full bg-rose-500' : 'size-1.5 rounded-full bg-theme-accent'}
      />

      <span className="text-xs font-semibold text-foreground">{formatStatus(status)}</span>
    </span>
  );
}
