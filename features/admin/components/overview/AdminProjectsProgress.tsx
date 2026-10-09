import type { CSSProperties } from 'react';

import Link from 'next/link';

import { ArrowRight, CalendarDays, FolderKanban } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import type { OverviewProject } from '@/features/admin/server/overview/get-overview-projects';

type AdminProjectsProgressProps = {
  projects: OverviewProject[];
};

type ProgressPresentation = {
  ring: string;
  textClassName: string;
  label: string;
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(namePart => namePart.charAt(0).toUpperCase())
    .join('');
}

function formatProjectStatus(status: string) {
  return status
    .toLowerCase()
    .split('_')
    .map(statusPart => statusPart.charAt(0).toUpperCase() + statusPart.slice(1))
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

function getProgressPresentation(progress: number): ProgressPresentation {
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

export function AdminProjectsProgress({ projects }: AdminProjectsProgressProps) {
  return (
    <section className="flex h-[320px] flex-col overflow-hidden rounded-2xl border border-border bg-background">
      <div className="flex shrink-0 items-start justify-between gap-4 px-4 py-4 sm:px-5">
        <div>
          <p className="text-sm font-semibold tracking-[-0.025em] text-foreground">Projects</p>

          <p className="mt-1 text-xs text-muted">Active delivery and progress</p>
        </div>

        <Link
          href="/admin/projects"
          className="flex items-center gap-1 text-xs text-muted transition-colors hover:text-foreground">
          View all
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="flex size-10 items-center justify-center rounded-full border border-theme-accent/20 bg-theme-accent-faint">
            <FolderKanban aria-hidden="true" className="size-4 text-theme-accent" />
          </div>

          <p className="mt-3 text-sm font-medium text-foreground">No active projects</p>

          <p className="mt-1 max-w-[240px] text-xs leading-5 text-muted">
            Active projects will appear here when delivery begins.
          </p>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-4">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map(project => {
              const clientName = project.client?.name ?? 'Internal project';

              const projectProgress = clampProgress(project.progress);

              const progressPresentation = getProgressPresentation(projectProgress);

              const progressStyle = {
                '--project-progress': `${projectProgress}%`,
                '--project-progress-color': progressPresentation.ring
              } as CSSProperties;

              return (
                <Link
                  key={project.id}
                  href={`/admin/projects/${project.id}`}
                  style={progressStyle}
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
                  ">
                  <div className="h-full rounded-[15px] bg-background px-3 py-3 transition-colors group-hover:bg-surface-raised">
                    <div className="flex items-start gap-2.5">
                      <Avatar className="size-8 shrink-0">
                        {project.client?.image ? (
                          <AvatarImage src={project.client.image} alt={clientName} />
                        ) : null}

                        <AvatarFallback className="bg-surface-muted text-xs font-semibold">
                          {getInitials(clientName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold tracking-[-0.02em] text-foreground">
                          {project.name}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-muted">{clientName}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div
                          className="relative flex size-12 shrink-0 items-center justify-center rounded-full"
                          style={{
                            background: `conic-gradient(
                              ${progressPresentation.ring} ${projectProgress}%,
                              var(--border) 0
                            )`
                          }}>
                          <div className="absolute inset-[3px] rounded-full bg-background" />

                          <span
                            className={`relative z-10 text-xs font-semibold ${progressPresentation.textClassName}`}>
                            {projectProgress}%
                          </span>
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-[0.1em] text-muted">Progress</p>

                          <p
                            className={`mt-0.5 truncate text-xs font-medium ${progressPresentation.textClassName}`}>
                            {progressPresentation.label}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full bg-theme-accent-faint px-2 py-1 text-xs font-medium text-theme-accent">
                        {formatProjectStatus(project.status)}
                      </span>
                    </div>

                    <div className="mt-3 border-t border-border pt-2.5">
                      <p className="text-xs uppercase tracking-[0.1em] text-muted">Next milestone</p>

                      <p className="mt-1 truncate text-xs font-medium text-foreground">
                        {project.nextMilestone?.title ?? 'No open milestone'}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center gap-1 text-xs text-muted">
                      <CalendarDays aria-hidden="true" className="size-3" />

                      {formatDate(project.expectedEndAt)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
