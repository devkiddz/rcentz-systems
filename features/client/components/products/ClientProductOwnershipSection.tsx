
import {
  Box,
  CalendarDays,
  Clock3,
  CreditCard,
  Download,
  FileDown,
  FileText,
  MapPin,
  PackageCheck,
  ReceiptText,
  Truck
} from 'lucide-react';

import type { ClientProductOwnership } from '@/features/client/server/products/get-client-product-ownership';

type ClientProductOwnershipSectionProps = {
  productType: string;

  ownership: ClientProductOwnership;
};

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',

    currency,

    maximumFractionDigits: 0
  }).format(amount);
}

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatDate(value: Date | null) {
  if (!value) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(value);
}

function formatDateTime(value: Date | null) {
  if (!value) {
    return 'Never';
  }

  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',

    hour: '2-digit',
    minute: '2-digit'
  }).format(value);
}

function formatFileSize(bytes: number | null) {
  if (!bytes || bytes <= 0) {
    return 'Not specified';
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ClientProductOwnershipSection({
  productType,
  ownership
}: ClientProductOwnershipSectionProps) {
  const purchase = ownership.latestPurchase;

  if (!purchase) {
    return null;
  }

  const isDigital = productType === 'DIGITAL';

  return (
    <section className="mt-8 overflow-hidden rounded-[22px] border border-border bg-background">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <PackageCheck aria-hidden="true" className="size-4 text-theme-accent" />

            <p className="text-[10px] font-semibold uppercase tracking-[0.11em] text-muted">
              Ownership & Delivery
            </p>
          </div>

          <h2 className="mt-2 text-lg font-semibold tracking-[-0.035em] text-foreground">
            {ownership.owned ? 'This product belongs to your account' : 'Purchase activity'}
          </h2>

          <p className="mt-1 text-[10px] text-muted">
            Purchase, payment and delivery records for this product.
          </p>
        </div>

        <span
          className={
            ownership.owned
              ? 'w-fit rounded-full bg-theme-accent-faint px-3 py-1.5 text-[9px] font-semibold text-theme-accent'
              : 'w-fit rounded-full bg-amber-500/10 px-3 py-1.5 text-[9px] font-semibold text-amber-500'
          }>
          {ownership.owned ? 'Owned' : 'Pending'}
        </span>
      </div>

      <div className="grid border-b border-border sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCell
          icon={ReceiptText}
          label="Order"
          value={purchase.orderNumber}
          note={formatStatus(String(purchase.orderStatus))}
        />

        <SummaryCell
          icon={CalendarDays}
          label="Purchased"
          value={formatDate(purchase.purchasedAt)}
          note={`${purchase.quantity} unit${purchase.quantity === 1 ? '' : 's'}`}
        />

        <SummaryCell
          icon={CreditCard}
          label="Payment"
          value={
            purchase.payment
              ? formatStatus(String(purchase.payment.status))
              : purchase.invoice
                ? formatStatus(String(purchase.invoice.status))
                : 'Not recorded'
          }
          note={purchase.payment ? formatStatus(String(purchase.payment.method)) : 'Payment record'}
        />

        <SummaryCell
          icon={isDigital ? FileDown : Truck}
          label={isDigital ? 'Access' : 'Delivery'}
          value={
            isDigital
              ? purchase.digitalDelivery
                ? formatStatus(String(purchase.digitalDelivery.status))
                : 'Not delivered'
              : purchase.fulfillment
                ? formatStatus(String(purchase.fulfillment.status))
                : 'Not started'
          }
          note={isDigital ? 'Digital delivery' : 'Order fulfillment'}
        />
      </div>

      <div className="grid lg:grid-cols-2">
        <PurchasePaymentPanel purchase={purchase} />

        {isDigital ? (
          <DigitalDeliveryPanel purchase={purchase} />
        ) : (
          <PhysicalDeliveryPanel purchase={purchase} />
        )}
      </div>

      <PurchaseHistory history={ownership.history} />
    </section>
  );
}

function PurchasePaymentPanel({ purchase }: { purchase: ClientProductOwnership['history'][number] }) {
  return (
    <div className="border-b border-border p-5 lg:border-b-0 lg:border-r">
      <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">Purchase & Payment</p>

      <div className="mt-4 space-y-3">
        <DetailRow label="Product total" value={formatMoney(purchase.purchaseAmount, purchase.currency)} />

        <DetailRow label="Order status" value={formatStatus(String(purchase.orderStatus))} />

        <DetailRow label="Variant" value={purchase.item?.variantName ?? 'Standard'} />

        {purchase.invoice ? (
          <>
            <DetailRow label="Invoice" value={purchase.invoice.invoiceNumber} />

            <DetailRow
              label="Paid"
              value={formatMoney(purchase.invoice.amountPaid, purchase.invoice.currency)}
            />

            <DetailRow
              label="Balance"
              value={formatMoney(purchase.invoice.balanceDue, purchase.invoice.currency)}
            />
          </>
        ) : null}

        {purchase.payment ? (
          <>
            <DetailRow label="Payment method" value={formatStatus(String(purchase.payment.method))} />

            <DetailRow label="Payment date" value={formatDate(purchase.payment.paidAt)} />

            {purchase.payment.reference ? (
              <DetailRow label="Reference" value={purchase.payment.reference} />
            ) : null}
          </>
        ) : null}

        {purchase.billingLocation ? (
          <div className="flex items-start gap-2 border-t border-border pt-3">
            <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-theme-accent" />

            <div>
              <p className="text-[8px] uppercase tracking-[0.08em] text-muted">Billing location</p>

              <p className="mt-1 text-[10px] leading-4 text-foreground">{purchase.billingLocation}</p>
            </div>
          </div>
        ) : null}

        {purchase.invoice?.pdfUrl ? (
          <a
            href={purchase.invoice.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-theme-accent">
            <FileText aria-hidden="true" className="size-3.5" />
            View invoice
          </a>
        ) : null}
      </div>
    </div>
  );
}

function DigitalDeliveryPanel({ purchase }: { purchase: ClientProductOwnership['history'][number] }) {
  const delivery = purchase.digitalDelivery;

  if (!delivery) {
    return (
      <div className="p-5">
        <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">Digital Delivery</p>

        <div className="mt-4 rounded-[16px] border border-dashed border-border p-5">
          <Clock3 aria-hidden="true" className="size-4 text-muted" />

          <p className="mt-3 text-[11px] font-medium text-foreground">Delivery not available yet</p>

          <p className="mt-1 text-[9px] leading-4 text-muted">
            Digital access will appear here once the order is fulfilled.
          </p>
        </div>
      </div>
    );
  }

  const expired = delivery.expiresAt !== null && delivery.expiresAt < new Date();

  const canDownload =
    delivery.downloadReady && !expired && ['AVAILABLE', 'DOWNLOADED'].includes(String(delivery.status));

  return (
    <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">Digital Delivery</p>

          <p className="mt-1 text-[11px] font-medium text-foreground">Product access</p>
        </div>

        <span className="rounded-full bg-theme-accent-faint px-2.5 py-1 text-[8px] font-semibold text-theme-accent">
          {formatStatus(String(delivery.status))}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <MiniMetric label="Version" value={delivery.version ?? 'Current'} />

        <MiniMetric label="Format" value={delivery.fileType ?? 'Digital'} />

        <MiniMetric label="Downloads" value={String(delivery.downloadCount)} />

        <MiniMetric label="File size" value={formatFileSize(delivery.fileSize)} />
      </div>

      <div className="mt-4 space-y-3 border-t border-border pt-4">
        <DetailRow label="Delivered" value={formatDate(delivery.deliveredAt)} />

        <DetailRow label="Last download" value={formatDateTime(delivery.lastDownloadedAt)} />

        <DetailRow
          label="Access expires"
          value={delivery.expiresAt ? formatDate(delivery.expiresAt) : 'No expiry'}
        />

        <DetailRow label="Delivered to" value={purchase.customer.email ?? 'Your Rcentz account'} />
      </div>

      {canDownload ? (
        <a
          href={`/api/products/deliveries/${delivery.id}/download`}
          className="mt-5 inline-flex h-9 items-center gap-2 rounded-xl bg-theme-accent px-4 text-[10px] font-semibold text-white transition-opacity hover:opacity-90">
          <Download aria-hidden="true" className="size-3.5" />
          Download product
        </a>
      ) : (
        <div className="mt-5 rounded-xl border border-border bg-surface-raised px-3 py-3">
          <p className="text-[9px] font-medium text-muted">
            {expired ? 'Download access has expired.' : 'Download file is not configured yet.'}
          </p>
        </div>
      )}
    </div>
  );
}

function PhysicalDeliveryPanel({ purchase }: { purchase: ClientProductOwnership['history'][number] }) {
  const fulfillment = purchase.fulfillment;

  return (
    <div className="p-5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">Delivery & Fulfillment</p>

      {fulfillment ? (
        <div className="mt-4 space-y-3">
          <DetailRow label="Status" value={formatStatus(String(fulfillment.status))} />

          <DetailRow label="Carrier" value={fulfillment.carrier ?? 'Not assigned'} />

          <DetailRow label="Tracking" value={fulfillment.trackingNumber ?? 'Not available'} />

          <DetailRow label="Shipped" value={formatDate(fulfillment.shippedAt)} />

          <DetailRow label="Delivered" value={formatDate(fulfillment.deliveredAt)} />

          {fulfillment.deliveryLocation ? (
            <div className="flex items-start gap-2 border-t border-border pt-3">
              <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-theme-accent" />

              <div>
                <p className="text-[8px] uppercase tracking-[0.08em] text-muted">Delivery location</p>

                <p className="mt-1 text-[10px] leading-4 text-foreground">{fulfillment.deliveryLocation}</p>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 rounded-[16px] border border-dashed border-border p-5">
          <Box aria-hidden="true" className="size-4 text-muted" />

          <p className="mt-3 text-[11px] font-medium text-foreground">Fulfillment not started</p>

          <p className="mt-1 text-[9px] leading-4 text-muted">
            Shipping and tracking information will appear here.
          </p>
        </div>
      )}
    </div>
  );
}

function PurchaseHistory({ history }: { history: ClientProductOwnership['history'] }) {
  if (history.length === 0) {
    return null;
  }

  return (
    <details className="group border-t border-border">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
        <div>
          <p className="text-[10px] font-semibold text-foreground">Purchase history</p>

          <p className="mt-1 text-[9px] text-muted">
            {history.length} order
            {history.length === 1 ? '' : 's'} containing this product
          </p>
        </div>

        <span className="text-[9px] font-medium text-theme-accent">View records</span>
      </summary>

      <div className="border-t border-border px-5 py-2">
        {history.map(purchase => (
          <div
            key={purchase.id}
            className="flex flex-col gap-2 border-b border-border py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold text-foreground">{purchase.orderNumber}</p>

              <p className="mt-1 text-[9px] text-muted">
                {formatDate(purchase.purchasedAt)}
                {' · '}
                {formatStatus(String(purchase.orderStatus))}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-[10px] font-semibold text-foreground">
                {formatMoney(purchase.purchaseAmount, purchase.currency)}
              </p>

              <p className="mt-1 text-[8px] text-muted">
                {purchase.payment ? formatStatus(String(purchase.payment.status)) : 'No payment record'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}

function SummaryCell({
  icon: Icon,
  label,
  value,
  note
}: {
  icon: typeof ReceiptText;

  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="border-b border-border px-5 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <div className="flex items-center gap-2 text-muted">
        <Icon aria-hidden="true" className="size-3.5 text-theme-accent" />

        <span className="text-[8px] uppercase tracking-[0.08em]">{label}</span>
      </div>

      <p className="mt-2 truncate text-[11px] font-semibold text-foreground">{value}</p>

      <p className="mt-1 truncate text-[8px] text-muted">{note}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-border bg-surface-raised px-3 py-3">
      <p className="text-[8px] uppercase tracking-[0.08em] text-muted">{label}</p>

      <p className="mt-1 truncate text-[10px] font-semibold text-foreground">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[9px] text-muted">{label}</span>

      <span className="max-w-[65%] break-words text-right text-[9px] font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}
