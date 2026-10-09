'use client';

import { useState, useTransition } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ArrowLeft, CircleDollarSign, FilePenLine, Plus, Save, Trash2 } from 'lucide-react';

import { updateAdminInvoice } from '@/features/admin/server/invoices/invoice-lifecycle';

import type { AdminInvoiceData } from '@/features/admin/server/invoices/get-admin-invoice';
import type { AdminInvoiceEditorOptions } from '@/features/admin/server/invoices/get-admin-invoice-editor-options';

type AdminInvoiceEditorProps = {
  invoice: AdminInvoiceData;
  options: AdminInvoiceEditorOptions;
};

type EditorItem = {
  id: string | null;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  serviceId: string | null;
};

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(amount);
}

function toDateInput(value: Date | null) {
  if (!value) {
    return '';
  }

  return value.toISOString().slice(0, 10);
}

export function AdminInvoiceEditor({ invoice, options }: AdminInvoiceEditorProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [clientId, setClientId] = useState(invoice.client.id ?? '');
  const [projectId, setProjectId] = useState(invoice.association.project?.id ?? '');

  const [currency, setCurrency] = useState(invoice.currency);
  const [dueAt, setDueAt] = useState(toDateInput(invoice.dueAt));
  const [discount, setDiscount] = useState(invoice.discount);
  const [tax, setTax] = useState(invoice.tax);
  const [notes, setNotes] = useState(invoice.notes ?? '');

  const [revisionTitle, setRevisionTitle] = useState('');
  const [revisionExplanation, setRevisionExplanation] = useState('');

  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState<EditorItem[]>(
    invoice.items.map(item => {
      return {
        id: item.id,
        name: item.name,
        description: item.description ?? '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        serviceId: item.serviceId
      };
    })
  );

  const availableProjects = options.projects.filter(project => {
    return project.clientId === clientId;
  });

  const subtotal = roundMoney(
    items.reduce((sum, item) => {
      return sum + item.quantity * item.unitPrice;
    }, 0)
  );

  const total = Math.max(roundMoney(subtotal - discount + tax), 0);

  const hasFinancialChange = (() => {
    if (currency !== invoice.currency) {
      return true;
    }

    if (roundMoney(discount) !== roundMoney(invoice.discount)) {
      return true;
    }

    if (roundMoney(tax) !== roundMoney(invoice.tax)) {
      return true;
    }

    if (dueAt !== toDateInput(invoice.dueAt)) {
      return true;
    }

    if (items.length !== invoice.items.length) {
      return true;
    }

    for (let index = 0; index < items.length; index += 1) {
      const current = items[index];
      const original = invoice.items[index];

      if (
        current.id !== original.id ||
        current.name.trim() !== original.name ||
        current.description.trim() !== (original.description ?? '') ||
        roundMoney(current.quantity) !== roundMoney(original.quantity) ||
        roundMoney(current.unitPrice) !== roundMoney(original.unitPrice)
      ) {
        return true;
      }
    }

    return false;
  })();

  const requiresRevision = invoice.status !== 'DRAFT' && hasFinancialChange;

  const hasValidItems =
    items.length > 0 &&
    items.every(item => {
      return (
        item.name.trim().length > 0 &&
        Number.isFinite(item.quantity) &&
        item.quantity > 0 &&
        Number.isFinite(item.unitPrice) &&
        item.unitPrice >= 0
      );
    });

  const canSave =
    clientId.length > 0 && /^[A-Z]{3}$/.test(currency) && hasValidItems && total > 0 && !pending;

  function addItem() {
    setItems(current => {
      return [
        ...current,
        {
          id: null,
          name: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          serviceId: null
        }
      ];
    });
  }

  function removeItem(index: number) {
    setItems(current => {
      if (current.length === 1) {
        return current;
      }

      return current.filter((_, itemIndex) => {
        return itemIndex !== index;
      });
    });
  }

  function updateItem(index: number, values: Partial<EditorItem>) {
    setItems(current => {
      return current.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        return {
          ...item,
          ...values
        };
      });
    });
  }

  function handleClientChange(nextClientId: string) {
    setClientId(nextClientId);

    const projectStillValid = options.projects.some(project => {
      return project.id === projectId && project.clientId === nextClientId;
    });

    if (!projectStillValid) {
      setProjectId('');
    }
  }

  function handleSave() {
    setError(null);

    startTransition(async () => {
      const result = await updateAdminInvoice({
        invoiceId: invoice.id,
        clientId,
        projectId: projectId || null,

        currency,
        dueAt: dueAt || null,
        discount,
        tax,
        notes,

        revisionTitle,
        revisionExplanation,

        items: items.map(item => {
          return {
            id: item.id,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            serviceId: item.serviceId
          };
        })
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push(`/admin/invoices/${invoice.id}`);
      router.refresh();
    });
  }

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-[var(--section-max)] space-y-6">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href={`/admin/invoices/${invoice.id}`}
              className="inline-flex items-center gap-2 text-xs font-medium text-muted transition-colors hover:text-foreground">
              <ArrowLeft className="size-4" />
              Back to invoice
            </Link>

            <p className="mt-5 font-mono text-xs uppercase tracking-[0.14em] text-theme-accent">
              Finance / Edit invoice
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-3xl">
              {invoice.invoiceNumber}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Update invoice context, services and billing terms. Financial changes to an issued invoice
              require client approval.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background px-3 py-2">
            <span className="size-2 rounded-full bg-theme-accent" />
            <span className="text-xs font-semibold text-foreground">
              {invoice.status.replaceAll('_', ' ')}
            </span>
          </div>
        </section>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-5">
            <EditorSection
              title="Invoice context"
              description="Control the billed client and optional project relationship."
              icon={<FilePenLine className="size-4 text-theme-accent" />}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Client">
                  <select
                    value={clientId}
                    disabled={invoice.status !== 'DRAFT'}
                    onChange={event => {
                      handleClientChange(event.target.value);
                    }}
                    className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none disabled:cursor-not-allowed disabled:opacity-60">
                    <option value="">Select client</option>

                    {options.clients.map(client => {
                      return (
                        <option key={client.id} value={client.id} disabled={client.status !== 'ACTIVE'}>
                          {client.displayName} · {client.email}
                        </option>
                      );
                    })}
                  </select>
                </Field>

                <Field label="Project">
                  <select
                    value={projectId}
                    onChange={event => {
                      setProjectId(event.target.value);
                    }}
                    className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none">
                    <option value="">No project attached</option>

                    {availableProjects.map(project => {
                      return (
                        <option key={project.id} value={project.id}>
                          {project.name} · {project.status.replaceAll('_', ' ')}
                        </option>
                      );
                    })}
                  </select>
                </Field>
              </div>
            </EditorSection>

            <EditorSection
              title="Invoice items"
              description="Titles remain completely custom even when an item is associated with a Rcentz service."
              icon={<CircleDollarSign className="size-4 text-theme-accent" />}
              action={
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-surface">
                  <Plus className="size-3.5" />
                  Add item
                </button>
              }>
              <div className="space-y-4">
                {items.map((item, index) => {
                  const lineTotal = roundMoney(item.quantity * item.unitPrice);

                  return (
                    <div
                      key={item.id ?? `new-${index}`}
                      className="overflow-hidden rounded-2xl border border-border bg-background">
                      <header className="flex items-center justify-between gap-4 border-b border-border bg-surface-raised px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Line item {index + 1}</p>

                          <p className="mt-1 text-xs text-muted">
                            {item.serviceId ? 'Associated service' : 'Custom billing item'}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={items.length === 1}
                          onClick={() => {
                            removeItem(index);
                          }}
                          className="flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label={`Remove line item ${index + 1}`}>
                          <Trash2 className="size-4" />
                        </button>
                      </header>

                      <div className="grid gap-4 p-4 sm:grid-cols-2">
                        <Field label="Title">
                          <input
                            value={item.name}
                            onChange={event => {
                              updateItem(index, {
                                name: event.target.value
                              });
                            }}
                            placeholder="Custom API integration"
                            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted"
                          />
                        </Field>

                        <Field label="Associated service">
                          <select
                            value={item.serviceId ?? ''}
                            onChange={event => {
                              updateItem(index, {
                                serviceId: event.target.value || null
                              });
                            }}
                            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none">
                            <option value="">No service association</option>

                            {options.services.map(service => {
                              return (
                                <option key={service.id} value={service.id}>
                                  {service.name}
                                </option>
                              );
                            })}
                          </select>
                        </Field>

                        <Field label="Quantity">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={item.quantity}
                            onChange={event => {
                              updateItem(index, {
                                quantity: Number(event.target.value)
                              });
                            }}
                            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none"
                          />
                        </Field>

                        <Field label={`Unit price (${currency})`}>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={event => {
                              updateItem(index, {
                                unitPrice: Number(event.target.value)
                              });
                            }}
                            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none"
                          />
                        </Field>

                        <div className="sm:col-span-2">
                          <Field label="Description">
                            <textarea
                              rows={3}
                              value={item.description}
                              onChange={event => {
                                updateItem(index, {
                                  description: event.target.value
                                });
                              }}
                              placeholder="Describe exactly what this charge covers."
                              className="w-full resize-y rounded-xl border border-border bg-background px-3 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted"
                            />
                          </Field>
                        </div>
                      </div>

                      <footer className="flex items-center justify-between border-t border-border bg-surface-muted/40 px-4 py-3">
                        <span className="text-xs text-muted">Line total</span>

                        <span className="text-sm font-semibold text-foreground">
                          {formatMoney(lineTotal, currency)}
                        </span>
                      </footer>
                    </div>
                  );
                })}
              </div>
            </EditorSection>

            <EditorSection
              title="Billing terms"
              description="Financial changes after issuance become a proposed revision rather than silently overwriting the client's invoice.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Currency">
                  <select
                    value={currency}
                    onChange={event => {
                      setCurrency(event.target.value);
                    }}
                    className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none">
                    <option value="NGN">NGN</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                    <option value="EUR">EUR</option>
                  </select>
                </Field>

                <Field label="Due date">
                  <input
                    type="date"
                    value={dueAt}
                    onChange={event => {
                      setDueAt(event.target.value);
                    }}
                    className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none"
                  />
                </Field>

                <Field label="Discount">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={event => {
                      setDiscount(Number(event.target.value));
                    }}
                    className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none"
                  />
                </Field>

                <Field label="Tax">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={tax}
                    onChange={event => {
                      setTax(Number(event.target.value));
                    }}
                    className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none"
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Invoice notes">
                    <textarea
                      rows={4}
                      value={notes}
                      onChange={event => {
                        setNotes(event.target.value);
                      }}
                      className="w-full resize-y rounded-xl border border-border bg-background px-3 py-3 text-sm leading-6 text-foreground outline-none"
                    />
                  </Field>
                </div>
              </div>
            </EditorSection>

            {requiresRevision ? (
              <EditorSection
                title="Payment update explanation"
                description="Required because this change alters the financial terms already issued to the client.">
                <div className="space-y-4">
                  <Field label="Revision title · Required">
                    <input
                      value={revisionTitle}
                      onChange={event => {
                        setRevisionTitle(event.target.value);
                      }}
                      placeholder="Correct duplicated maintenance charge"
                      className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted"
                    />
                  </Field>

                  <Field label="Explanation · Required">
                    <textarea
                      rows={5}
                      value={revisionExplanation}
                      onChange={event => {
                        setRevisionExplanation(event.target.value);
                      }}
                      placeholder="Explain clearly what changed and why the client's payment obligation is being updated."
                      className="w-full resize-y rounded-xl border border-border bg-background px-3 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted"
                    />
                  </Field>
                </div>
              </EditorSection>
            ) : null}
          </div>

          <aside className="overflow-hidden rounded-2xl border border-border bg-background xl:sticky xl:top-5">
            <header className="border-b border-border bg-surface-raised px-5 py-4">
              <p className="text-xs font-semibold text-foreground">Invoice position</p>

              <p className="mt-1 text-xs text-muted">Current editor calculation</p>
            </header>

            <div className="space-y-3 p-5">
              <SummaryRow label="Subtotal" value={formatMoney(subtotal, currency)} />

              <SummaryRow label="Discount" value={`-${formatMoney(discount, currency)}`} />

              <SummaryRow label="Tax" value={formatMoney(tax, currency)} />

              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted">Proposed total</p>

                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                  {formatMoney(total, currency)}
                </p>
              </div>

              {invoice.status !== 'DRAFT' ? (
                <div className="rounded-xl border border-border bg-surface-muted/40 p-4">
                  <p className="text-xs text-muted">Current accepted total</p>

                  <p className="mt-1 text-base font-semibold text-foreground">
                    {formatMoney(invoice.total, invoice.currency)}
                  </p>

                  <p className="mt-3 text-xs leading-5 text-muted">
                    {requiresRevision
                      ? 'Saving will create a client approval request. The current invoice stays authoritative until accepted.'
                      : 'No financial revision is currently detected.'}
                  </p>
                </div>
              ) : null}

              {error ? (
                <div className="rounded-xl border border-red-500/30 p-4 text-sm leading-5 text-red-600 dark:text-red-400">
                  {error}
                </div>
              ) : null}
            </div>

            <footer className="space-y-2 border-t border-border bg-surface-muted/40 p-4">
              <button
                type="button"
                disabled={!canSave}
                onClick={handleSave}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                <Save className="size-4" />
                {pending ? 'Saving...' : requiresRevision ? 'Send Payment Update' : 'Save Changes'}
              </button>

              <Link
                href={`/admin/invoices/${invoice.id}`}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-medium text-muted transition-colors hover:text-foreground">
                Cancel
              </Link>
            </footer>
          </aside>
        </div>
      </div>
    </main>
  );
}

function EditorSection({
  title,
  description,
  icon,
  action,
  children
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-background">
      <header className="flex items-center justify-between gap-4 border-b border-border bg-surface-raised px-5 py-4">
        <div>
          <p className="text-base font-semibold text-foreground">{title}</p>

          <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
        </div>

        {action ?? icon}
      </header>

      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-muted">{label}</span>

      {children}
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-muted">{label}</span>

      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
