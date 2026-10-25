import {
  GitCommitHorizontal,
  GitBranch
} from 'lucide-react';

import type {
  ProjectActivitySummary
} from '@/server/rcentz-api/project-activity-client';

function elapsed(value: string) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return 'Unknown time';

  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return minutes + 'm ago';

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + 'h ago';

  const days = Math.floor(hours / 24);
  if (days < 30) return days + 'd ago';

  return new Date(timestamp).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

const markerName = {
  start: 'Started',
  complete: 'Completion requested',
  reopen: 'Reopened',
  cancel: 'Cancelled',
  seal: 'Seal recorded'
} as const;

export function ProjectActivityRows({
  activity
}: {
  activity: ProjectActivitySummary | undefined;
}) {
  const milestone = activity?.latestMilestoneEvent;
  const commit = activity?.latestCommit;

  const fallback = activity?.state === 'NO_SOURCE'
    ? 'No delivery source connected'
    : activity?.state === 'AWAITING_SYNC'
      ? 'Awaiting source synchronization'
      : activity?.state === 'SYNC_ERROR'
        ? 'Source synchronization needs attention'
        : activity?.state === 'SOURCE_LIMIT_EXCEEDED'
          ? 'Source limit exceeded'
          : activity?.state === 'UNAVAILABLE'
            ? 'Activity service unavailable'
            : 'No recorded activity';

  return (
    <div className="border-t border-border bg-surface-muted/30 px-4 py-3">
      <div className="flex items-start gap-2.5 py-2">
        <GitCommitHorizontal
          aria-hidden="true"
          className="mt-0.5 size-4 shrink-0 text-muted"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-foreground">
              Milestone activity
            </span>
            {milestone && (
              <time
                dateTime={milestone.committedAt}
                title={new Date(milestone.committedAt).toLocaleString('en-NG')}
                className="shrink-0 text-[10px] text-muted"
              >
                {elapsed(milestone.committedAt)}
              </time>
            )}
          </div>
          <p
            className="mt-1 truncate text-xs text-muted"
            title={milestone?.message}
          >
            {milestone
              ? markerName[milestone.kind] + ': ' + milestone.milestoneKey
              : fallback}
          </p>
          {milestone && (
            <p className="mt-0.5 truncate text-[10px] text-muted">
              Recorded marker ? Not verified here
            </p>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2.5 border-t border-border/60 py-2">
        <GitBranch
          aria-hidden="true"
          className="mt-0.5 size-4 shrink-0 text-muted"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-foreground">
              Recent Git commit
            </span>
            {commit && (
              <time
                dateTime={commit.committedAt}
                title={new Date(commit.committedAt).toLocaleString('en-NG')}
                className="shrink-0 text-[10px] text-muted"
              >
                {elapsed(commit.committedAt)}
              </time>
            )}
          </div>
          <p
            className="mt-1 truncate text-xs text-muted"
            title={commit?.message}
          >
            {commit?.message ?? fallback}
          </p>
          {commit && (
            <p className="mt-0.5 truncate font-mono text-[10px] text-muted">
              {commit.sha.slice(0, 7)} ? {commit.repository}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
