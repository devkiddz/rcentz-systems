import { MilestoneDisclosure } from '@/features/projects/components/MilestoneDisclosure';
import { CalendarDays, CheckCircle2, CircleDot, FileText, Layers3, PackageCheck } from 'lucide-react';

import type { ClientProject } from '@/features/client/server/projects/get-client-project';

import { MilestoneRecordAction } from './MilestoneRecordAction';

type ClientProjectMilestonesSectionProps = {
  project: ClientProject;
};

function humanize(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return 'Not set';
  }

  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value));
}

function clampProgress(value: number) {
  return Math.min(100, Math.max(0, value));
}

function getStatusDotClass(status: string) {
  switch (status) {
    case 'COMPLETED':
    case 'IN_PROGRESS':
      return 'bg-theme-accent';

    case 'REVIEW':
      return 'bg-[var(--chart-warning)]';

    case 'BLOCKED':
      return 'bg-red-500';

    default:
      return 'bg-muted-foreground/40';
  }
}

export function ClientProjectMilestonesSection({ project }: ClientProjectMilestonesSectionProps) {
  const milestones = project.milestones.filter(milestone => milestone.status !== 'CANCELLED');

  const completed = milestones.filter(milestone => milestone.status === 'COMPLETED').length;

  const currentMilestone =
    milestones.find(milestone => milestone.status === 'IN_PROGRESS') ??
    milestones.find(milestone => milestone.status === 'REVIEW') ??
    milestones.find(milestone => milestone.status === 'BLOCKED') ??
    null;

  const recentlyCompleted =
    [...milestones].reverse().find(milestone => milestone.status === 'COMPLETED') ?? null;

  const nextMilestone = milestones.find(milestone => milestone.status === 'PLANNED') ?? null;

  const currentTopics = currentMilestone
    ? project.deliverables.filter(deliverable => deliverable.milestoneId === currentMilestone.id).slice(0, 4)
    : [];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Delivery roadmap
          </p>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Current progress, completed delivery and upcoming milestones.
          </p>
        </div>

        <span className="w-fit rounded-full border border-border bg-background px-3 py-1.5 text-[10px] font-medium text-muted-foreground">
          {completed} of {milestones.length} completed
        </span>
      </div>

      <div className="p-5 sm:p-6">
        {currentMilestone ? (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <CircleDot aria-hidden="true" className="size-4 text-theme-accent" />

                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Current milestone
                  </p>
                </div>

                <h3 className="mt-2 text-[16px] font-semibold tracking-[-0.025em] text-foreground">
                  {currentMilestone.title}
                </h3>

                {currentMilestone.description ? (
                  <p className="mt-2 max-w-2xl text-[12px] leading-5 text-muted-foreground">
                    {currentMilestone.description}
                  </p>
                ) : null}
              </div>

              <div className="shrink-0 sm:text-right">
                <p className="text-[30px] font-semibold tracking-[-0.055em] text-foreground">
                  {clampProgress(currentMilestone.progress)}%
                </p>

                <p className="mt-1 text-[10px] font-medium text-muted-foreground">
                  {humanize(currentMilestone.status)}
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-border pt-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Key topics
              </p>

              {currentTopics.length > 0 ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {currentTopics.map(topic => (
                    <div
                      key={topic.id}
                      className="flex items-start gap-2 rounded-lg border border-border bg-background/40 px-3 py-2.5">
                      <CheckCircle2
                        aria-hidden="true"
                        className="mt-0.5 size-3.5 shrink-0 text-theme-accent"
                      />

                      <span className="text-[11px] leading-4 text-foreground">{topic.title}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-[11px] text-muted-foreground">
                  No delivery topics published for this milestone yet.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex min-h-[180px] items-center justify-center">
            <div className="text-center">
              <CheckCircle2 aria-hidden="true" className="mx-auto size-6 text-theme-accent" />

              <p className="mt-3 text-sm font-medium text-foreground">No active milestone</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid border-t border-border sm:grid-cols-2">
        <MilestoneHeadline
          label="Recently completed"
          milestone={recentlyCompleted}
          fallback="No milestone completed yet"
        />

        <MilestoneHeadline
          label="Up next"
          milestone={nextMilestone}
          fallback="No upcoming milestone"
          bordered
        />
      </div>

      <div className="border-t border-border px-4 py-5 sm:px-5">
        <div>
          <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-foreground">Delivery map</h3>

          <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
            Concise project milestones. Formal delivery records can be requested after completion.
          </p>
        </div>

        {milestones.length > 0 ? (
          <div className="mt-4 divide-y divide-border rounded-[16px] border border-border bg-background/30">
            {milestones.map((milestone, index) => {
              const topics = project.deliverables
                .filter(deliverable => deliverable.milestoneId === milestone.id)
                .slice(0, 3);

              const record = milestone.records[0] ?? null;

              return (
                <MilestoneDisclosure key={milestone.id} projectId={project.id} milestoneId={milestone.id} title={milestone.title} status={milestone.status}>
                <div className="grid gap-5 px-5 pb-5 sm:px-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        M{String(index + 1).padStart(2, '0')}
                      </span>

                      <span
                        className={['size-1.5 rounded-full', getStatusDotClass(milestone.status)].join(' ')}
                      />

                      <span className="text-[10px] text-muted-foreground">{humanize(milestone.status)}</span>
                    </div>



                    {topics.length > 0 ? (
                      <p className="mt-1.5 line-clamp-1 text-[10px] text-muted-foreground">
                        {topics.map(topic => topic.title).join(' · ')}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center xl:justify-end">
                    <div className="flex items-center gap-5">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
                          Progress
                        </p>

                        <p className="mt-1 text-[13px] font-semibold text-foreground">
                          {clampProgress(milestone.progress)}%
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] uppercase tracking-[0.08em] text-muted-foreground">Target</p>

                        <p className="mt-1 text-[11px] font-medium text-foreground">
                          {formatDate(milestone.dueDate ?? milestone.completedAt)}
                        </p>
                      </div>

                      <div className="hidden items-center gap-4 lg:flex">
                        <MilestoneCount icon={PackageCheck} value={milestone._count.deliverables} />

                        <MilestoneCount icon={Layers3} value={milestone._count.features} />

                        <MilestoneCount icon={FileText} value={milestone._count.files} />
                      </div>
                    </div>

                    <div className="sm:min-w-[170px] sm:border-l sm:border-border sm:pl-4">
                      <MilestoneRecordAction
                        projectId={project.id}
                        milestoneId={milestone.id}
                        milestoneStatus={milestone.status}
                        record={record}
                      />
                    </div>
                  </div>
                </div>
                </MilestoneDisclosure>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-[16px] border border-dashed border-border px-6 py-10 text-center">
            <p className="text-sm font-medium text-foreground">No milestones published yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MilestoneHeadline({
  label,
  milestone,
  fallback,
  bordered = false
}: {
  label: string;

  milestone: ClientProject['milestones'][number] | null;

  fallback: string;
  bordered?: boolean;
}) {
  return (
    <div
      className={[
        'px-5 py-4 sm:px-6',

        bordered ? 'border-t border-border sm:border-l sm:border-t-0' : ''
      ].join(' ')}>
      <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">{label}</p>

      <p className="mt-2 text-[12px] font-semibold text-foreground">{milestone?.title ?? fallback}</p>

      {milestone ? (
        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <CalendarDays aria-hidden="true" className="size-3" />

          {formatDate(milestone.dueDate ?? milestone.completedAt)}
        </div>
      ) : null}
    </div>
  );
}

function MilestoneCount({ icon: Icon, value }: { icon: typeof FileText; value: number }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <Icon aria-hidden="true" className="size-3" />

      <span className="text-[10px] font-medium">{value}</span>
    </div>
  );
}
