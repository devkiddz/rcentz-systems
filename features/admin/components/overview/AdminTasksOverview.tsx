import Link from 'next/link';

import { CalendarDays, CircleDot, UserRound } from 'lucide-react';

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
              <p className="truncate text-sm font-semibold tracking-[-0.015em] text-foreground">
                {task.title}
              </p>

              <p className="mt-1 truncate text-xs text-muted">{task.project.name}</p>
            </div>

            <span
              className={`shrink-0 text-xs font-semibold uppercase tracking-[0.08em] ${getPriorityClassName(
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
              className={`w-9 text-right text-xs font-semibold tabular-nums ${getProgressTextClassName(
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

                <AvatarFallback className="bg-surface-muted text-xs font-semibold">
                  {task.assignedTo ? getInitials(assigneeName) : <UserRound className="size-3" />}
                </AvatarFallback>
              </Avatar>

              <span className="truncate text-xs text-muted">{assigneeName}</span>
            </div>

            <div className="flex items-center gap-4">
              <span
                className={`flex items-center gap-1.5 text-xs font-medium ${statusPresentation.textClassName}`}>
                <CircleDot className="size-3" />

                {statusPresentation.label}
              </span>

              <span className="flex items-center gap-1.5 text-xs text-muted">
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

type Queue = {
  title: string;
  description: string;
  tasks: OverviewTask[];
};

function TaskQueue({ queue }: { queue: Queue }) {
  return (
    <section className="flex min-h-[190px] min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-background lg:h-full lg:min-h-0">
      <header className="shrink-0 border-b border-border p-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold">{queue.title}</h4>
          <span className="rounded-md bg-surface-muted px-2 py-0.5 text-xs font-semibold tabular-nums">
            {queue.tasks.length}
          </span>
        </div>
        <p className="mt-1 text-xs leading-4 text-muted">
          {queue.description}
        </p>
      </header>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-2.5">
        {queue.tasks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-3">
            <p className="text-xs leading-5 text-muted">
              No tasks in this queue.
            </p>
          </div>
        ) : (
          queue.tasks.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              isPreview={false}
            />
          ))
        )}
      </div>

      <footer className="shrink-0 border-t border-border p-2.5">
        <Link
          href="/admin/tasks"
          className="text-xs font-medium text-theme-accent hover:underline"
        >
          View all
        </Link>
      </footer>
    </section>
  );
}

export function AdminTasksOverview({ data }: AdminTasksOverviewProps) {
  const queues: Queue[] = [
    {
      title: 'To Do',
      description: 'Work waiting to begin.',
      tasks: data.tasks.filter(task => task.status === 'TODO')
    },
    {
      title: 'In Progress',
      description: 'Work currently being executed.',
      tasks: data.tasks.filter(task => task.status === 'IN_PROGRESS')
    },
    {
      title: 'Review & Blocked',
      description: 'Work requiring approval or intervention.',
      tasks: data.tasks.filter(
        task => task.status === 'REVIEW' || task.status === 'BLOCKED'
      )
    }
  ];

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
      <header className="shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold">Execution Queue</h3>
            <p className="mt-1 text-xs text-muted">
              Recorded project tasks requiring attention.
            </p>
          </div>
          <span className="text-xs text-muted">
            {data.tasks.length} in preview
          </span>
        </div>
      </header>

      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 gap-3 overflow-y-auto lg:grid-cols-3 lg:overflow-hidden [&>*]:min-w-0">
        {queues.map(queue => (
          <TaskQueue key={queue.title} queue={queue} />
        ))}
      </div>
    </div>
  );
}
