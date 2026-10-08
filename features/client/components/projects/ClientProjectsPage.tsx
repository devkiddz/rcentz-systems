'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Eye,
  FolderKanban,
  Layers3,
  ListChecks,
  MousePointerClick,
  Plus,
  Radio,
  Search
} from 'lucide-react';

import { MilestoneHealthChart } from '@/features/client/components/overview/MilestoneHealthChart';

import type { ClientProjectMonitor } from '@/features/client/server/projects/get-client-project-monitors';

type ClientProjectsPageProps = {
  projects: ClientProjectMonitor[];
};

type ProjectFilter = 'ALL' | 'ACTIVE' | 'MANAGED' | 'COMPLETED';

const completedStatuses = new Set(['COMPLETED', 'CANCELLED']);

function formatLabel(value: string | null) {
  if (!value) {
    return 'Unknown';
  }

  return value
    .toLowerCase()
    .split('_')
    .map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-NG').format(value);
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

function formatRelativeDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  const difference = Date.now() - date.getTime();

  const minutes = Math.floor(difference / 60_000);

  if (minutes < 1) {
    return 'Just now';
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short'
  }).format(date);
}

function getAnalyticsLabel(project: ClientProjectMonitor) {
  if (!project.analytics.available) {
    return 'Analytics unavailable';
  }

  if (project.analytics.status !== 'ACTIVE') {
    return `Analytics ${formatLabel(project.analytics.status).toLowerCase()}`;
  }

  if (project.analytics.totalEvents === 0) {
    return 'Awaiting traffic';
  }

  return 'Live analytics';
}

