'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowUpRight, CalendarDays, GitBranch, GitCommitHorizontal, ListFilter, Search, ShieldCheck } from 'lucide-react';

export type ProjectLogEvent = {
  id: string;
  at: string;
  category: 'GitHub' | 'Milestone' | 'Project';
  kind: string;
  title: string;
  detail: string;
  status: string;
  repository?: string;
  branch?: string;
  sha?: string;
  url?: string;
};

type Props = {
  projectId: string;
  events: ProjectLogEvent[];
  repositoryUrl: string | null;
  sourceState: string;
};

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date) : 'Time unavailable';
}

function statusTone(category: ProjectLogEvent['category'], status: string) {
  if (status === 'APPROVED' || status === 'COMPLETED') return 'border-emerald-500/30 bg-emerald-500/[0.09] text-emerald-400';
  if (status === 'REJECTED' || status === 'BLOCKED') return 'border-red-500/30 bg-red-500/[0.09] text-red-400';
  if (category === 'GitHub') return 'border-blue-500/30 bg-blue-500/[0.08] text-blue-400';
  return 'border-border bg-background text-muted';
}

function sourceIcon(category: ProjectLogEvent['category']) {
  return category === 'GitHub' ? GitBranch : category === 'Milestone' ? ShieldCheck : CalendarDays;
}

