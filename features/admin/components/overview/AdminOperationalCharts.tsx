'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  CalendarDays,
  CheckCheck,
  Circle,
  ExternalLink,
  FolderKanban,
  Search,
  ShieldCheck,
  UserCircle2,
  UserRoundCog,
  Eye,
  ListChecks
} from 'lucide-react';

import type { ActiveProjectMonitor } from '@/features/admin/server/overview/get-active-project-monitors';

type Props = {
  projects: ActiveProjectMonitor[];
};

type PanelProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

type DetailItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

type ActionLinkProps = {
  href: string | null;
  label: string;
  external?: boolean;
};

type MilestoneStatProps = {
  label: string;
  value: number;
  tone: 'neutral' | 'completed' | 'incomplete';
};

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function readString(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return 'Not recorded';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return 'Not recorded';
  }

  return new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(parsed);
}

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

function Panel({ title, subtitle, children }: PanelProps) {
  return (
    <section className="flex h-full h-[420px] min-h-0 flex-col overflow-hidden rounded-[1.75rem] border border-border bg-background">
      <div className="border-b border-border px-5 py-5">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
    </section>
  );
}

function DetailItem({ icon, label, value }: DetailItemProps) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,112px)_minmax(0,1fr)] items-start gap-3 border-b border-border/60 py-2.5 last:border-b-0">
      <div className="flex min-w-0 items-center gap-2 text-muted">
        <span className="shrink-0">{icon}</span>
        <span className="text-xs">{label}</span>
      </div>

      <span className="min-w-0 break-all text-right text-xs font-medium leading-5">
        {value}
      </span>
    </div>
  );
}

function ActionLink({ href, label, external = false }: ActionLinkProps) {
  const className =
    'inline-flex items-center justify-between gap-2 rounded-xl border border-border bg-surface-subtle/40 px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-surface-subtle';

  if (!href) {
    return (
      <span className={className + ' cursor-not-allowed opacity-55'}>
        <span>{label}</span>
        <ExternalLink className="size-3.5" />
      </span>
    );
  }

  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className={className}
    >
      <span>{label}</span>
      {external ? <ExternalLink className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
    </Link>
  );
}

function MilestoneStat({ label, value, tone }: MilestoneStatProps) {
  const appearance =
    tone === 'completed'
      ? 'border-sky-500/30 bg-sky-500/15 text-sky-300'
      : tone === 'incomplete'
        ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
        : 'border-border bg-surface-subtle/40 text-foreground';

  return (
    <div className={`flex min-w-0 items-center justify-between gap-3 rounded-lg border px-3 py-3 ${appearance}`}>
      <div className="flex min-w-0 items-center gap-2">
        {tone === 'completed' ? (
          <CheckCheck className="size-4 shrink-0" />
        ) : tone === 'incomplete' ? (
          <Circle className="size-4 shrink-0" />
        ) : (
          <ShieldCheck className="size-4 shrink-0" />
        )}

        <span className="truncate text-xs font-medium">
          {label}
        </span>
      </div>

      <span className="text-xs font-semibold tabular-nums">
        {value}
      </span>
    </div>
  );
}