export function ClientProjectsPage({ projects }: ClientProjectsPageProps) {
  const [filter, setFilter] = useState<ProjectFilter>('ALL');

  const [search, setSearch] = useState('');

  const counts = useMemo(() => {
    const active = projects.filter(project => !completedStatuses.has(project.status)).length;

    const managed = projects.filter(
      project => project.analytics.available && project.analytics.status === 'ACTIVE'
    ).length;

    const completed = projects.filter(project => completedStatuses.has(project.status)).length;

    return {
      all: projects.length,
      active,
      managed,
      completed
    };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return projects.filter(project => {
      const matchesSearch =
        !query ||
        project.name.toLowerCase().includes(query) ||
        project.slug.toLowerCase().includes(query) ||
        project.status.toLowerCase().includes(query) ||
        project.type.toLowerCase().includes(query) ||
        project.domain?.toLowerCase().includes(query);

      if (!matchesSearch) {
        return false;
      }

      switch (filter) {
        case 'ACTIVE':
          return !completedStatuses.has(project.status);

        case 'MANAGED':
          return project.analytics.available && project.analytics.status === 'ACTIVE';

        case 'COMPLETED':
          return completedStatuses.has(project.status);

        case 'ALL':
        default:
          return true;
      }
    });
  }, [filter, projects, search]);

  return (
    <main className="py-6 sm:py-8">
      <div className="space-y-7">
        <section className="px-1">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-theme-accent">Projects</p>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-[-0.04em] text-foreground sm:text-2xl">
                Your projects
              </h1>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
                Follow delivery, milestones and live project performance from one workspace.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
              <span className="font-semibold text-foreground">{projects.length}</span>
              project
              {projects.length === 1 ? '' : 's'}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[22px] border border-border bg-background">
          <header className="border-b border-border bg-surface-raised px-4 py-5 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Project workspace</p>

                <p className="mt-1 text-[10px] text-muted-foreground">
                  Search and open any active or completed project.
                </p>
              </div>

              <div className="relative w-full lg:max-w-[320px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />

                <input
                  type="search"
                  value={search}
                  onChange={event => {
                    setSearch(event.target.value);
                  }}
                  placeholder="Project, domain or status..."
                  className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-[10px] text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/30"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <FilterButton
                label="All"
                count={counts.all}
                active={filter === 'ALL'}
                onClick={() => {
                  setFilter('ALL');
                }}
              />

              <FilterButton
                label="Active"
                count={counts.active}
                active={filter === 'ACTIVE'}
                onClick={() => {
                  setFilter('ACTIVE');
                }}
              />

              <FilterButton
                label="Managed"
                count={counts.managed}
                active={filter === 'MANAGED'}
                onClick={() => {
                  setFilter('MANAGED');
                }}
              />

              <FilterButton
                label="Completed"
                count={counts.completed}
                active={filter === 'COMPLETED'}
                onClick={() => {
                  setFilter('COMPLETED');
                }}
              />
            </div>
          </header>

          <div className="p-5 sm:p-6">
            <div className="grid gap-6 xl:grid-cols-2">
              {filteredProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}

              {filter === 'ALL' && !search.trim() ? <RequestProjectCard hasProjects={projects.length > 0} /> : null}
            </div>

            {filteredProjects.length === 0 && (filter !== 'ALL' || search.trim()) ? (
              <div className="px-6 py-14 text-center">
                <FolderKanban className="mx-auto size-6 text-muted-foreground" />

                <p className="mt-3 text-sm font-semibold text-foreground">No matching projects</p>

                <p className="mt-1 text-[10px] text-muted-foreground">
                  Try another search or project filter.
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function ProjectCard({ project }: { project: ClientProjectMonitor }) {
  const activeMilestones =
    project.milestoneSummary.inProgress + project.milestoneSummary.review + project.milestoneSummary.blocked;

  const remainingMilestones = project.milestoneSummary.planned;

  const milestoneTotal = project.milestoneSummary.completed + activeMilestones + remainingMilestones;

  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className="group overflow-hidden rounded-[22px] border border-border bg-surface shadow-sm transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md">
      <article className="flex h-full flex-col">
        <header className="border-b border-border bg-surface-raised px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <HealthDot status={project.health.status} />

                <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {formatLabel(project.status)}
                </span>

                <span className="text-[9px] text-muted-foreground">·</span>

                <span className="text-[9px] text-muted-foreground">{formatLabel(project.type)}</span>
              </div>

              <h2 className="mt-2.5 truncate text-[16px] font-semibold tracking-[-0.025em] text-foreground">
                {project.name}
              </h2>

              <p className="mt-1.5 truncate font-mono text-[9px] text-muted-foreground">
                {project.domain ?? `/project/${project.slug}`}
              </p>
            </div>

            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all duration-200 group-hover:border-foreground/20 group-hover:text-foreground">
              <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </header>

        <div className="grid flex-1 md:grid-cols-[minmax(0,0.92fr)_minmax(230px,1.08fr)]">
          <div className="border-b border-border p-5 sm:p-6 md:border-b-0 md:border-r">
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                Delivery health
              </p>

              <div className="mt-2 flex items-center gap-2">
                <HealthDot status={project.health.status} />

                <p className="text-[11px] font-semibold text-foreground">{project.health.label}</p>
              </div>

              <p className="mt-1.5 text-[9px] leading-4 text-muted-foreground">{project.health.reason}</p>
            </div>

            {project.description ? (
              <p className="mt-5 line-clamp-3 text-[10px] leading-5 text-muted-foreground">
                {project.description}
              </p>
            ) : null}

            <div className="mt-6">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[9px] font-medium text-muted-foreground">Overall progress</span>

                <span className="text-[12px] font-semibold tabular-nums text-foreground">
                  {project.progress}%
                </span>
              </div>

              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-theme-accent transition-[width]"
                  style={{
                    width: `${Math.min(100, Math.max(0, project.progress))}%`
                  }}
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <ProjectMetric icon={Clock3} label="Milestones" value={milestoneTotal} />

              <ProjectMetric icon={Layers3} label="Features" value={project.featureCount} />

              <ProjectMetric icon={ListChecks} label="Tasks" value={project.taskSummary.total} />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="min-h-[245px] border-b border-border p-2">
              <MilestoneHealthChart
                completed={project.milestoneSummary.completed}
                active={activeMilestones}
                remaining={remainingMilestones}
                total={milestoneTotal}
              />
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <Activity className="size-3 text-theme-accent" />

                  <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Live performance
                  </p>
                </div>

                <span className="truncate text-[8px] text-muted-foreground">
                  {getAnalyticsLabel(project)}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <AnalyticsMetric
                  icon={Radio}
                  label="Sessions"
                  value={project.analytics.available ? formatNumber(project.analytics.sessions) : '—'}
                />

                <AnalyticsMetric
                  icon={Eye}
                  label="Views"
                  value={project.analytics.available ? formatNumber(project.analytics.pageViews) : '—'}
                />

                <AnalyticsMetric
                  icon={MousePointerClick}
                  label="Clicks"
                  value={project.analytics.available ? formatNumber(project.analytics.clicks) : '—'}
                />
              </div>
            </div>
          </div>
        </div>

        <footer className="border-t border-border bg-surface-muted/40 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <MetaItem label="Target" value={formatDate(project.expectedEndAt)} />

              <MetaItem label="Updated" value={formatRelativeDate(project.updatedAt)} />
            </div>

            <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-muted-foreground transition-colors group-hover:text-foreground">
              Open project
              <ArrowUpRight className="size-3" />
            </span>
          </div>
        </footer>
      </article>
    </Link>
  );
}

function RequestProjectCard({ hasProjects }: { hasProjects: boolean }) {
  return (
    <Link
      href="/dashboard/onboarding"
      className="group flex min-h-[520px] items-center justify-center rounded-[22px] border border-dashed border-border bg-background/40 p-8 text-center transition-colors hover:border-theme-accent/30 hover:bg-theme-accent/[0.025]">
      <div>
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-border bg-surface transition-transform duration-200 group-hover:-translate-y-0.5">
          <Plus className="size-5 text-theme-accent" />
        </div>

        <h2 className="mt-5 text-sm font-semibold text-foreground">{hasProjects ? 'Start another project' : 'Start your first project'}</h2>

        <p className="mx-auto mt-2 max-w-[260px] text-[10px] leading-5 text-muted-foreground">
          Tell Rcentz what you would like us to build, improve or manage next.
        </p>

        <span className="mt-5 inline-flex items-center gap-1.5 text-[9px] font-semibold text-theme-accent">
          Request project
          <ArrowUpRight className="size-3" />
        </span>
      </div>
    </Link>
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
          ? 'inline-flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-foreground bg-foreground px-3 text-[9px] font-medium text-background'
          : 'inline-flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-3 text-[9px] font-medium text-muted-foreground transition-colors hover:text-foreground'
      }>
      {active ? <CheckCircle2 className="size-3" /> : <FolderKanban className="size-3" />}

      {label}

      <span className={active ? 'tabular-nums text-background/60' : 'tabular-nums opacity-70'}>{count}</span>
    </button>
  );
}

function ProjectMetric({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3" />

        <p className="truncate text-[8px] uppercase tracking-[0.06em]">{label}</p>
      </div>

      <p className="mt-1 text-[12px] font-semibold tabular-nums text-foreground">{formatNumber(value)}</p>
    </div>
  );
}

function AnalyticsMetric({ icon: Icon, label, value }: { icon: typeof Radio; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2.5">
      <div className="flex items-center gap-1 text-muted-foreground">
        <Icon className="size-2.5" />

        <span className="truncate text-[7px] uppercase tracking-[0.06em]">{label}</span>
      </div>

      <p className="mt-1.5 text-[12px] font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[9px]">
      <span className="text-muted-foreground">{label}</span>

      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function HealthDot({ status }: { status: 'ON_TRACK' | 'ATTENTION' | 'AT_RISK' }) {
  return (
    <span
      aria-hidden="true"
      className={[
        'size-1.5 shrink-0 rounded-full',

        status === 'ON_TRACK' ? 'bg-theme-accent' : '',

        status === 'ATTENTION' ? 'bg-amber-500' : '',

        status === 'AT_RISK' ? 'bg-red-500' : ''
      ].join(' ')}
    />
  );
}
