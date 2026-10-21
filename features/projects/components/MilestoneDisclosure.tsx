'use client';
import { useRef, useState, useTransition, type ReactNode } from 'react';
import { CheckCircle2, ChevronDown, CircleDot, GitCommitHorizontal } from 'lucide-react';
import { readMilestoneDelivery, type MilestoneDelivery } from '@/features/projects/server/read-milestone-delivery';
const buttonClass = 'rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent disabled:opacity-50';
export function MilestoneDisclosure({ projectId, milestoneId, title, status, children }: {
  projectId: string; milestoneId: string; title: string; status: string; children: ReactNode;
}) {
  const [data, setData] = useState<MilestoneDelivery | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const generation = useRef(0);
  const complete = data?.managed ? data.phase === 'COMPLETE' : status === 'COMPLETED';
  function load(more = false) {
    const request = ++generation.current;
    setError(null);
    startTransition(async () => {
      const result = await readMilestoneDelivery(projectId, milestoneId, more ? data?.nextCursor ?? undefined : undefined);
      if (request !== generation.current) return;
      if (!result.data) { setError(result.error); return; }
      const next = result.data;
      setData(previous => more && previous ? { ...next, commits: [...previous.commits, ...next.commits.filter(c => !previous.commits.some(p => p.id === c.id))] } : next);
    });
  }
  return <details className="group/milestone border-b border-border last:border-b-0" onToggle={event => { if (event.currentTarget.open) load(); }}>
    <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-theme-accent sm:px-6 [&::-webkit-details-marker]:hidden">
      {complete ? <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-theme-accent" /> : <CircleDot aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />}
      <span className="min-w-0 flex-1 break-words">{title}<span className="sr-only">{complete ? ' — Completed' : ` — ${status.toLowerCase().replaceAll('_', ' ')}`}</span></span>
      <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform group-open/milestone:rotate-180" />
    </summary>
    <div>{children}</div>
    <div className="border-t border-border bg-background/30 px-5 py-4 sm:px-6" aria-busy={pending}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h4 className="text-xs font-semibold text-foreground">Commits and deployment</h4><button type="button" className={buttonClass} disabled={pending} onClick={() => load()}>Refresh activity</button></div>
      {error ? <p role="alert" className="text-xs text-destructive">{error}</p> : null}
      {!data && pending ? <p role="status" className="text-xs text-muted-foreground">Loading commit activity…</p> : null}
      {data?.managed ? <>
        <p className="mb-3 break-all text-xs text-muted-foreground">{data.repository} · {data.branch} · {data.phase === 'AWAITING' ? 'Awaiting checks and deployment' : data.phase?.toLowerCase()}</p>
        <ol className="space-y-3">{data.commits.map(commit => <li key={commit.id} className="flex gap-3 text-xs"><GitCommitHorizontal aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><div className="min-w-0"><p className="break-words text-foreground">{commit.message}</p><p className="mt-1 text-muted-foreground"><a href={`https://github.com/${data.repository}/commit/${commit.sha}`} target="_blank" rel="noreferrer noopener" className="font-mono underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-theme-accent">{commit.sha.slice(0, 7)}</a> · <time dateTime={commit.committedAt}>{new Date(commit.committedAt).toLocaleDateString('en-GB')}</time></p></div></li>)}</ol>
        {data.nextCursor ? <button type="button" className={`${buttonClass} mt-3`} disabled={pending} onClick={() => load(true)}>Load more commits</button> : null}
        {data.evidence ? <div className="mt-4 space-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
          {data.evidence.checks.map(check => <p key={check.name}>{check.name} · {check.state}</p>)}
          {data.evidence.deployment ? <p>Production deployment · {data.evidence.deployment.state}{data.evidence.deployment.url && /^https:\/\/[a-zA-Z0-9.-]+\.vercel\.app$/.test(data.evidence.deployment.url) ? <> · <a className="underline underline-offset-2" href={data.evidence.deployment.url} target="_blank" rel="noreferrer noopener">View deployment</a></> : null}</p> : <p>No matching production deployment recorded.</p>}
        </div> : null}
      </> : data ? <p className="text-xs text-muted-foreground">No GitHub commit stream is linked to this milestone.</p> : null}
    </div>
  </details>;
}
