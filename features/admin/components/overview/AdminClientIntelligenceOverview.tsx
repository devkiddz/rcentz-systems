import Link from 'next/link';

import {
  ArrowUpRight,
  BriefcaseBusiness,
  Inbox,
  Radar
} from 'lucide-react';

import type { OverviewClient } from '@/features/admin/server/overview/get-overview-clients';
import type { CommercialPreview } from '@/features/admin/server/overview/get-commercial-preview';
import { clientStateLabels } from '@/features/opportunities/commercial-types';

type Props = {
  clients: OverviewClient[];
  commercialPreview: CommercialPreview;
};

function Panel({
  title,
  count,
  description,
  href,
  children
}: {
  title: string;
  count: string;
  description: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-[190px] min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-background lg:min-h-0 lg:h-full">
      <header className="shrink-0 border-b border-border p-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="min-w-0 text-sm font-semibold">{title}</h4>
          <span className="rounded-md bg-surface-muted px-2 py-0.5 text-xs font-semibold tabular-nums">
            {count}
          </span>
        </div>
        <p className="mt-1 text-xs leading-4 text-muted">
          {description}
        </p>
      </header>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-2.5">
        {children}
      </div>

      <footer className="shrink-0 border-t border-border p-2.5">
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs font-medium text-theme-accent hover:underline"
        >
          View all
          <ArrowUpRight className="size-3.5" />
        </Link>
      </footer>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-dashed border-border p-3 text-xs leading-5 text-muted">
      {text}
    </p>
  );
}

export function AdminClientIntelligenceOverview({
  clients,
  commercialPreview
}: Props) {
  const active = clients.filter(
    client => client.activeProjectCount > 0
  );

  const requesting = clients.filter(
    client => client.openRequestCount > 0
  );

  const requestCount = requesting.reduce(
    (sum, client) => sum + client.openRequestCount,
    0
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">Client Intelligence</h3>
          <p className="mt-1 text-xs text-muted">
            Relationships, acquisition and incoming demand.
          </p>
        </div>
      </div>

      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 gap-3 overflow-y-auto lg:grid-cols-3 lg:overflow-hidden [&>*]:min-w-0">
        <Panel
          title="Active Clients"
          count={String(active.length)}
          description="Registered customers with ongoing projects."
          href="/admin/clients"
        >
          {active.length === 0 ? (
            <Empty text="No clients with active projects in the current Overview results." />
          ) : (
            active.map(client => (
              <Link
                key={client.id}
                href="/admin/clients"
                className="block rounded-lg border border-border p-3 transition-colors hover:bg-surface-raised"
              >
                <div className="flex items-start gap-2">
                  <BriefcaseBusiness className="mt-0.5 size-4 shrink-0 text-muted" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">
                      {client.companyName || client.name}
                    </p>
                    <p className="mt-1 text-[11px] text-muted">
                      {client.activeProjectCount} active project(s)
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className="h-full bg-theme-accent"
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(100, client.averageProjectProgress)
                          )}%`
                        }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-muted">
                      {client.averageProjectProgress}% average progress
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </Panel>

        <Panel
          title="Opportunity Feed"
          count={commercialPreview.available ? String(commercialPreview.total) : '?'}
          description="Potential customers from Client Acquisition."
          href="/admin/opportunities/clients"
        >
          {!commercialPreview.available ? (
            <Empty text="The acquisition feed is unavailable. Open Client Acquisition to check the source." />
          ) : commercialPreview.prospects.length === 0 ? (
            <Empty text="No saved prospects in the current acquisition feed." />
          ) : (
            commercialPreview.prospects.map(lead => (
              <Link
                key={lead.id}
                href={`/admin/opportunities/clients/${lead.id}`}
                className="block rounded-lg border border-border p-3 transition-colors hover:bg-surface-raised"
              >
                <div className="flex items-start gap-2">
                  <Radar className="mt-0.5 size-4 shrink-0 text-muted" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-semibold">
                      {lead.businessName}
                    </p>
                    <p className="mt-1 text-[11px] text-theme-accent">
                      {clientStateLabels[lead.state] || lead.state}
                    </p>
                    <p className="mt-2 line-clamp-2 text-xs leading-4 text-muted">
                      {lead.summary}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </Panel>

        <Panel
          title="Incoming Requests"
          count={String(requestCount)}
          description="Open requests from registered clients in this preview."
          href="/admin/requests"
        >
          {requesting.length === 0 ? (
            <Empty text="No open service requests among the clients in this preview. The full Requests workspace may contain more." />
          ) : (
            requesting.map(client => (
              <Link
                key={client.id}
                href="/admin/requests"
                className="flex items-start gap-2 rounded-lg border border-border p-3 transition-colors hover:bg-surface-raised"
              >
                <Inbox className="mt-0.5 size-4 shrink-0 text-muted" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">
                    {client.companyName || client.name}
                  </p>
                  <p className="mt-1 text-[11px] text-muted">
                    {client.openRequestCount} open request(s)
                  </p>
                </div>
              </Link>
            ))
          )}
        </Panel>
      </div>
    </div>
  );
}
