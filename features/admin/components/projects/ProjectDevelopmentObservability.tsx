'use client';

import { useState, useTransition } from 'react';
import { Activity, GitCommitHorizontal, RefreshCw } from 'lucide-react';
import { readMilestoneDelivery, type MilestoneDelivery } from '@/features/projects/server/read-milestone-delivery';
import { ReconciliationControls } from './ReconciliationControls';
import type { ProjectActivitySummary } from '@/server/rcentz-api/project-activity-client';

type SourceMilestone = { id: string; title: string };

export function ProjectDevelopmentObservability({ projectId, milestones, canReconcile = false, activity }: {
  projectId: string; milestones: SourceMilestone[]; canReconcile?: boolean; activity?: ProjectActivitySummary;
}) {
  const [selected, setSelected] = useState(milestones[0]?.id ?? '');
  const [result, setResult] = useState<{ milestoneId: string; data: MilestoneDelivery } | null>(null);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const current = result?.milestoneId === selected ? result.data : null;
  const events = current?.activityTimeline;
  const latest = activity?.latestCommit;
  const signals = activity?.milestoneEvents ?? (activity?.latestMilestoneEvent ? [activity.latestMilestoneEvent] : []);
  const commitHref = (repository: string, sha: string): string | null =>
    /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repository) && /^[a-f0-9]{40}$/i.test(sha)
      ? `https://github.com/${repository}/commit/${sha}` : null;

  function refresh() {
    if (!selected) return;
    const milestoneId = selected;
    setError('');
    startTransition(async () => {
      const response = await readMilestoneDelivery(projectId, milestoneId);
      if (!response.data) {
        setError(response.error ?? 'Development history is unavailable.');
        setResult(null);
        return;
      }
      setResult({ milestoneId, data: response.data });
    });
  }

  return (
    <section className="rounded-2xl border border-border bg-surface" aria-label="Project development observability">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-surface-raised px-5 py-4 sm:px-6">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground"><Activity aria-hidden="true" className="size-4" /> Development observability</h2>
          <p className="mt-1 text-xs leading-5 text-muted">Independent GitHub development evidence. Manual milestone status and progress are managed separately.</p>
        </div>
        {milestones.length ? <button type="button" onClick={refresh} disabled={pending || !selected} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground disabled:opacity-50"><RefreshCw aria-hidden="true" className="size-3.5" />{pending ? 'Loading…' : 'Load source activity'}</button> : null}
      </div>
      <div className="space-y-4 px-5 py-4 sm:px-6">
        <div className="space-y-3" aria-label="Independent GitHub activity">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-semibold text-foreground">Latest GitHub activity</h3>
            <span className="text-xs text-muted">{activity?.state === 'SYNCED' ? 'Synced' : activity?.state === 'NO_SOURCE' ? 'No repository' : activity?.state === 'SYNC_ERROR' ? 'Sync needs attention' : activity?.state === 'AWAITING_SYNC' ? 'Awaiting sync' : 'Unavailable'}</span>
          </div>
          {latest ? <article className="rounded-xl border border-border bg-background p-3 text-xs">
            <p className="whitespace-pre-wrap break-words font-medium text-foreground">{latest.message}</p>
            <p className="mt-2 break-all text-muted">{latest.repository} · {latest.branch} ·{' '}
              {commitHref(latest.repository, latest.sha) ? <a className="font-mono underline underline-offset-2" href={commitHref(latest.repository, latest.sha)!} target="_blank" rel="noopener noreferrer">{latest.sha.slice(0,7)}</a> : <span className="font-mono">{latest.sha.slice(0,7)}</span>}
              {' '}· {new Date(latest.committedAt).toLocaleDateString('en-GB')}
            </p>
          </article> : <p className="text-xs text-muted">No GitHub commits recorded for this project yet.</p>}
          {signals.length > 0 ? <details className="rounded-xl border border-border bg-background p-3">
            <summary className="cursor-pointer text-xs font-semibold text-foreground">Recognized milestone signals ({signals.length})</summary>
            <ol className="mt-3 space-y-2">{signals.map(signal => <li key={signal.sha} className="rounded-lg border border-border p-3 text-xs">
              <p className="whitespace-pre-wrap break-words font-medium text-foreground">{signal.message}</p>
              <p className="mt-2 text-muted">{signal.kind} · {signal.milestoneKey} · {signal.sha.slice(0,7)} · Not delivery approval</p>
            </li>)}</ol>
          </details> : null}
          <p className="text-xs text-muted">Showing the latest collected commit, not complete Git history. New commits appear after source synchronization.</p>
        </div>
        {milestones.length ? <details className="border-t border-border pt-4"><summary className="cursor-pointer text-xs font-semibold text-foreground">Legacy delivery evidence</summary><div className="mt-3 space-y-4">
          <label className="block max-w-xl text-xs font-medium text-foreground">Tracked milestone / source
            <select className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground" value={selected} onChange={event => { setSelected(event.target.value); setError(''); }}>
              {milestones.map(milestone => <option value={milestone.id} key={milestone.id}>{milestone.title}</option>)}
            </select>
          </label>
          {error ? <p role="alert" className="text-xs text-destructive">{error}</p> : null}
          {current ? <>
            <p className="break-words text-xs text-muted">{current.repository} · {current.branch} · Delivery verification: {current.phase ?? 'Unknown'}</p>
            {canReconcile && current.sourceId && current.targetDeliveryMilestoneId ? <ReconciliationControls key={`${selected}:${current.sourceId}`} projectId={projectId} sourceId={current.sourceId} targetDeliveryMilestoneId={current.targetDeliveryMilestoneId} commits={current.unassignedActivity ?? []} onCommitted={refresh} /> : null}
            {events ? <>
              <div className="flex flex-wrap gap-4 text-xs text-muted"><span>{events.length} recorded events in this window</span><span>{events.filter(event => event.kind === 'milestone-start').length} start markers</span><span>{events.filter(event => event.kind === 'milestone-complete').length} completion declarations</span><span>{events.filter(event => event.kind === 'milestone-seal').length} seal requests</span><span>{events.filter(event => event.kind === 'release').length} release references</span></div>
              <ol className="max-h-[30rem] space-y-2 overflow-y-auto">{events.map(event => <li key={event.id} className="flex gap-3 rounded-lg border border-border p-3 text-xs"><GitCommitHorizontal aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted" /><div className="min-w-0 flex-1"><p className="font-medium text-foreground">{event.message}</p><p className="mt-1 text-muted">{event.kind.replaceAll('-', ' ')} · {event.milestoneKey ?? 'Unassigned'} · <a className="font-mono underline underline-offset-2" href={`https://github.com/${current.repository}/commit/${event.sha}`} target="_blank" rel="noopener noreferrer">{event.sha.slice(0, 7)}</a> · <time dateTime={event.committedAt}>{new Date(event.committedAt).toLocaleDateString('en-GB')}</time>{event.version ? ` · ${event.version}` : ''}{event.issue ? ` · ${event.issue}` : ''}</p></div></li>)}</ol>
              {events.length === 0 ? <p className="text-xs text-muted">No development activity recorded for this source.</p> : null}
              {current.activityTimelineTruncated ? <p className="text-xs text-muted">Only the latest bounded activity window is shown; older records may exist.</p> : null}
            </> : <p className="text-xs text-muted">Project-level activity requires the updated API and administrator permission. Milestone evidence remains available in each milestone disclosure.</p>}
          </> : <p className="text-xs text-muted">Select a GitHub-tracked milestone and load its activity.</p>}
        </div></details> : null}
      </div>
    </section>
  );
}
