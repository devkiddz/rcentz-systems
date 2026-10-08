import Link from 'next/link';

import { AlertTriangle, CalendarDays, CircleDot, UserRound } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import type { OverviewTask, OverviewTasks } from '@/features/admin/server/overview/get-overview-tasks';

type AdminTasksOverviewProps = {
  data: OverviewTasks;
};

type TaskStatusPresentation = {
  label: string;
  dotClassName: string;
  textClassName: string;
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(namePart => namePart.charAt(0).toUpperCase())
    .join('');
}

function formatDate(date: Date | null) {
  if (!date) {
    return 'No due date';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric'
  }).format(date);
}

function clampProgress(progress: number) {
  return Math.min(Math.max(progress, 0), 100);
}

function getProgressClassName(progress: number) {
  if (progress >= 95) {
    return 'bg-theme-accent';
  }

  if (progress >= 70) {
    return 'bg-sky-500';
  }

  if (progress >= 40) {
    return 'bg-amber-500';
  }

  return 'bg-rose-500';
}

function getProgressTextClassName(progress: number) {
  if (progress >= 95) {
    return 'text-theme-accent';
  }

  if (progress >= 70) {
    return 'text-sky-500';
  }

  if (progress >= 40) {
    return 'text-amber-500';
  }

  return 'text-rose-500';
}

function getTaskStatusPresentation(status: OverviewTask['status']): TaskStatusPresentation {
  switch (status) {
    case 'BLOCKED':
      return {
        label: 'Blocked',
        dotClassName: 'bg-rose-500',
        textClassName: 'text-rose-500'
      };

    case 'REVIEW':
      return {
        label: 'Review',
        dotClassName: 'bg-violet-500',
        textClassName: 'text-violet-500'
      };

    case 'IN_PROGRESS':
      return {
        label: 'In progress',
        dotClassName: 'bg-sky-500',
        textClassName: 'text-sky-500'
      };

    case 'TODO':
      return {
        label: 'To do',
        dotClassName: 'bg-amber-500',
        textClassName: 'text-amber-500'
      };

    default:
      return {
        label: status,
        dotClassName: 'bg-muted',
        textClassName: 'text-muted'
      };
  }
}

function getPriorityClassName(priority: OverviewTask['priority']) {
  switch (priority) {
    case 'URGENT':
      return 'text-rose-500';

    case 'HIGH':
      return 'text-amber-500';

    case 'NORMAL':
      return 'text-foreground';

    case 'LOW':
      return 'text-muted';

    default:
      return 'text-muted';
  }
}

function TaskRow({ task, isPreview }: { task: OverviewTask; isPreview: boolean }) {
  const progress = clampProgress(task.progress);

  const statusPresentation = getTaskStatusPresentation(task.status);

  const assigneeName = task.assignedTo?.name ?? 'Unassigned';

  const content = (
    <div className="rounded-2xl border border-border bg-background p-4 transition-colors hover:bg-surface-raised">
      <div className="flex items-start gap-3">
        <div className="relative mt-1.5 flex size-4 shrink-0 items-center justify-center">
          <span className={`size-2 rounded-full ${statusPresentation.dotClassName}`} />

          {task.status === 'IN_PROGRESS' ? (
            <span className="absolute size-4 animate-ping rounded-full border border-sky-500/40" />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold tracking-[-0.015em] text-foreground">
                {task.title}
              </p>

              <p className="mt-1 truncate text-[11px] text-muted">{task.project.name}</p>
            </div>

            <span
              className={`shrink-0 text-[10px] font-semibold uppercase tracking-[0.08em] ${getPriorityClassName(
                task.priority
              )}`}>
              {task.priority}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
              <div
                className={`h-full rounded-full ${getProgressClassName(progress)}`}
                style={{
                  width: `${progress}%`
                }}
              />
            </div>

            <span
              className={`w-9 text-right text-[10px] font-semibold tabular-nums ${getProgressTextClassName(
                progress
              )}`}>
              {progress}%
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Avatar className="size-6 shrink-0">
                {task.assignedTo?.image ? (
                  <AvatarImage src={task.assignedTo.image} alt={assigneeName} />
                ) : null}

                <AvatarFallback className="bg-surface-muted text-[8px] font-semibold">
                  {task.assignedTo ? getInitials(assigneeName) : <UserRound className="size-3" />}
                </AvatarFallback>
              </Avatar>

              <span className="truncate text-[10px] text-muted">{assigneeName}</span>
            </div>

            <div className="flex items-center gap-4">
              <span
                className={`flex items-center gap-1.5 text-[10px] font-medium ${statusPresentation.textClassName}`}>
                <CircleDot className="size-3" />

                {statusPresentation.label}
              </span>

              <span className="flex items-center gap-1.5 text-[10px] text-muted">
                <CalendarDays className="size-3" />

                {formatDate(task.dueDate)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isPreview) {
    return content;
  }

  return (
    <Link href={`/admin/projects/${task.project.id}`} className="block">
      {content}
    </Link>
  );
}

export function AdminTasksOverview({ data }: AdminTasksOverviewProps) {
  const isPreview = false;

  const visibleTasks = data.tasks;

  const summary = {
    todo: visibleTasks.filter(task => task.status === 'TODO').length,

    inProgress: visibleTasks.filter(task => task.status === 'IN_PROGRESS').length,

    review: visibleTasks.filter(task => task.status === 'REVIEW').length,

    blocked: visibleTasks.filter(task => task.status === 'BLOCKED').length
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 px-1 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-semibold text-foreground">Execution queue</p>

              {isPreview ? (
                <span className="rounded-full border border-border bg-surface-raised px-2 py-0.5 text-[8px] font-medium uppercase tracking-[0.08em] text-muted">
                  Preview
                </span>
              ) : null}
            </div>

            <p className="mt-1 text-[11px] text-muted">Current project work requiring attention.</p>
          </div>

          <Link
            href="/admin/tasks"
            className="text-[11px] font-medium text-muted transition-colors hover:text-foreground">
            View all
          </Link>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[10px]">
          <span className="text-amber-500">Todo {summary.todo}</span>

          <span className="text-sky-500">Active {summary.inProgress}</span>

          <span className="text-violet-500">Review {summary.review}</span>

          <span className="flex items-center gap-1 text-rose-500">
            <AlertTriangle className="size-3" />
            Blocked {summary.blocked}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="space-y-2.5">
          {visibleTasks.map(task => (
            <TaskRow key={task.id} task={task} isPreview={isPreview} />
          ))}
        </div>
      </div>
    </div>
  );
}
