import type { CSSProperties } from 'react';

import Link from 'next/link';

import { ArrowRight, CalendarDays, FolderKanban, Plus } from 'lucide-react';

import type { ClientOverviewProject } from '@/features/client/server/overview/get-client-overview';

type ClientProjectsProgressProps = {
  projects: ClientOverviewProject[];
};

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatDate(date: Date | null) {
  if (!date) {
    return 'No target';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric'
  }).format(date);
}

function clampProgress(progress: number) {
  return Math.min(Math.max(progress, 0), 100);
}

function getProgressPresentation(progress: number) {
  if (progress >= 95) {
    return {
      ring: 'var(--theme-accent)',

      textClassName: 'text-theme-accent',

      label: 'Near complete'
    };
  }

  if (progress >= 70) {
    return {
      ring: '#0ea5e9',

      textClassName: 'text-sky-500',

      label: 'Advancing'
    };
  }

  if (progress >= 40) {
    return {
      ring: '#f59e0b',

      textClassName: 'text-amber-500',

      label: 'In progress'
    };
  }

  return {
    ring: '#f43f5e',

    textClassName: 'text-rose-500',

    label: 'Early stage'
  };
}

export function ClientProjectsProgress({
  projects
}: ClientProjectsProgressProps) {
  return (
    <section className="flex h-[320px] flex-col overflow-hidden rounded-[18px] border border-border bg-background">
      <div className="flex shrink-0 items-start justify-between gap-4 px-4 py-4 sm:px-5">
        <div>
          <p className="text-sm font-semibold tracking-[-0.025em] text-foreground">
            Your Projects
          </p>

          <p className="mt-1 text-[11px] text-muted">
            Current delivery and project workspace
          </p>
        </div>

        <Link
          href="/dashboard/projects"
          className="flex items-center gap-1 text-[11px] text-muted transition-colors hover:text-foreground"
        >
          View all
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          px-3
          pb-3
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden

          sm:px-4
        "
      >
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const progress = clampProgress(project.progress);

            const presentation = getProgressPresentation(progress);

            const style = {
              '--project-progress': `${progress}%`,

              '--project-progress-color': presentation.ring
            } as CSSProperties;

            return (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                style={style}
                className="
                    group
                    relative
                    min-w-0
                    rounded-[16px]
                    border
                    border-transparent
                    bg-[linear-gradient(var(--background),var(--background))_padding-box,conic-gradient(var(--project-progress-color)_var(--project-progress),var(--border)_0)_border-box]
                    p-[1px]
                    transition-transform
                    hover:-translate-y-px
                  "
              >
                <div className="h-full rounded-[15px] bg-background px-3 py-3 transition-colors group-hover:bg-surface-raised">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-semibold tracking-[-0.02em] text-foreground">
                        {project.name}
                      </p>

                      <p className="mt-0.5 truncate text-[10px] text-muted">
                        {project.domain ?? project.liveUrl ?? 'Rcentz project'}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-theme-accent-faint px-2 py-1 text-[9px] font-medium text-theme-accent">
                      {formatStatus(String(project.status))}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2.5">
                    <div
                      className="relative flex size-12 shrink-0 items-center justify-center rounded-full"
                      style={{
                        background: `conic-gradient(
                              ${presentation.ring} ${progress}%,
                              var(--border) 0
                            )`
                      }}
                    >
                      <div className="absolute inset-[3px] rounded-full bg-background" />

                      <span
                        className={`relative z-10 text-[11px] font-semibold ${presentation.textClassName}`}
                      >
                        {progress}%
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[8px] uppercase tracking-[0.1em] text-muted">
                        Progress
                      </p>

                      <p
                        className={`mt-0.5 truncate text-[9px] font-medium ${presentation.textClassName}`}
                      >
                        {presentation.label}
                      </p>

                      <p className="mt-1 text-[9px] text-muted">
                        {project.milestoneSummary.completed}/
                        {project.milestoneSummary.total} milestones
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-border pt-2.5">
                    <p className="text-[9px] uppercase tracking-[0.1em] text-muted">
                      Current delivery
                    </p>

                    <p className="mt-1 truncate text-[10px] font-medium text-foreground">
                      {project.nextMilestone?.title ?? 'No open milestone'}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center gap-1 text-[9px] text-muted">
                    <CalendarDays aria-hidden="true" className="size-3" />

                    {formatDate(project.expectedEndAt)}
                  </div>
                </div>
              </Link>
            );
          })}

          <NewProjectPlaceholder hasProjects={projects.length > 0} />
        </div>
      </div>
    </section>
  );
}

function NewProjectPlaceholder({ hasProjects }: { hasProjects: boolean }) {
  return (
    <div
      className="
        flex
        min-h-[190px]
        flex-col
        items-center
        justify-center
        rounded-[16px]
        border
        border-dashed
        border-border
        bg-surface-raised/40
        px-5
        py-5
        text-center
      "
    >
      <div
        className="
          flex
          size-11
          items-center
          justify-center
          rounded-2xl
          border
          border-theme-accent/20
          bg-theme-accent-faint
        "
      >
        <FolderKanban aria-hidden="true" className="size-4 text-theme-accent" />
      </div>

      <p className="mt-3 text-[12px] font-semibold text-foreground">
        {hasProjects ? 'Start another project' : 'Start your first project'}
      </p>

      <p className="mt-1 max-w-[190px] text-[9px] leading-4 text-muted">
        Tell Rcentz what you would like us to build, improve or manage.
      </p>

      <Link
        href="/dashboard/onboarding"
        className="
          mt-4
          inline-flex
          min-h-11
          items-center
          gap-1.5
          rounded-xl
          bg-foreground
          px-3
          text-[10px]
          font-semibold
          text-background
          transition-all
          duration-150
          hover:-translate-y-px
          hover:opacity-90
        "
      >
        <Plus aria-hidden="true" className="size-3.5" />
        {hasProjects ? 'Start another project' : 'Start your first project'}
      </Link>
    </div>
  );
}