export function ProjectLogsHistory({ projectId, events, repositoryUrl, sourceState }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'All' | ProjectLogEvent['category']>('All');
  const [selected, setSelected] = useState<string | null>(null);
  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return events.filter(item => (category === 'All' || item.category === category) &&
      (!text || [item.title, item.detail, item.kind, item.branch, item.sha, item.repository, item.status].some(value => value?.toLowerCase().includes(text))));
  }, [events, category, query]);
  const active = filtered.find(item => item.id === selected) ?? filtered[0] ?? null;
  const repository = repositoryUrl && /^https:\/\/[^/]+/i.test(repositoryUrl) ? repositoryUrl : null;

  return (
    <section aria-label="Recorded project logs and history" className="overflow-hidden rounded-2xl border border-border bg-surface">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-surface-raised px-4 py-4 sm:px-5">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground"><Activity className="size-5 text-theme-accent" aria-hidden="true" /> Logs &amp; History</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">Recorded project events, GitHub activity and milestone governance. Development evidence never determines official milestone completion.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/projects/${projectId}/sources`} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground hover:bg-surface-muted"><GitBranch className="size-3.5" /> Manage sources</Link>
          {repository ? <a href={repository} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground hover:bg-surface-muted">Repository <ArrowUpRight className="size-3.5" /></a> : null}
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 border-b border-border p-3 sm:p-4">
        <div className="relative min-w-44 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search recorded events, branches, commits…" aria-label="Search project history" className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-theme-accent" />
        </div>
        <label className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-2.5 text-xs text-muted"><ListFilter className="size-3.5" aria-hidden="true" /><span className="sr-only">Event type</span><select value={category} onChange={event => setCategory(event.target.value as typeof category)} className="max-w-32 bg-transparent text-xs text-foreground outline-none"><option value="All">All types</option><option value="GitHub">GitHub</option><option value="Milestone">Milestones</option><option value="Project">Project</option></select></label>
        <span className="rounded-full border border-border bg-background px-2.5 py-1.5 text-[11px] text-muted">{filtered.length} recorded</span>
        <span className="rounded-full border border-border bg-background px-2.5 py-1.5 text-[11px] text-muted" title="Latest GitHub source synchronization state">GitHub: {sourceState.toLowerCase().replaceAll('_', ' ')}</span>
      </div>

      <div className="grid min-w-0 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
        <div className="min-w-0 border-b border-border xl:border-b-0 xl:border-r">
          <div className="grid grid-cols-[6.5rem_5rem_minmax(0,1fr)_5.5rem] gap-2 border-b border-border bg-background/40 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-muted sm:grid-cols-[7.5rem_6rem_minmax(0,1fr)_6rem]">
            <span>Time</span><span>Type</span><span>Event</span><span>Status</span>
          </div>
          <div className="max-h-[460px] min-h-64 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
            {filtered.length ? filtered.map(item => {
              const Icon = sourceIcon(item.category);
              const selectedRow = active?.id === item.id;
              return (
                <button key={item.id} type="button" onClick={() => setSelected(item.id)} aria-pressed={selectedRow}
                  className={`grid w-full grid-cols-[6.5rem_5rem_minmax(0,1fr)_5.5rem] items-start gap-2 border-b border-border/60 px-3 py-3 text-left transition-colors sm:grid-cols-[7.5rem_6rem_minmax(0,1fr)_6rem] ${selectedRow ? 'bg-theme-accent/[0.09]' : 'hover:bg-surface-raised'}`}>
                  <span className="text-[10px] text-muted">{dateLabel(item.at)}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-foreground"><Icon className="size-3.5 shrink-0 text-theme-accent" aria-hidden="true" /><span className="truncate">{item.kind}</span></span>
                  <span className="min-w-0"><span className="block truncate text-xs font-medium text-foreground" title={item.title}>{item.title}</span><span className="mt-0.5 block truncate text-[10px] text-muted">{item.branch ?? item.detail}</span></span>
                  <span className={`min-w-0 truncate rounded-md border px-1.5 py-1 text-center text-[9px] font-medium ${statusTone(item.category, item.status)}`}>{item.status.toLowerCase().replaceAll('_', ' ')}</span>
                </button>
              );
            }) : <p className="p-6 text-xs leading-5 text-muted">No matching recorded events. Try another filter. Request and push timelines are not yet exposed by the current API.</p>}
          </div>
        </div>
        <aside className="max-h-[510px] min-h-64 overflow-y-auto overscroll-contain bg-background/25 p-4" aria-label="Selected event details">
          {active ? (
            <div className="space-y-4">
              <div><p className="text-[10px] font-semibold uppercase tracking-widest text-theme-accent">Event details</p><h3 className="mt-2 break-words text-sm font-semibold text-foreground">{active.title}</h3><p className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 text-muted">{active.detail}</p></div>
              <dl className="divide-y divide-border rounded-lg border border-border bg-background px-3 text-xs">
                <div className="flex justify-between gap-3 py-3"><dt className="text-muted">Recorded</dt><dd className="text-right text-foreground">{dateLabel(active.at)}</dd></div>
                <div className="flex justify-between gap-3 py-3"><dt className="text-muted">Source</dt><dd className="text-right text-foreground">{active.category}</dd></div>
                <div className="flex justify-between gap-3 py-3"><dt className="text-muted">Status</dt><dd className="text-right text-foreground">{active.status}</dd></div>
                {active.repository ? <div className="flex justify-between gap-3 py-3"><dt className="text-muted">Repository</dt><dd className="min-w-0 break-all text-right text-foreground">{active.repository}</dd></div> : null}
                {active.branch ? <div className="flex justify-between gap-3 py-3"><dt className="text-muted">Branch</dt><dd className="min-w-0 break-all text-right text-foreground">{active.branch}</dd></div> : null}
                {active.sha ? <div className="flex justify-between gap-3 py-3"><dt className="text-muted">Commit</dt><dd className="font-mono text-foreground">{active.sha.slice(0, 12)}</dd></div> : null}
              </dl>
              {active.url ? <a href={active.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-accent hover:underline"><GitCommitHorizontal className="size-4" /> View source record <ArrowUpRight className="size-3.5" /></a> : null}
            </div>
          ) : <p className="text-xs text-muted">Choose an event to inspect its details.</p>}
        </aside>
      </div>
      <footer className="border-t border-border px-4 py-3 text-[11px] leading-5 text-muted">This is a bounded history of recorded events, not live Vercel request logs. Request traces, full push timelines and complete branch inventory require additional authorized API endpoints.</footer>
    </section>
  );
}
