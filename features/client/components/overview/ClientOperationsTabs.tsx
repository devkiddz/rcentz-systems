'use client';

import { useState } from 'react';

import Link from 'next/link';

import { ArrowRight, Download, FileClock, Headphones, ListChecks } from 'lucide-react';

import type {
  ClientOverviewAction,
  ClientOverviewRecord,
  ClientOverviewSupport
} from '@/features/client/server/overview/get-client-overview';

type ClientOperationsTabsProps = {
  actions: ClientOverviewAction[];

  records: ClientOverviewRecord[];

  support: ClientOverviewSupport[];
};

type OperationsTab = 'actions' | 'records' | 'support';

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatDate(value: Date | null) {
  if (!value) {
    return 'No date';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric'
  }).format(new Date(value));
}

export function ClientOperationsTabs({ actions, records, support }: ClientOperationsTabsProps) {
  const [activeTab, setActiveTab] = useState<OperationsTab>(
    actions.length > 0 ? 'actions' : records.length > 0 ? 'records' : 'support'
  );

  const tabs = [
    {
      id: 'actions' as const,

      label: 'Actions',

      count: actions.length,

      icon: ListChecks
    },
    {
      id: 'records' as const,

      label: 'Records',

      count: records.length,

      icon: FileClock
    },
    {
      id: 'support' as const,

      label: 'Support',

      count: support.length,

      icon: Headphones
    }
  ];

  return (
    <section className="flex h-[420px] max-h-[420px] flex-col overflow-hidden rounded-[18px] border border-border bg-background">
      <div
        role="tablist"
        aria-label="Client operations"
        className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-border px-3 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map(tab => {
          const Icon = tab.icon;

          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'relative',
                'flex',
                'h-11',
                'shrink-0',
                'cursor-pointer',
                'items-center',
                'gap-2',
                'rounded-t-xl',
                'px-3',
                'text-[12px]',
                'font-medium',
                'transition-colors',

                active ? 'text-foreground' : 'text-muted hover:text-foreground'
              ].join(' ')}>
              <Icon aria-hidden="true" className={active ? 'size-4 text-theme-accent' : 'size-4'} />

              <span>{tab.label}</span>

              <span
                className={[
                  'flex',
                  'min-w-5',
                  'items-center',
                  'justify-center',
                  'rounded-full',
                  'px-1.5',
                  'py-0.5',
                  'text-[9px]',
                  'font-semibold',
                  'tabular-nums',

                  active ? 'bg-theme-accent-faint text-theme-accent' : 'bg-surface-muted text-muted'
                ].join(' ')}>
                {tab.count}
              </span>

              {active ? (
                <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-theme-accent" />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 p-4">
        {activeTab === 'actions' ? <ActionsList actions={actions} /> : null}

        {activeTab === 'records' ? <RecordsList records={records} /> : null}

        {activeTab === 'support' ? <SupportList support={support} /> : null}
      </div>
    </section>
  );
}

function ActionsList({ actions }: { actions: ClientOverviewAction[] }) {
  if (actions.length === 0) {
    return (
      <EmptyState
        icon={ListChecks}
        title="You're all caught up"
        description="There are no project actions requiring your attention."
      />
    );
  }

  return (
    <div className="h-full space-y-2 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {actions.map(action => (
        <Link
          key={action.id}
          href={`/dashboard/projects/${action.projectId}`}
          className="group block rounded-xl border border-border bg-surface-raised p-3 transition-colors hover:bg-surface-muted">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-foreground">{action.title}</p>

              <p className="mt-0.5 truncate text-[9px] text-muted">{action.projectName}</p>
            </div>

            {action.requiresClientAction ? (
              <span className="shrink-0 rounded-full bg-theme-accent-faint px-2 py-1 text-[8px] font-semibold text-theme-accent">
                Your action
              </span>
            ) : action.blocking ? (
              <span className="shrink-0 rounded-full bg-rose-500/10 px-2 py-1 text-[8px] font-semibold text-rose-500">
                Blocked
              </span>
            ) : null}
          </div>

          {action.description ? (
            <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-muted">{action.description}</p>
          ) : null}

          <div className="mt-2 flex items-center justify-between gap-3 text-[9px] text-muted">
            <span className="truncate">{action.context ?? formatStatus(String(action.type))}</span>

            <span className="shrink-0">{action.dueAt ? `Due ${formatDate(action.dueAt)}` : 'Open'}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function RecordsList({ records }: { records: ClientOverviewRecord[] }) {
  if (records.length === 0) {
    return (
      <EmptyState
        icon={FileClock}
        title="No milestone records"
        description="Requested milestone records and final copies will appear here."
      />
    );
  }

  return (
    <div className="h-full space-y-2 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {records.map(record => (
        <div key={record.id} className="rounded-xl border border-border bg-surface-raised p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-foreground">{record.milestoneTitle}</p>

              <p className="mt-0.5 truncate text-[9px] text-muted">
                {record.projectName}
                {' · '}v{record.version}
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-theme-accent-faint px-2 py-1 text-[8px] font-semibold text-theme-accent">
              {formatStatus(String(record.status))}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-[9px] text-muted">Requested {formatDate(record.requestedAt)}</p>

            {(record.status === 'READY' || record.status === 'SENT') && record.pdfUrl ? (
              <a
                href={record.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[9px] font-semibold text-theme-accent">
                <Download aria-hidden="true" className="size-3" />
                Download
              </a>
            ) : (
              <Link
                href={`/dashboard/projects/${record.projectId}`}
                className="inline-flex items-center gap-1 text-[9px] font-medium text-muted transition-colors hover:text-foreground">
                Project
                <ArrowRight aria-hidden="true" className="size-3" />
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function SupportList({ support }: { support: ClientOverviewSupport[] }) {
  if (support.length === 0) {
    return (
      <EmptyState
        icon={Headphones}
        title="No open support"
        description="You currently have no unresolved support conversations."
      />
    );
  }

  return (
    <div className="h-full space-y-2 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {support.map(ticket => (
        <Link
          key={ticket.id}
          href={`/dashboard/projects/${ticket.projectId}`}
          className="block rounded-xl border border-border bg-surface-raised p-3 transition-colors hover:bg-surface-muted">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-foreground">{ticket.subject}</p>

              <p className="mt-0.5 truncate text-[9px] text-muted">
                {ticket.ticketNumber}
                {' · '}
                {ticket.projectName}
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-surface-muted px-2 py-1 text-[8px] font-medium text-muted">
              {formatStatus(String(ticket.status))}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between text-[9px] text-muted">
            <span>{formatStatus(String(ticket.priority))}</span>

            <span>Updated {formatDate(ticket.updatedAt)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description
}: {
  icon: typeof ListChecks;

  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 text-center">
      <div className="flex size-10 items-center justify-center rounded-full border border-theme-accent/20 bg-theme-accent-faint">
        <Icon aria-hidden="true" className="size-4 text-theme-accent" />
      </div>

      <p className="mt-3 text-sm font-medium text-foreground">{title}</p>

      <p className="mt-1 max-w-[260px] text-[11px] leading-5 text-muted">{description}</p>
    </div>
  );
}
