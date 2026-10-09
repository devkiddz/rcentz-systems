'use client';

import { useActionState, useState } from 'react';

import Link from 'next/link';

import { ArrowLeft, FileText, Plus, Save, Trash2, UserRound } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import {
  createAdminInvoice,
  type CreateAdminInvoiceState
} from '@/features/admin/server/invoices/create-admin-invoice';

type ClientOption = {
  id: string;
  name: string;
  email: string;
  companyName: string | null;
  phone: string | null;
  address: string | null;
};

type DraftLineItem = {
  id: string;
  name: string;
  description: string;
  quantity: string;
  unitPrice: string;
};

type AdminInvoiceBuilderProps = {
  clients: ClientOption[];
};

const initialState: CreateAdminInvoiceState = {
  error: null
};

const initialLineItem: DraftLineItem = {
  id: 'line-1',
  name: '',
  description: '',
  quantity: '1',
  unitPrice: ''
};

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function getNumericValue(value: string) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return 0;
  }

  return number;
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(value);
}

export function AdminInvoiceBuilder({ clients }: AdminInvoiceBuilderProps) {
  const [state, formAction, pending] = useActionState(createAdminInvoice, initialState);

  const [clientId, setClientId] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [discount, setDiscount] = useState('0');
  const [tax, setTax] = useState('0');
  const [items, setItems] = useState<DraftLineItem[]>([initialLineItem]);

  const selectedClient =
    clients.find(client => {
      return client.id === clientId;
    }) ?? null;

  const subtotal = roundMoney(
    items.reduce((sum, item) => {
      const quantity = getNumericValue(item.quantity);
      const unitPrice = getNumericValue(item.unitPrice);

      return sum + quantity * unitPrice;
    }, 0)
  );

  const discountAmount = roundMoney(getNumericValue(discount));

  const taxAmount = roundMoney(getNumericValue(tax));

  const total = Math.max(roundMoney(subtotal - discountAmount + taxAmount), 0);

  function addLineItem() {
    setItems(current => {
      return [
        ...current,
        {
          id: crypto.randomUUID(),
          name: '',
          description: '',
          quantity: '1',
          unitPrice: ''
        }
      ];
    });
  }

  function removeLineItem(itemId: string) {
    setItems(current => {
      if (current.length === 1) {
        return current;
      }

      return current.filter(item => {
        return item.id !== itemId;
      });
    });
  }

  function updateLineItem(
    itemId: string,
    field: 'name' | 'description' | 'quantity' | 'unitPrice',
    value: string
  ) {
    setItems(current => {
      return current.map(item => {
        if (item.id !== itemId) {
          return item;
        }

        return {
          ...item,
          [field]: value
        };
      });
    });
  }

  return (
    <form action={formAction}>
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(
          items.map(item => {
            return {
              name: item.name,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice
            };
          })
        )}
      />

      <div className="mx-auto w-full max-w-[var(--section-max)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/admin/invoices"
              className="inline-flex items-center gap-2 text-xs font-medium text-muted transition-colors hover:text-foreground">
              <ArrowLeft className="size-3.5" />
              Back to invoices
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-1.5 text-xs font-medium text-muted">
              <span className="size-1.5 rounded-full bg-muted" />
              Draft invoice
            </div>
          </div>

          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 space-y-5">
              <section className="overflow-hidden rounded-2xl border border-border bg-surface">
                <header className="flex items-center gap-3 border-b border-border bg-surface-raised px-4 py-4 sm:px-5">
                  <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-background">
                    <UserRound className="size-4 text-theme-accent" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Client</h2>
                    <p className="mt-0.5 text-xs text-muted">
                      Select the account this invoice belongs to.
                    </p>
                  </div>
                </header>

                <div className="p-4 sm:p-5">
                  <label className="block">
                    <span className="mb-2 block text-xs font-medium text-muted">Client account</span>

                    <select
                      name="clientId"
                      value={clientId}
                      onChange={event => {
                        setClientId(event.target.value);
                      }}
                      required
                      className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground outline-none transition-colors focus:border-foreground/30 focus:ring-2 focus:ring-theme-accent/20">
                      <option value="">Select client</option>

                      {clients.map(client => {
                        return (
                          <option key={client.id} value={client.id}>
                            {client.companyName ? `${client.companyName} — ${client.name}` : client.name}
                          </option>
                        );
                      })}
                    </select>
                  </label>

                  {selectedClient ? (
                    <div className="mt-4 grid gap-3 rounded-xl border border-border bg-surface-muted p-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.12em] text-muted">Contact</p>
                        <p className="mt-1 text-xs font-medium text-foreground">{selectedClient.name}</p>
                        <p className="mt-0.5 text-xs text-muted">{selectedClient.email}</p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.12em] text-muted">Billing profile</p>
                        <p className="mt-1 text-xs text-foreground">
                          {selectedClient.address ?? 'No billing address saved'}
                        </p>

                        {selectedClient.phone ? (
                          <p className="mt-0.5 text-xs text-muted">{selectedClient.phone}</p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-border bg-surface">
                <header className="flex items-center justify-between gap-4 border-b border-border bg-surface-raised px-4 py-4 sm:px-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-background">
                      <FileText className="size-4 text-theme-accent" />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold text-foreground">Invoice items</h2>
                      <p className="mt-0.5 text-xs text-muted">
                        Define exactly what the client is being billed for.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={addLineItem}
                    className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface-muted">
                    <Plus className="size-3.5" />
                    Add item
                  </button>
                </header>

                <div className="space-y-4 p-4 sm:p-5">
                  {items.map((item, index) => {
                    const lineTotal = roundMoney(
                      getNumericValue(item.quantity) * getNumericValue(item.unitPrice)
                    );

                    return (
                      <div
                        key={item.id}
                        className="overflow-hidden rounded-xl border border-border bg-background">
                        <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-raised px-4 py-3">
                          <p className="text-xs font-semibold text-foreground">Line item {index + 1}</p>

                          <button
                            type="button"
                            disabled={items.length === 1}
                            onClick={() => {
                              removeLineItem(item.id);
                            }}
                            aria-label={`Remove line item ${index + 1}`}
                            className="inline-flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30">
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>

                        <div className="grid gap-4 p-4 sm:grid-cols-2">
                          <label className="sm:col-span-2">
                            <span className="mb-2 block text-xs font-medium text-muted">Item title</span>

                            <Input
                              value={item.name}
                              onChange={event => {
                                updateLineItem(item.id, 'name', event.target.value);
                              }}
                              placeholder="Website maintenance"
                              required
                            />
                          </label>

                          <label className="sm:col-span-2">
                            <span className="mb-2 block text-xs font-medium text-muted">Description</span>

                            <Textarea
                              value={item.description}
                              onChange={event => {
                                updateLineItem(item.id, 'description', event.target.value);
                              }}
                              placeholder="Optional details for this line item."
                              className="min-h-20 resize-y"
                            />
                          </label>

                          <label>
                            <span className="mb-2 block text-xs font-medium text-muted">Quantity</span>

                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={item.quantity}
                              onChange={event => {
                                updateLineItem(item.id, 'quantity', event.target.value);
                              }}
                              required
                            />
                          </label>

                          <label>
                            <span className="mb-2 block text-xs font-medium text-muted">Unit price</span>

                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={event => {
                                updateLineItem(item.id, 'unitPrice', event.target.value);
                              }}
                              placeholder="0.00"
                              required
                            />
                          </label>
                        </div>

                        <footer className="flex items-center justify-between border-t border-border bg-surface-muted px-4 py-3">
                          <span className="text-xs text-muted">Line total</span>

                          <span className="text-xs font-semibold text-foreground">
                            {formatMoney(lineTotal, currency)}
                          </span>
                        </footer>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-border bg-surface">
                <header className="border-b border-border bg-surface-raised px-4 py-4 sm:px-5">
                  <h2 className="text-sm font-semibold text-foreground">Invoice settings</h2>
                  <p className="mt-0.5 text-xs text-muted">
                    Set currency, adjustments, due date and internal billing notes.
                  </p>
                </header>

                <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
                  <label>
                    <span className="mb-2 block text-xs font-medium text-muted">Currency</span>

                    <select
                      name="currency"
                      value={currency}
                      onChange={event => {
                        setCurrency(event.target.value);
                      }}
                      className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground outline-none transition-colors focus:border-foreground/30 focus:ring-2 focus:ring-theme-accent/20">
                      <option value="NGN">NGN</option>
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </label>

                  <label>
                    <span className="mb-2 block text-xs font-medium text-muted">Due date</span>

                    <Input type="date" name="dueDate" />
                  </label>

                  <label>
                    <span className="mb-2 block text-xs font-medium text-muted">Discount amount</span>

                    <Input
                      type="number"
                      name="discount"
                      min="0"
                      step="0.01"
                      value={discount}
                      onChange={event => {
                        setDiscount(event.target.value);
                      }}
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-xs font-medium text-muted">Tax amount</span>

                    <Input
                      type="number"
                      name="tax"
                      min="0"
                      step="0.01"
                      value={tax}
                      onChange={event => {
                        setTax(event.target.value);
                      }}
                    />
                  </label>

                  <label className="sm:col-span-2">
                    <span className="mb-2 block text-xs font-medium text-muted">Notes</span>

                    <Textarea
                      name="notes"
                      placeholder="Payment instructions, billing context or additional notes."
                      className="min-h-24 resize-y"
                    />
                  </label>
                </div>
              </section>
            </div>

            <aside className="overflow-hidden rounded-2xl border border-border bg-surface xl:sticky xl:top-5">
              <header className="border-b border-border bg-surface-raised px-4 py-4">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-theme-accent">
                  Draft Summary
                </p>

                <h2 className="mt-1 text-sm font-semibold text-foreground">Invoice total</h2>
              </header>

              <div className="space-y-3 p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-muted">Subtotal</span>

                  <span className="text-xs font-medium text-foreground">
                    {formatMoney(subtotal, currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-muted">Discount</span>

                  <span className="text-xs font-medium text-foreground">
                    -{formatMoney(discountAmount, currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-muted">Tax</span>

                  <span className="text-xs font-medium text-foreground">
                    {formatMoney(taxAmount, currency)}
                  </span>
                </div>

                <div className="border-t border-border pt-3">
                  <div className="flex items-end justify-between gap-4">
                    <span className="text-xs font-medium text-muted">Total</span>

                    <span className="text-lg font-semibold tracking-[-0.04em] text-foreground">
                      {formatMoney(total, currency)}
                    </span>
                  </div>
                </div>

                {selectedClient ? (
                  <div className="rounded-xl border border-border bg-surface-muted p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-muted">Bill to</p>

                    <p className="mt-1 text-xs font-semibold text-foreground">
                      {selectedClient.companyName ?? selectedClient.name}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-muted">{selectedClient.email}</p>
                  </div>
                ) : null}

                {state.error ? (
                  <div className="rounded-xl border border-red-500/25 bg-background p-3 text-xs leading-4 text-red-600 dark:text-red-400">
                    {state.error}
                  </div>
                ) : null}
              </div>

              <footer className="space-y-2 border-t border-border bg-surface-muted p-4">
                <button
                  type="submit"
                  disabled={pending || clients.length === 0}
                  className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-xs font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                  <Save className="size-3.5" />

                  {pending ? 'Saving draft...' : 'Save Draft'}
                </button>

                <Link
                  href="/admin/invoices"
                  className="inline-flex h-9 w-full items-center justify-center rounded-xl border border-border bg-background px-4 text-xs font-medium text-muted transition-colors hover:bg-surface-raised hover:text-foreground">
                  Cancel
                </Link>
              </footer>
            </aside>
          </div>
        </div>
      </div>
    </form>
  );
}