export function AdminOperationalCharts({ projects }: Props) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(projects[0]?.id ?? '');

  const matches = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();

    if (!term) {
      return projects;
    }

    return projects.filter(project => {
      const searchable = [
        project.name,
        project.slug,
        project.id
      ]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase();

      return searchable.includes(term);
    });
  }, [projects, query]);

  const selected = useMemo(() => {
    return (
      projects.find(project => project.id === selectedId) ??
      projects[0] ??
      null
    );
  }, [projects, selectedId]);

  const completedNotes = useMemo(
    () => selected?.recentCompletedMilestones ?? [],
    [selected]
  );

  const [activeNoteIndex, setActiveNoteIndex] = useState(0);

  useEffect(() => {
    if (completedNotes.length < 2) return;

    const interval = setInterval(() => {
      setActiveNoteIndex(index => (index + 1) % completedNotes.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [completedNotes.length]);

  if (!selected) {
    return (
      <section className="rounded-[1.75rem] border border-border bg-background p-6">
        <h2 className="text-lg font-semibold">Project analytics</h2>
        <p className="mt-2 text-sm text-muted">No active projects available yet.</p>
      </section>
    );
  }

  const selectedRecord = toRecord(selected);
  const ownerRecord = toRecord(selectedRecord['owner']);
  const managerRecord = toRecord(selectedRecord['manager']);
  const infrastructure = toRecord(selectedRecord['infrastructure']);

  const owner =
    readString(selectedRecord, ['ownerName', 'clientName', 'clientDisplayName']) ??
    readString(ownerRecord, ['name', 'fullName']) ??
    'Not assigned';

  const assignedManager =
    readString(selectedRecord, ['assignedManagerName', 'managerName', 'projectManagerName']) ??
    readString(managerRecord, ['name', 'fullName']) ??
    'Not assigned';

  const registeredDate = formatDate(
    readString(selectedRecord, ['createdAt', 'registeredAt', 'createdOn'])
  );

  const projectType =
    readString(selectedRecord, ['projectType', 'type', 'serviceName']) ??
    'Custom software';

  const liveUrl =
    readString(infrastructure, ['liveUrl', 'url', 'domainUrl']) ??
    readString(selectedRecord, ['liveUrl', 'projectLiveUrl']);


  const projectDescription =
    selected.description?.trim() || null;

  const progress = clampProgress(selected.progress);
  const milestoneSummary = selected.milestoneSummary;
  const incompleteCount = Math.max(0, milestoneSummary.total - milestoneSummary.completed);
  const managementHref = `/admin/projects/${selected.id}`;
  const editHref = `/admin/projects/${selected.id}`;

  return (
    <section className="space-y-4" aria-label="Selected project analytics">
      <header className="rounded-[1.75rem] border border-border bg-background px-5 py-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-theme-accent">
              Selected project analytics
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Project Details</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Search for a project and inspect its preview, ownership, management, delivery progress
              and milestone execution.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:w-[36rem]">
            <label className="space-y-1.5">
              <span className="text-xs text-muted">Search project</span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input
                  type="search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === 'Escape') {
                      setQuery('');
                      return;
                    }

                    if (event.key === 'Enter') {
                      event.preventDefault();

                      if (query.trim() && matches.length > 0) {
                        setSelectedId(matches[0].id);
                        setQuery('');
                      }
                    }
                  }}
                  placeholder="Search projects by name or ID..."
                  aria-label="Search projects"
                  className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-10 text-sm outline-none transition-colors placeholder:text-muted focus:border-theme-accent focus-visible:ring-2 focus-visible:ring-theme-accent/20"
                />
                {query.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear project search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-muted transition-colors hover:bg-surface-subtle hover:text-foreground"
                  >
                    Clear
                  </button>
                ) : null}
              </span>

              <span
                role="status"
                aria-live="polite"
                className="block text-[11px] text-muted"
              >
                {query.trim()
                  ? matches.length === 0
                    ? 'No matching projects. Your selection is unchanged.'
                    : `${matches.length} matching ${matches.length === 1 ? 'project' : 'projects'}`
                  : `${projects.length} ${projects.length === 1 ? 'project' : 'projects'} available`}
              </span>
            </label>

            <label className="space-y-1.5">
              <span className="text-xs text-muted">Selected project</span>
              <select
                value={selected.id}
                onChange={event => {
                  setSelectedId(event.target.value);
                  setQuery('');
                }}
                aria-label="Select project for analytics"
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-theme-accent focus-visible:ring-2 focus-visible:ring-theme-accent/20"
              >
                {!matches.some(project => project.id === selected.id) ? (
                  <option value={selected.id}>
                    {selected.name} (currently selected)
                  </option>
                ) : null}

                {matches.length === 0 ? (
                  <option disabled value="">
                    No matching projects
                  </option>
                ) : null}

                {matches.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </header>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] [&>*]:min-w-0">
        <Panel
          title="Project Details"
          subtitle="Current delivery, access, ownership and infrastructure"
        >
          <div className="grid min-w-0 gap-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <div className="min-w-0 space-y-3">
              {selected.screenshot?.url ? (
                <div className="group relative aspect-video overflow-hidden rounded-xl border border-border bg-surface-subtle">
                  <Image
                    src={selected.screenshot.url}
                    alt={selected.screenshot.alt || `${selected.name} application preview`}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                  />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-border bg-surface-subtle text-xs text-muted">
                  No application preview uploaded
                </div>
              )}

              <div className="min-w-0">

              </div>

              <p

                className="line-clamp-2 text-xs leading-5 text-muted"

                title={projectDescription ?? undefined}

              >

                {projectDescription || 'No project description recorded.'}

              </p>

              <div className="flex flex-wrap gap-2">
                <ActionLink
                  href={managementHref}
                  label="Manage"
                />

                <ActionLink
                  href={editHref}
                  label="View Brief"
                />

                <ActionLink
                  href={liveUrl}
                  label="Live"
                  external
                />
              </div>
            </div>

            <div className="min-w-0">
              <h3 className="text-base font-semibold">
                {selected.name}
              </h3>

              <div className="mt-2">
                <DetailItem
                  icon={<UserCircle2 className="size-3.5" />}
                  label="Owner"
                  value={owner}
                />

                <DetailItem
                  icon={<UserRoundCog className="size-3.5" />}
                  label="Manager"
                  value={assignedManager}
                />

                <DetailItem
                  icon={<CalendarDays className="size-3.5" />}
                  label="Registered"
                  value={registeredDate}
                />

                <DetailItem
                  icon={<FolderKanban className="size-3.5" />}
                  label="Project ID"
                  value={selected.id}
                />

                <DetailItem
                  icon={<ShieldCheck className="size-3.5" />}
                  label="Project Type"
                  value={projectType}
                />
              </div>

              <div className="mt-4 border-t border-border pt-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold">
                    Project Progress
                  </span>

                  <span className="text-sm font-semibold tabular-nums">
                    {progress}%
                  </span>
                </div>

                <div
                  role="progressbar"
                  aria-label={`${selected.name} delivery progress`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                  className="h-2 overflow-hidden rounded-full bg-surface-muted"
                >
                  <div
                    className="h-full rounded-full bg-theme-accent"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="mt-2 text-xs text-muted">
                  {selected.health.label}
                </p>
              </div>
            </div>
          </div>
</Panel>

        <Panel
          title="Project Milestones"
          subtitle={`${milestoneSummary.total} milestones for ${selected.name}`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 pb-1">
              <span className="text-xs font-semibold">
                Production Checklist
              </span>

              <span className="rounded-full border border-border px-2 py-0.5 text-xs font-semibold tabular-nums">
                {milestoneSummary.completed}/{milestoneSummary.total}
              </span>
            </div>

            <MilestoneStat
              label="Total milestones"
              value={milestoneSummary.total}
              tone="neutral"
            />

            <MilestoneStat
              label="Completed"
              value={milestoneSummary.completed}
              tone="completed"
            />

            <MilestoneStat
              label="Incomplete"
              value={incompleteCount}
              tone="incomplete"
            />

            <section
              aria-label="Recently completed milestone notes"
              className="border-t border-border pt-3"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <h4 className="text-xs font-semibold">
                  Recently completed
                </h4>
                {completedNotes.length > 1 && (
                  <span className="text-[11px] tabular-nums text-muted">
                    {(activeNoteIndex % completedNotes.length) + 1}/{completedNotes.length}
                  </span>
                )}
              </div>

              {completedNotes.length > 0 ? (
                <div
                  key={completedNotes[activeNoteIndex % completedNotes.length].id}
                  className="rounded-lg border border-border bg-surface-subtle/40 p-3"
                  aria-live="off"
                >

                  <p
                    className="line-clamp-2 text-xs leading-5 text-muted"
                    title={completedNotes[activeNoteIndex % completedNotes.length].completionNotes ?? undefined}
                  >
                    {completedNotes[activeNoteIndex % completedNotes.length].completionNotes}
                  </p>

                  <div className="mt-3 flex items-center gap-2 flex-nowrap overflow-x-auto min-w-0">
                    <Link
                      href={managementHref}
                      aria-label={`View milestone: ${completedNotes[activeNoteIndex % completedNotes.length].title}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background transition-opacity hover:opacity-80"
                    >
                      <Eye className="size-3.5" />
                      View
                    </Link>

                    <Link
                      href={managementHref}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-surface-subtle"
                    >
                      <ListChecks className="size-3.5" />
                      Review Milestones
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="rounded-lg border border-border p-3 text-xs leading-5 text-muted">
                  No completed milestone notes available.
                </p>
              )}
            </section>


          </div>
</Panel>
      </div>
    </section>
  );
}
