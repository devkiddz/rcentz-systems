'use client';
import type { ProjectActivitySummary } from '@/server/rcentz-api/project-activity-client';

import { useMemo, useState } from 'react';

import Link from 'next/link';
import Image from 'next/image';

import {
  CheckCircle2,
  Clock3,
  FolderKanban,
  Plus,
  Search,
  UserRound
} from 'lucide-react';


import type {
  AdminProjectListItem,
  AdminProjectsData
} from '@/features/admin/server/projects/get-admin-projects';

type AdminProjectsPageProps = {
  data: AdminProjectsData;

  activity: Record<string, ProjectActivitySummary>;
};

type ProjectFilter = 'ALL' | 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'UNASSIGNED';

const activeStatuses = new Set([
  'PLANNING',
  'DISCOVERY',
  'DESIGN',
  'DEVELOPMENT',
  'TESTING',
  'REVIEW',
  'DEPLOYMENT',
  'MAINTENANCE'
]);

function humanize(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
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

export function AdminProjectsPage({ data, activity }: AdminProjectsPageProps) {
  const [filter, setFilter] = useState<ProjectFilter>('ALL');

  const [search, setSearch] = useState('');
  const [view, setView] = useState<'cards' | 'table'>('cards');

  const projects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return data.projects.filter(project => {
      const companyName = project.client?.clientProfile?.companyName ?? '';

      const matchesSearch =
        !query ||
        project.name.toLowerCase().includes(query) ||
        project.slug.toLowerCase().includes(query) ||
        project.type.toLowerCase().includes(query) ||
        project.status.toLowerCase().includes(query) ||
        project.client?.name.toLowerCase().includes(query) ||
        project.client?.email.toLowerCase().includes(query) ||
        companyName.toLowerCase().includes(query);

      if (!matchesSearch) {
        return false;
      }

      switch (filter) {
        case 'ACTIVE':
          return activeStatuses.has(project.status);

        case 'COMPLETED':
          return project.status === 'COMPLETED';

        case 'ON_HOLD':
          return project.status === 'ON_HOLD';

        case 'UNASSIGNED':
          return project.client === null;

        case 'ALL':
        default:
          return true;
      }
    });
  }, [data.projects, filter, search]);

  return (
    <main className="rcentz-dashboard-frame px-4 py-6 sm:px-6 lg:px-8">
      <div className="rcentz-dashboard-inner mx-auto w-full max-w-[1200px] space-y-7">
        <section>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-theme-accent">Operations</p>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-[-0.04em] text-foreground sm:text-2xl">
                Project management
              </h1>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">
                View project delivery from the same truth as the client, with administrative controls layered
                on top.
              </p>
            </div>

            <Link
              href="/admin/projects/new"
              className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-xs font-semibold text-background transition-opacity hover:opacity-90">
              <Plus className="size-3.5" />
              Create project
            </Link>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={FolderKanban}
            label="All projects"
            value={data.summary.total}
            note="Complete project register"
            active={filter === 'ALL'}
            onClick={() => {
              setFilter('ALL');
            }}
          />

          <SummaryCard
            icon={Clock3}
            label="Active"
            value={data.summary.active}
            note="Currently moving through delivery"
            active={filter === 'ACTIVE'}
            onClick={() => {
              setFilter('ACTIVE');
            }}
          />

          <SummaryCard
            icon={CheckCircle2}
            label="Completed"
            value={data.summary.completed}
            note="Finished project delivery"
            active={filter === 'COMPLETED'}
            onClick={() => {
              setFilter('COMPLETED');
            }}
          />

          <SummaryCard
            icon={UserRound}
            label="Unassigned"
            value={data.summary.unassigned}
            note="Projects without a client"
            active={filter === 'UNASSIGNED'}
            onClick={() => {
              setFilter('UNASSIGNED');
            }}
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-background">
          <header className="border-b border-border bg-surface-raised px-4 py-5 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Project register</p>

                <p className="mt-1 text-xs text-muted">
                  Search, open, preview and manage project delivery.
                </p>
              </div>

              <div className="relative w-full lg:max-w-[320px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />

                <input
                  type="search"
                  value={search}
                  onChange={event => {
                    setSearch(event.target.value);
                  }}
                  placeholder="Project, client or status..."
                  className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-xs text-foreground outline-none placeholder:text-muted focus:border-foreground/30"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <FilterButton
                label="All"
                count={data.summary.total}
                active={filter === 'ALL'}
                onClick={() => {
                  setFilter('ALL');
                }}
              />

              <FilterButton
                label="Active"
                count={data.summary.active}
                active={filter === 'ACTIVE'}
                onClick={() => {
                  setFilter('ACTIVE');
                }}
              />

              <FilterButton
                label="Completed"
                count={data.summary.completed}
                active={filter === 'COMPLETED'}
                onClick={() => {
                  setFilter('COMPLETED');
                }}
              />

              <FilterButton
                label="On hold"
                count={data.summary.onHold}
                active={filter === 'ON_HOLD'}
                onClick={() => {
                  setFilter('ON_HOLD');
                }}
              />

              <FilterButton
                label="Unassigned"
                count={data.summary.unassigned}
                active={filter === 'UNASSIGNED'}
                onClick={() => {
                  setFilter('UNASSIGNED');
                }}
              />
            </div>
          </header>

          <div className="p-5 sm:p-6">
            <div className="mb-4 flex justify-end gap-2" aria-label="Project register view">
              <button type="button" onClick={() => setView('cards')} aria-pressed={view === 'cards'} className={view === 'cards' ? 'rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background' : 'rounded-lg border border-border px-3 py-2 text-xs text-foreground'}>Cards</button>
              <button type="button" onClick={() => setView('table')} aria-pressed={view === 'table'} className={view === 'table' ? 'rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background' : 'rounded-lg border border-border px-3 py-2 text-xs text-foreground'}>Table</button>
            </div>
            {view === 'cards' ? <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {projects.map(project => (
                <ProjectCard key={project.id} project={project} activity={activity[project.id]} />
              ))}

              {filter === 'ALL' && !search.trim() ? <CreateProjectPlaceholder /> : null}
            </div> : <div className="overflow-x-auto rounded-xl border border-border"><table className="w-full text-left text-xs"><thead className="border-b border-border bg-surface-raised"><tr><th className="p-3">Project</th><th className="p-3">Status</th><th className="p-3">Progress</th><th className="p-3">Milestones</th><th className="p-3">Actions</th></tr></thead><tbody>{projects.map(project => <tr key={project.id} className="border-b border-border last:border-0"><td className="p-3 font-medium"><Link href={`/admin/projects/${project.id}`} className="hover:underline">{project.name}</Link></td><td className="p-3">{humanize(project.status)}</td><td className="p-3 tabular-nums">{project.progress}%</td><td className="p-3">{project.milestoneHealth.completed}/{project.milestoneHealth.total} completed</td><td className="p-3"><Link className="underline" href={`/admin/projects/${project.id}`}>Manage</Link></td></tr>)}</tbody></table></div>}

            {projects.length === 0 && (filter !== 'ALL' || search.trim()) ? (
              <div className="px-6 py-14 text-center">
                <FolderKanban className="mx-auto size-6 text-muted" />

                <p className="mt-3 text-sm font-semibold text-foreground">No matching projects</p>

                <p className="mt-1 text-xs text-muted">Try another search or filter.</p>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}


function ProjectCard({ project, activity }: { project: AdminProjectListItem; activity?: ProjectActivitySummary }) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const canPreview = project.visibility === 'PUBLIC' && Boolean(project.portfolio?.publishedAt);
  const milestones = project.milestonePreview;
  const latest = activity?.latestMilestoneEvent;
  const commit = activity?.latestCommit;
  const summary = latest ? `${humanize(latest.kind)} · ${latest.milestoneKey}` : commit?.message ?? (
    activity?.state === 'SYNC_ERROR' ? 'Source synchronization needs attention' :
    activity?.state === 'NO_SOURCE' ? 'No delivery source connected' :
    activity?.state === 'AWAITING_SYNC' ? 'Awaiting synchronization' :
    activity?.state === 'UNAVAILABLE' ? 'Activity service unavailable' : 'No recorded GitHub activity'
  );
  const timestamp = latest?.committedAt ?? commit?.committedAt;
  const source = latest?.repository ?? commit?.repository;
  const percentage = Math.max(0, Math.min(100, project.progress));
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const website = (() => {
    const url = project.portfolio?.liveUrl;
    if (!url) return null;
    try { const parsed = new URL(url); return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.hostname : null; }
    catch { return null; }
  })();

  return (
    <article className="relative min-w-0 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-border-strong">
      <div className="flex items-start gap-3">
        <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background">
          {project.screenshot?.url ? <Image src={project.screenshot.url} alt={project.screenshot.alt || `${project.name} preview`} width={44} height={44} unoptimized className="size-full object-cover" /> : <FolderKanban aria-hidden="true" className="size-5 text-theme-accent" />}
        </div>
        <div className="min-w-0 flex-1">
          <Link href={`/admin/projects/${project.id}`} className="block truncate text-sm font-semibold text-foreground hover:underline">{project.name}</Link>
          <p className="mt-0.5 truncate text-xs text-muted">{website ?? project.client?.clientProfile?.companyName ?? project.client?.name ?? humanize(project.status)}</p>
        </div>
        <div title={`Overall project progress: ${percentage}%`} aria-label={`Overall project progress ${percentage}%`} role="img" className="relative size-11 shrink-0">
          <svg viewBox="0 0 48 48" className="size-full -rotate-90" aria-hidden="true">
            <circle cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="3.5" fill="none" className="text-border-strong" />
            <circle cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1-percentage/100)} fill="none" className="text-theme-accent" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold tabular-nums text-foreground">{percentage}%</span>
        </div>
        <div className="relative shrink-0">
          <button type="button" aria-label={`Manage ${project.name}`} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} className="flex size-8 items-center justify-center rounded-lg border border-border text-foreground hover:bg-surface-raised">···</button>
          {menuOpen && <div className="absolute right-0 top-full z-30 mt-1 w-48 rounded-xl border border-border bg-background p-1 shadow-lg">
            <Link href={`/admin/projects/${project.id}`} className="block rounded-lg px-3 py-2 text-xs hover:bg-surface-raised">Open workspace / milestones</Link>
            <Link href={`/admin/projects/${project.id}/edit`} className="block rounded-lg px-3 py-2 text-xs hover:bg-surface-raised">Edit project</Link>
            <Link href={`/admin/projects/${project.id}/sources`} className="block rounded-lg px-3 py-2 text-xs hover:bg-surface-raised">Development sources</Link>
            {canPreview && <Link href={`/portfolio/${project.slug}`} className="block rounded-lg px-3 py-2 text-xs hover:bg-surface-raised">Public portfolio</Link>}
            {project.portfolio?.liveUrl && <a href={project.portfolio.liveUrl} target="_blank" rel="noopener noreferrer" className="block rounded-lg px-3 py-2 text-xs hover:bg-surface-raised">Live project</a>}
          </div>}
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2">
        <span className="mt-0.5 text-muted" aria-hidden="true">⌁</span>
        <p className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground" title={summary}>{summary}</p>
      </div>
      <p className="mt-1 truncate text-xs text-muted" title={source ?? undefined}>
        {source ?? 'No repository connected'}{timestamp ? ` · ${new Date(timestamp).toLocaleDateString('en-NG', {day:'numeric',month:'short',year:'numeric'})}` : ''}
      </p>
      {activity?.state === 'SYNC_ERROR' && <p className="mt-2 text-xs text-[var(--chart-warning)]">Source synchronization needs attention</p>}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
        <span className="truncate text-[11px] text-muted">{humanize(project.status)} · {project.milestoneHealth.active} active MS</span>
        <button type="button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)} className="shrink-0 text-xs font-medium text-foreground underline-offset-2 hover:underline">{expanded ? 'Less details' : 'More details'}</button>
      </div>
      {expanded && <div className="mt-3 space-y-3 border-t border-border pt-3">
        <p className="text-xs leading-5 text-muted">{project.description || 'No project description recorded.'}</p>
        <div className="flex justify-between gap-3 text-xs text-muted"><span>Milestones</span><span>{project.milestoneHealth.completed} completed / {project.milestoneHealth.total} total</span></div>
        {milestones.length ? <ul className="space-y-2">{milestones.map(m => <li key={m.id} className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-xs"><span className="min-w-0 truncate text-foreground" title={m.title}>{m.title}</span><span className="shrink-0 text-muted">{humanize(m.status)} · {m.progress}%</span></li>)}</ul> : <p className="text-xs text-muted">No recorded milestones.</p>}
        <Link href={`/admin/projects/${project.id}`} className="inline-block text-xs font-semibold text-theme-accent hover:underline">Manage project milestones</Link>
      </div>}
    </article>
  );
}


function CreateProjectPlaceholder() {
  return (
    <Link
      href="/admin/projects/new"
      className="group flex min-h-[470px] items-center justify-center rounded-2xl border border-dashed border-border bg-background/40 p-8 text-center transition-colors hover:border-theme-accent/30 hover:bg-theme-accent/[0.025]">
      <div>
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-border bg-surface">
          <Plus className="size-5 text-theme-accent" />
        </div>

        <h2 className="mt-5 text-sm font-semibold text-foreground">Create new project</h2>

        <p className="mx-auto mt-2 max-w-[260px] text-xs leading-5 text-muted">
          Establish a new project workspace and connect its client, delivery and management records.
        </p>
      </div>
    </Link>
  );
}

function StatusDot({ status }: { status: string }) {
  const className =
    status === 'COMPLETED'
      ? 'bg-theme-accent'
      : status === 'ON_HOLD'
        ? 'bg-[var(--chart-warning)]'
        : status === 'CANCELLED'
          ? 'bg-[var(--chart-danger)]'
          : 'bg-theme-accent';

  return <span aria-hidden="true" className={['size-1.5 shrink-0 rounded-full', className].join(' ')} />;
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  note,
  active,
  onClick
}: {
  icon: typeof FolderKanban;
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
      className={[
        'cursor-pointer rounded-2xl border p-4 text-left transition-colors',
        active
          ? 'border-theme-accent/30 bg-theme-accent/[0.04]'
          : 'border-border bg-surface hover:bg-surface-raised'
      ].join(' ')}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex size-8 items-center justify-center rounded-lg border border-border bg-background">
          <Icon className="size-3.5 text-theme-accent" />
        </div>

        <span className="text-xl font-semibold tracking-[-0.04em] text-foreground">{value}</span>
      </div>

      <p className="mt-4 text-xs font-semibold text-foreground">{label}</p>

      <p className="mt-1 text-xs leading-4 text-muted">{note}</p>
    </button>
  );
}

function FilterButton({
  label,
  count,
  active,
  onClick
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'inline-flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-foreground bg-foreground px-3 text-xs font-medium text-background'
          : 'inline-flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-3 text-xs font-medium text-muted transition-colors hover:text-foreground'
      }>
      {label}

      <span className="tabular-nums opacity-70">{count}</span>
    </button>
  );
}

function ProjectMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2.5">
      <p className="truncate text-xs uppercase tracking-[0.06em] text-muted">{label}</p>

      <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-muted">{label}</span>

      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
