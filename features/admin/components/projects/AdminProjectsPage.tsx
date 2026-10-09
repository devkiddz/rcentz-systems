'use client';
import { DeliveryProgress } from '@/components/ui/DeliveryProgress';

import { useMemo, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Eye,
  FolderKanban,
  ImageIcon,
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

export function AdminProjectsPage({ data }: AdminProjectsPageProps) {
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
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1200px] space-y-7">
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
            <div className="grid gap-6 xl:grid-cols-2">
              {projects.map(project => (
                <ProjectCard key={project.id} project={project} />
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

function ProjectCard({ project }: { project: AdminProjectListItem }) {
  const clientLabel =
    project.client?.clientProfile?.companyName ?? project.client?.name ?? 'No client assigned';

  const canPreview = project.visibility === 'PUBLIC' && Boolean(project.portfolio?.publishedAt);

  const liveUrl = project.portfolio?.liveUrl ?? null;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md">
      <Link
        href={`/admin/projects/${project.id}`}
        aria-label={`Open ${project.name} admin workspace`}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/40"
      />

      <div className="relative aspect-[16/6] overflow-hidden border-b border-border bg-surface-muted">
        {project.screenshot ? (
          <Image
            src={project.screenshot.url}
            unoptimized={project.screenshot.url.startsWith('/api/projects/')}
            alt={project.screenshot.alt ?? `${project.name} project`}
            fill
            sizes="(max-width: 1279px) 100vw, 50vw"
            className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.035]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex size-11 items-center justify-center rounded-xl border border-border bg-background">
                <ImageIcon className="size-4 text-muted" />
              </div>

              <p className="mt-2 text-xs text-muted">No project image</p>
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/5" />

        <span className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/45 px-2.5 py-1 font-mono text-[7px] uppercase tracking-[0.1em] text-white/80 backdrop-blur-md">
          {humanize(project.type)}
        </span>
      </div>

      <header className="border-b border-border bg-surface-raised px-5 py-5 sm:px-6">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusDot status={project.status} />

              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                {humanize(project.status)}
              </span>
            </div>

            <h2 className="mt-2.5 truncate text-base font-semibold tracking-[-0.025em] text-foreground">
              {project.name}
            </h2>

            <p className="mt-1.5 truncate font-mono text-xs text-muted">{project.slug}</p>
          </div>

          <span className="shrink-0 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium uppercase tracking-[0.08em] text-muted">
            {humanize(project.visibility)}
          </span>
        </div>
      </header>

      <div className="grid md:grid-cols-[minmax(0,0.92fr)_minmax(230px,1.08fr)]">
        <div className="border-b border-border p-5 sm:p-6 md:border-b-0 md:border-r">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background">
              <UserRound className="size-4 text-theme-accent" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted">Client</p>

              <p className="mt-1 truncate text-xs font-semibold text-foreground">{clientLabel}</p>

              {project.client ? (
                <p className="mt-1 truncate text-xs text-muted">{project.client.email}</p>
              ) : (
                <p className="mt-1 text-xs text-muted">Assignment pending</p>
              )}
            </div>
          </div>

          {project.description ? (
            <p className="mt-5 line-clamp-3 text-xs leading-5 text-muted">{project.description}</p>
          ) : null}

          <div className="mt-6">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-medium text-muted">Overall progress</span>

              <span className="text-sm font-semibold tabular-nums text-foreground">
                {project.progress}%
              </span>
            </div>

            <DeliveryProgress value={project.progress} label="Project progress" />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <ProjectMetric label="Deliverables" value={project._count.deliverables} />

            <ProjectMetric label="Features" value={project._count.features} />

            <ProjectMetric label="Tasks" value={project._count.tasks} />
          </div>
        </div>

        <div className="min-h-[250px] p-2">
          <MilestoneHealthChart
            completed={project.milestoneHealth.completed}
            active={project.milestoneHealth.active}
            remaining={project.milestoneHealth.remaining}
            total={project.milestoneHealth.total}
          />
        </div>
      </div>

      <footer className="border-t border-border bg-surface-muted/40 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <MetaItem label="Started" value={formatDate(project.startedAt)} />

            <MetaItem label="Target" value={formatDate(project.expectedEndAt)} />

            <MetaItem label="Updated" value={formatDate(project.updatedAt)} />
          </div>

          <div className="relative z-20 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            {canPreview ? (
              <Link
                href={`/portfolio/${project.slug}`}
                target="_blank"
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-surface-raised">
                <Eye className="size-3.5" />
                Preview
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex h-8 cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-muted opacity-50">
                <Eye className="size-3.5" />
                Preview
              </button>
            )}

            {liveUrl ? (
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-surface-raised">
                <ArrowUpRight className="size-3.5" />
                Live view
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex h-8 cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-muted opacity-50">
                <ArrowUpRight className="size-3.5" />
                Live view
              </button>
            )}

            <Link
              href={`/admin/projects/${project.id}`}
              className="ml-auto inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-foreground px-3 text-xs font-semibold text-background transition-opacity hover:opacity-90">
              <FolderKanban className="size-3.5" />
              Open workspace
            </Link>
          </div>
        </div>
      </footer>
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
