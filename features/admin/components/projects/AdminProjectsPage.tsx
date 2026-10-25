'use client';
import type { ProjectActivitySummary } from '@/server/rcentz-api/project-activity-client';
import { ProjectActivityRows } from '@/features/admin/components/projects/ProjectActivityRows';
import { DeliveryProgress } from '@/components/ui/DeliveryProgress';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import {
  CheckCircle2,
  CheckCheck,
  Clock3,
  FolderKanban,
  Plus,
  Search,
  UserRound
} from 'lucide-react';

import { MilestoneHealthChart } from '@/features/client/components/overview/MilestoneHealthChart';

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
            <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map(project => (
                <ProjectCard key={project.id} project={project} activity={activity[project.id]} />
              ))}

              {filter === 'ALL' && !search.trim() ? <CreateProjectPlaceholder /> : null}
            </div>

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

  const clientLabel =
    project.client?.clientProfile?.companyName ??
    project.client?.name ??
    'Unassigned';

  const canPreview =
    project.visibility === 'PUBLIC' &&
    Boolean(project.portfolio?.publishedAt);

  const highlight =
    project.status === 'ON_HOLD'
      ? 'Project currently on hold'
      : !project.client
        ? 'Client assignment required'
        : project.milestoneHealth.active > 0
          ? `${project.milestoneHealth.active} active milestone(s)`
          : project.milestoneHealth.total === 0
            ? 'No milestones recorded'
            : project.status === 'COMPLETED'
              ? 'Project delivery completed'
              : 'No active milestone recorded';

  return (
    <article className="relative flex min-w-0 flex-col overflow-visible rounded-2xl border border-border bg-surface transition-colors hover:border-border-strong">
      <div className="flex flex-1 flex-col gap-4 p-4">

        <div className="flex items-start gap-3">
          <div
            className="relative size-16 shrink-0"
            role="img"
            aria-label={`${project.name}: ${project.progress}% complete`}
          >
            <svg viewBox="0 0 64 64" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
              <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-theme-accent/15" />
              <circle
                cx="32" cy="32" r="28" fill="none"
                stroke="currentColor" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - Math.min(100, Math.max(0, project.progress)) / 100)}
                className="text-theme-accent transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-2 flex items-center justify-center rounded-full bg-background">
              <CheckCheck
                aria-hidden="true"
                strokeWidth={2}
                className={project.progress >= 100 ? "size-6 text-theme-accent" : "size-6 text-theme-accent/35"}
              />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <StatusDot status={project.status} />
              <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted">
                {humanize(project.status)}
              </span>
            </div>

            <Link
              href={`/admin/projects/${project.id}`}
              className="mt-1.5 block truncate text-sm font-semibold text-foreground hover:underline">
              {project.name}
            </Link>

            <p className="mt-1 truncate text-xs text-muted">{clientLabel}</p>
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              aria-label={`Options for ${project.name}`}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(open => !open)}
              className="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-surface-raised">
              <span aria-hidden="true">...</span>
            </button>

            {menuOpen ? (
              <div className="absolute right-0 top-full z-30 mt-1 w-44 rounded-xl border border-border bg-background p-1 shadow-lg">
                <Link href={`/admin/projects/${project.id}`} className="block rounded-lg px-3 py-2 text-xs hover:bg-surface-raised">Open workspace</Link>
                <Link href={`/admin/projects/${project.id}/edit`} className="block rounded-lg px-3 py-2 text-xs hover:bg-surface-raised">Edit project</Link>
                <Link href={`/admin/projects/${project.id}/sources`} className="block rounded-lg px-3 py-2 text-xs hover:bg-surface-raised">Development sources</Link>
                {canPreview ? (
                  <Link href={`/portfolio/${project.slug}`} target="_blank" className="block rounded-lg px-3 py-2 text-xs hover:bg-surface-raised">Public preview</Link>
                ) : null}
                {project.portfolio?.liveUrl ? (
                  <a href={project.portfolio.liveUrl} target="_blank" rel="noreferrer" className="block rounded-lg px-3 py-2 text-xs hover:bg-surface-raised">Live website</a>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-muted">Overall progress</span>
            <span className="font-semibold tabular-nums text-foreground">{project.progress}%</span>
          </div>
          <DeliveryProgress value={project.progress} label="Project progress" />
        </div>

        {project.milestonePreview.length > 0 ? (
          <div className="rounded-xl border border-border bg-background px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                Milestones · {project.milestonePreview.length}
              </p>
              <span className="text-[10px] text-muted">Recorded status</span>
            </div>
            <ol className="mt-2 space-y-2">
              {project.milestonePreview.slice(0, 2).map(milestone => (
                <li key={milestone.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="min-w-0 truncate text-foreground" title={milestone.title}>
                    {milestone.title}
                  </span>
                  <span className="shrink-0 text-[10px] text-muted">{humanize(milestone.status)}</span>
                </li>
              ))}
            </ol>
            {project.milestonePreview.length > 2 ? (
              <p className="mt-2 text-[10px] text-muted">
                +{project.milestonePreview.length - 2} more in More details
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="rounded-xl border border-border bg-surface-raised p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Highlight
          </p>
          <p className="mt-1.5 text-xs leading-5 text-foreground">{highlight}</p>
        </div>

        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(open => !open)}
          className="mt-auto flex w-full items-center justify-center rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-raised">
          {expanded ? 'Show less' : 'More details'}
        </button>

        {expanded ? (
          <div className="space-y-4 border-t border-border pt-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                Project details
              </p>
              <p className="mt-2 break-words text-xs leading-5 text-muted">
                {project.description || 'No project description recorded.'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <ProjectMetric label="Deliverables" value={project._count.deliverables} />
              <ProjectMetric label="Features" value={project._count.features} />
              <ProjectMetric label="Tasks" value={project._count.tasks} />
            </div>

            {project.milestonePreview.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Recorded milestones</p>
                <ol className="space-y-2">
                  {project.milestonePreview.map(milestone => (
                    <li key={milestone.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-xs">
                      <span className="min-w-0 break-words text-foreground">{milestone.title}</span>
                      <span className="shrink-0 text-muted">{humanize(milestone.status)} · {milestone.progress}%</span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            <MilestoneHealthChart
              completed={project.milestoneHealth.completed}
              active={project.milestoneHealth.active}
              remaining={project.milestoneHealth.remaining}
              total={project.milestoneHealth.total}
            />

            <div className="flex flex-wrap gap-3 text-xs">
              <MetaItem label="Started" value={formatDate(project.startedAt)} />
              <MetaItem label="Target" value={formatDate(project.expectedEndAt)} />
              <MetaItem label="Updated" value={formatDate(project.updatedAt)} />
            </div>
          </div>
        ) : null}
      </div>
          <ProjectActivityRows activity={activity} />
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
