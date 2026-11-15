import Link from 'next/link';
import {
  ArrowUpRight, CalendarDays, Clock3, Eye, GitBranch,
  Globe2, Layers3, Pencil, UsersRound
} from 'lucide-react';
import { RcentzGithubIcon } from '@/ui-shell/brand/RcentzGithubIcon';
import type { ProjectActivitySummary } from '@/server/rcentz-api/project-activity-client';
import { AdminProjectImages } from './AdminProjectImages';
import { projectImagesConfigured } from '@/features/admin/server/media/project-images';
import type { AdminProject } from '@/features/admin/server/projects/get-admin-project';

type Props = { project: AdminProject; activity?: ProjectActivitySummary };

function displayDate(value: Date | string | null | undefined) {
  return value
    ? new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
    : 'Not recorded';
}
function humanize(value: string) {
  return value.toLowerCase().split('_').map(part => part[0].toUpperCase() + part.slice(1)).join(' ');
}
function externalUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export function ProjectOverviewHero({ project, activity }: Props) {
  const live = externalUrl(project.portfolio?.liveUrl);
  const repository = externalUrl(project.portfolio?.repositoryUrl);
  const progress = Math.max(0, Math.min(100, project.progress));
  const client = project.client?.clientProfile?.companyName ?? project.client?.name ?? 'Not assigned';
  const commit = activity?.latestCommit ?? null;
  const commitRepository = commit?.repository ?? '';
  const commitUrl = commit &&
    /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(commitRepository) &&
    /^[a-f0-9]{7,40}$/i.test(commit.sha)
      ? `https://github.com/${commitRepository}/commit/${commit.sha}`
      : null;
  const recordedAt = commit ? new Date(commit.committedAt) : null;
  const commitDate = recordedAt && Number.isFinite(recordedAt.getTime())
    ? new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' }).format(recordedAt)
    : null;

  const action = 'inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:border-theme-accent/40 hover:bg-surface-muted';

  return (
    <section aria-label="Project details" className="overflow-hidden rounded-2xl border border-border bg-surface">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-raised px-4 py-3 sm:px-5">
        <div className="flex min-w-0 flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-theme-accent/30 bg-theme-accent/[0.08] text-theme-accent">
            <Layers3 className="size-5" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">Project Details</h2>
          <span className="hidden h-7 w-px bg-border sm:block" aria-hidden="true" />
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground">
            <span className="size-2 rounded-full bg-theme-accent" aria-hidden="true" />
            {humanize(project.status)}
          </span>
        </div>
        <div className="flex max-w-full flex-wrap items-center gap-2">
          {live ? (
            <a className={action + ' border-theme-accent/50 text-theme-accent'} href={live} target="_blank" rel="noopener noreferrer">
              <Eye className="size-4" aria-hidden="true" /> Preview live <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          ) : null}
          {repository ? (
            <a className={action} href={repository} target="_blank" rel="noopener noreferrer">
              <RcentzGithubIcon className="size-4" /> GitHub repo <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          ) : (
            <Link className={action} href={`/admin/projects/${project.id}/sources`}>Connect repository</Link>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1.5 text-[11px] text-foreground" title="A saved URL does not verify current uptime">
            <Globe2 className={`size-3.5 ${live ? 'text-emerald-500' : 'text-muted'}`} aria-hidden="true" />
            <span className={`size-1.5 rounded-full ${live ? 'bg-emerald-500' : 'bg-muted'}`} aria-hidden="true" />
            {live ? 'Live URL configured' : 'No live URL'}
          </span>
          <a href="#project-milestones" title="Go to registered milestones" className="relative flex size-[72px] shrink-0 items-center justify-center rounded-full border border-border bg-background p-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent" aria-label={`Project progress ${progress}%; jump to milestones`}>
            <svg viewBox="0 0 64 64" className="block size-full shrink-0 -rotate-90 overflow-visible" aria-hidden="true">
              <circle cx="32" cy="32" r="27" stroke="currentColor" strokeWidth="4" fill="none" className="text-theme-accent/15" />
              <circle cx="32" cy="32" r="27" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray={2 * Math.PI * 27} strokeDashoffset={2 * Math.PI * 27 * (1 - progress / 100)} className="text-theme-accent" />
            </svg>
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] font-semibold tabular-nums text-foreground">{progress}%</span>
          </a>
          <Link className="flex size-9 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-surface-muted" href={`/admin/projects/${project.id}/edit`} title="Edit project" aria-label="Edit project">
            <Pencil className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <div className="grid min-w-0 items-stretch gap-0 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="flex min-w-0 flex-col border-b border-border p-4 sm:p-5 xl:border-b-0 xl:border-r">
          <AdminProjectImages
            display="hero"
            projectId={project.id}
            images={project.media}
            configured={projectImagesConfigured()}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-4 p-4 sm:p-5">
          <div>
            <h3 className="break-words text-lg font-semibold tracking-tight text-foreground sm:text-xl">{project.name}</h3>
            {project.description ? <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{project.description}</p> : null}
          </div>
          <div className="grid gap-3 text-xs sm:grid-cols-2">
            <p className="flex flex-wrap items-center gap-2"><CalendarDays className="size-4 shrink-0 text-muted" aria-hidden="true" /><span className="text-muted">Registered</span><span className="text-foreground">{displayDate(project.createdAt)}</span></p>
            <p className="flex items-center gap-2"><Clock3 className="size-4 shrink-0 text-muted" aria-hidden="true" /><span className="text-foreground">{project.expectedEndAt ? `Target ${displayDate(project.expectedEndAt)}` : 'Target date not set'}</span></p>
            <p className="flex flex-wrap items-center gap-2 sm:col-span-2"><UsersRound className="size-4 shrink-0 text-muted" aria-hidden="true" /><span className="text-muted">Client</span><span className="text-foreground">{client}</span></p>
            <p className="flex flex-wrap items-center gap-2 sm:col-span-2"><Globe2 className="size-4 shrink-0 text-muted" aria-hidden="true" /><span className="text-muted">Live domain</span>{live ? <a href={live} target="_blank" rel="noopener noreferrer" className="min-w-0 break-all font-medium text-theme-accent hover:underline">{new URL(live).host}<ArrowUpRight className="ml-1 inline size-3" aria-hidden="true" /></a> : <span className="text-foreground">Not configured</span>}</p>
            <p className="flex flex-wrap items-center gap-2 sm:col-span-2"><GitBranch className="size-4 shrink-0 text-muted" aria-hidden="true" /><span className="text-muted">Repository</span>{repository ? <a href={repository} target="_blank" rel="noopener noreferrer" className="min-w-0 break-all text-foreground hover:underline">{repository.replace(/^https?:\/\//, '')}</a> : <span className="text-foreground">Not connected</span>}</p>
          </div>
          <section aria-label="Latest collected GitHub commit" className="border-t border-border pt-3 text-xs xl:mt-auto">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="flex items-center gap-2 font-semibold text-foreground">
                <RcentzGithubIcon className="size-4 shrink-0" /> Latest GitHub commit
              </h4>
              {activity?.state === 'SYNCED' ? <span className="text-emerald-500">Source synced</span> : null}
            </div>
            {commit ? (
              <div className="mt-2 min-w-0 space-y-1.5">
                {commitUrl ? (
                  <a href={commitUrl} target="_blank" rel="noopener noreferrer" className="block break-words font-medium leading-5 text-foreground hover:text-theme-accent hover:underline">
                    {commit.message.split(/\r?\n/, 1)[0]} <ArrowUpRight className="inline size-3" aria-hidden="true" />
                  </a>
                ) : (
                  <p className="break-words font-medium leading-5 text-foreground">{commit.message.split(/\r?\n/, 1)[0]}</p>
                )}
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted">
                  <span className="font-mono text-foreground">{commit.sha.slice(0, 7)}</span>
                  <span aria-hidden="true">·</span>
                  <span className="break-all">{commit.repository}</span>
                  <span aria-hidden="true">·</span>
                  <span>Branch: {commit.branch}</span>
                  {commitDate ? <><span aria-hidden="true">·</span><time dateTime={commit.committedAt}>{commitDate}</time></> : null}
                </p>
                <p className="text-[11px] text-muted">Latest collected commit; full repository history is not yet exposed by the activity API.</p>
              </div>
            ) : (
              <p className="mt-2 text-muted">
                {activity?.state === 'NO_SOURCE'
                  ? 'No GitHub source connected for this project.'
                  : activity?.state === 'SYNC_ERROR'
                    ? 'GitHub synchronization needs attention.'
                    : 'No collected GitHub commit available for this project.'}
              </p>
            )}
            <Link href={`/admin/projects/${project.id}?tab=logs`} className="mt-2 inline-flex items-center gap-1 text-theme-accent hover:underline">
              Open Logs &amp; History <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </section>
        </div>
      </div>
    </section>
  );
}
