import type { RuntimeMetrics } from '@/server/runtime-monitor/read';
import type { ProjectActivitySummary } from '@/server/rcentz-api/project-activity-client';
import { hasProjectBrief } from '@/features/client/lib/workspace';
import { FileText, Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import Link from 'next/link';

import type { ClientProjectAnalytics } from '@/features/analytics/server/read/get-client-project-analytics';
import { ProjectDecisionSummary } from './ProjectDecisionSummary';




import {
  CalendarDays,
  ChevronDown,
  Clock3,
  ArrowUpRight,
  Eye,
  GitBranch,
  Globe2,
  Layers3,
  ServerCog
} from 'lucide-react';

import { CopyProjectIdButton } from '@/features/client/components/overview/CopyProjectIdButton';

import { ProjectScreenshotCarousel } from '@/features/client/components/overview/ProjectScreenshotCarousel';

import { ClientProjectMilestonesSection } from '@/features/client/components/projects/ClientProjectMilestonesSection';

import type { ClientProject } from '@/features/client/server/projects/get-client-project';

type ProjectDetailsSectionProps = {
  project: ClientProject;
  analytics?: ClientProjectAnalytics;
  runtimeMetrics?: RuntimeMetrics;
  activity?: ProjectActivitySummary;
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

function getHostname(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).hostname;
  } catch {
    return value.replace(/^https?:\/\//, '').split('/')[0];
  }
}

function safeHttpUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
function safeGithubRepositoryUrl(value: string | null | undefined) {
  const url = safeHttpUrl(value);
  if (!url) return null;
  try { return new URL(url).hostname.toLowerCase() === 'github.com' ? url : null; }
  catch { return null; }
}
function getCurrentDeliverable(project: ClientProject) {
  return (
    project.deliverables.find(deliverable => deliverable.status === 'IN_PROGRESS') ??
    project.deliverables.find(
      deliverable =>
        deliverable.status === 'REVIEW' ||
        deliverable.status === 'BLOCKED' ||
        deliverable.status === 'READY'
    ) ??
    project.deliverables.find(deliverable => deliverable.status === 'PLANNED') ??
    null
  );
}

export function ProjectDetailsSection({
  project,
  analytics,
  runtimeMetrics,
  activity
}: ProjectDetailsSectionProps) {
  const currentDeliverable = getCurrentDeliverable(project);

  const liveUrl = project.portfolio?.liveUrl ?? null;

  const repositoryUrl = project.portfolio?.repositoryUrl ?? null;

  const projectTagline = project.portfolio?.tagline ?? 'Project delivery workspace';


  const hostingProvider = project.infrastructure?.hostingProvider ?? 'Not recorded';
  const safeLiveUrl = safeHttpUrl(liveUrl);
  const safeRepositoryUrl = safeGithubRepositoryUrl(repositoryUrl);
  const progress = clampProgress(project.progress);
  const commit = activity?.latestCommit ?? null;
  const commitUrl = commit &&
    /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(commit.repository) &&
    /^[a-f0-9]{7,40}$/i.test(commit.sha) &&
    safeRepositoryUrl?.includes(`github.com/${commit.repository}`)
      ? `https://github.com/${commit.repository}/commit/${commit.sha}`
      : null;
  const recordedAt = commit ? new Date(commit.committedAt) : null;
  const commitDate = recordedAt && Number.isFinite(recordedAt.getTime())
    ? new Intl.DateTimeFormat('en-NG', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos'
      }).format(recordedAt)
    : null;

  const technologies = project.technologies;

  const technologiesWithNotes = technologies.filter(
    technology =>
      Boolean(technology.purpose) ||
      Boolean(technology.rationale) ||
      Boolean(technology.description)
  );

  const milestones = project.milestones.filter(
    milestone => milestone.status !== 'CANCELLED'
  );

  const completedMilestones = milestones.filter(
    milestone => milestone.status === 'COMPLETED'
  ).length;

  const hasScopeInformation =
    Boolean(project.purpose) ||
    Boolean(project.expectedOutcome) ||
    Boolean(currentDeliverable?.agreementSummary) ||
    Boolean(currentDeliverable?.rationale) ||
    Boolean(currentDeliverable?.extensionReason);

  return (
    <div className="space-y-4">
      <section id="project-overview" aria-label="Customer project details" className="scroll-mt-24 overflow-hidden rounded-2xl border border-border bg-surface">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-raised px-4 py-3 sm:px-5">
          <div className="flex min-w-0 flex-wrap items-center gap-3 sm:gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-theme-accent/30 bg-theme-accent/[0.08] text-theme-accent">
              <Layers3 aria-hidden="true" className="size-5" />
            </span>
            <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">Project Details</h2>
            <span className="hidden h-7 w-px bg-border sm:block" aria-hidden="true" />
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground">
              <span className="size-2 rounded-full bg-theme-accent" aria-hidden="true" />
              {humanize(project.status)}
            </span>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {safeLiveUrl ? (
              <a href={safeLiveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-2 rounded-lg border border-theme-accent/40 bg-background px-3 text-xs font-medium text-theme-accent transition-colors hover:bg-surface-muted">
                <Eye className="size-4" aria-hidden="true" /> Preview live <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>
            ) : null}
            {safeRepositoryUrl ? (
              <a href={safeRepositoryUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface-muted">
                <GitBranch className="size-4" aria-hidden="true" /> GitHub repo <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>
            ) : null}
            <span title="A saved URL does not verify uptime" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-2.5 text-[11px] text-foreground">
              <Globe2 className={`size-3.5 ${safeLiveUrl ? 'text-emerald-500' : 'text-muted'}`} aria-hidden="true" />
              <span className={`size-1.5 rounded-full ${safeLiveUrl ? 'bg-emerald-500' : 'bg-muted'}`} aria-hidden="true" />
              {safeLiveUrl ? 'Live URL configured' : 'No live URL'}
            </span>
            <a href="#project-milestones" title="View registered milestones" aria-label={`Project progress ${progress}%; jump to milestones`} className="relative flex size-[72px] shrink-0 items-center justify-center rounded-full border border-border bg-background p-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent">
              <svg viewBox="0 0 64 64" className="block size-full shrink-0 -rotate-90 overflow-visible" aria-hidden="true">
                <circle cx="32" cy="32" r="27" stroke="currentColor" strokeWidth="4" fill="none" className="text-theme-accent/15" />
                <circle cx="32" cy="32" r="27" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray={2 * Math.PI * 27} strokeDashoffset={2 * Math.PI * 27 * (1 - progress / 100)} className="text-theme-accent" />
              </svg>
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] font-semibold tabular-nums text-foreground">{progress}%</span>
            </a>
            <Link href={`/dashboard/projects/${project.id}/brief`} title={hasProjectBrief(project) ? 'Review project brief' : 'Add product brief'} aria-label={hasProjectBrief(project) ? 'Review project brief' : 'Add product brief'} className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-surface-muted">
              {hasProjectBrief(project) ? <FileText className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
            </Link>
          </div>
        </header>

        <div className="grid min-w-0 w-full items-stretch xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex w-full min-w-0 max-w-full flex-col overflow-hidden border-b border-border p-4 sm:p-5 xl:border-b-0 xl:border-r">
            <ProjectScreenshotCarousel screenshots={project.media} projectName={project.name} projectTagline={projectTagline} compact />
          </div>
          <div className="flex w-full min-w-0 max-w-full flex-col gap-4 overflow-hidden p-4 sm:p-5">
            <div>
              <h3 className="break-words text-lg font-semibold tracking-tight text-foreground sm:text-xl">{project.name}</h3>
              {project.description ? <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{project.description}</p> : null}
            </div>
            <div className="grid gap-3 text-xs sm:grid-cols-2">
              <p className="flex flex-wrap items-center gap-2"><CalendarDays className="size-4 shrink-0 text-muted" aria-hidden="true" /><span className="text-muted">Registered</span><span className="text-foreground">{formatDate(project.createdAt)}</span></p>
              <p className="flex items-center gap-2"><Clock3 className="size-4 shrink-0 text-muted" aria-hidden="true" /><span className="text-foreground">{project.expectedEndAt ? `Target ${formatDate(project.expectedEndAt)}` : 'Target date not set'}</span></p>
              <p className="flex flex-wrap items-center gap-2 sm:col-span-2"><Layers3 className="size-4 shrink-0 text-muted" aria-hidden="true" /><span className="text-muted">Project ID</span><span className="min-w-0 truncate font-mono text-foreground" title={project.id}>{project.id}</span><CopyProjectIdButton value={project.id} /></p>
              <p className="flex flex-wrap items-center gap-2 sm:col-span-2"><Globe2 className="size-4 shrink-0 text-muted" aria-hidden="true" /><span className="text-muted">Live domain</span>{safeLiveUrl ? <a href={safeLiveUrl} target="_blank" rel="noopener noreferrer" className="min-w-0 break-all font-medium text-theme-accent hover:underline">{getHostname(safeLiveUrl)} <ArrowUpRight className="inline size-3" aria-hidden="true" /></a> : <span className="text-foreground">Not configured</span>}</p>
              <p className="flex flex-wrap items-center gap-2 sm:col-span-2"><GitBranch className="size-4 shrink-0 text-muted" aria-hidden="true" /><span className="text-muted">Repository</span>{safeRepositoryUrl ? <a href={safeRepositoryUrl} target="_blank" rel="noopener noreferrer" className="min-w-0 break-all text-foreground hover:underline">{safeRepositoryUrl.replace(/^https?:\/\//, '')}</a> : <span className="text-foreground">Not connected</span>}</p>
              <p className="flex flex-wrap items-center gap-2 sm:col-span-2"><ServerCog className="size-4 shrink-0 text-muted" aria-hidden="true" /><span className="text-muted">Hosting</span><span className="text-foreground">{hostingProvider}</span></p>
            </div>
            <section id="project-activity" aria-label="Latest collected GitHub commit" className="scroll-mt-24 border-t border-border pt-3 text-xs xl:mt-auto">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="flex items-center gap-2 font-semibold text-foreground"><GitBranch className="size-4" aria-hidden="true" /> Latest GitHub commit</h4>
                {safeRepositoryUrl && activity?.state === 'SYNCED' ? <span className="text-emerald-500">Source synced</span> : null}
              </div>
              {safeRepositoryUrl && commit ? (
                <div className="mt-2 min-w-0 space-y-1.5">
                  {commitUrl ? <a href={commitUrl} target="_blank" rel="noopener noreferrer" className="block break-words font-medium leading-5 text-foreground hover:text-theme-accent hover:underline">{commit.message.split(/\r?\n/, 1)[0]} <ArrowUpRight className="inline size-3" aria-hidden="true" /></a> : <p className="break-words font-medium leading-5 text-foreground">{commit.message.split(/\r?\n/, 1)[0]}</p>}
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted">
                    <span className="font-mono text-foreground">{commit.sha.slice(0, 7)}</span><span aria-hidden="true">·</span><span className="break-all">{commit.repository}</span><span aria-hidden="true">·</span><span>Branch: {commit.branch}</span>
                    {commitDate ? <><span aria-hidden="true">·</span><time dateTime={commit.committedAt}>{commitDate}</time></> : null}
                  </p>
                  <p className="text-[11px] text-muted">Latest collected commit; milestone completion remains subject to admin review.</p>
                </div>
              ) : <p className="mt-2 text-muted">{!safeRepositoryUrl || activity?.state === 'NO_SOURCE' ? 'No GitHub source connected for this project.' : activity?.state === 'SYNC_ERROR' ? 'GitHub synchronization needs attention.' : 'No collected GitHub commit available for this project.'}</p>}
              <Link href={project.conversations[0] ? `/dashboard/messages?conversation=${project.conversations[0].id}` : '/dashboard/messages'} className="mt-3 inline-flex min-h-9 items-center gap-1 text-theme-accent hover:underline">Project conversations <ArrowUpRight className="size-3.5" aria-hidden="true" /></Link>
            </section>
          </div>
        </div>
      </section>
      <div id="project-activity" className="scroll-mt-24">
        <ProjectDecisionSummary
          project={{
            id: project.id,
            _count: { features: project._count.features },
            milestones: project.milestones.map(milestone => ({
              id: milestone.id,
              title: milestone.title,
              description: milestone.description,
              purpose: milestone.purpose,
              expectedOutcome: milestone.expectedOutcome,
              status: milestone.status,
              priority: milestone.priority,
              progress: milestone.progress,
              dueDate: milestone.dueDate?.toISOString() ?? null
            }))
          }}
          analytics={analytics}
          runtimeMetrics={runtimeMetrics}
          activity={activity}
        />
      </div>
      <section
        id="project-milestones"
        className="scroll-mt-24 overflow-hidden rounded-2xl border border-border bg-surface">
        <AnimatedDetails
          title="Milestone progress"
          meta={`${completedMilestones} of ${milestones.length} completed`}>
          <ClientProjectMilestonesSection project={project} />
        </AnimatedDetails>

        <AnimatedDetails title="Project Scope & Agreements" meta="Delivery context">
          {hasScopeInformation ? (
            <div className="grid gap-6 md:grid-cols-2">
              <ScopeItem
                title="Project Purpose"
                value={project.purpose ?? 'No project purpose has been published.'}
              />

              <ScopeItem
                title="Expected Outcome"
                value={
                  project.expectedOutcome ?? 'No expected outcome has been published.'
                }
              />

              {currentDeliverable?.agreementSummary ? (
                <ScopeItem
                  title="Current Agreement"
                  value={currentDeliverable.agreementSummary}
                />
              ) : null}

              {currentDeliverable?.rationale ? (
                <ScopeItem
                  title="Why This Deliverable"
                  value={currentDeliverable.rationale}
                />
              ) : null}

              {currentDeliverable ? (
                <div className="md:col-span-2">
                  <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
                    <div className="grid gap-5 sm:grid-cols-3">
                      <ScopeDate
                        label="Original deadline"
                        value={formatDate(currentDeliverable.originalDueDate)}
                      />

                      <ScopeDate
                        label="Current deadline"
                        value={formatDate(currentDeliverable.dueDate)}
                      />

                      <ScopeDate
                        label="Delivery status"
                        value={humanize(currentDeliverable.status)}
                      />
                    </div>

                    {currentDeliverable.extensionReason ? (
                      <div className="mt-5 border-t border-border pt-4">
                        <p className="text-xs font-medium text-muted-foreground">
                          Why the deadline changed
                        </p>

                        <p className="mt-2 text-sm leading-6 text-foreground">
                          {currentDeliverable.extensionReason}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              No client-visible scope or agreement information has been published yet.
            </p>
          )}
        </AnimatedDetails>

        <AnimatedDetails
          title="Development Summary"
          meta="Technology and technical context">
          <div className="overflow-hidden rounded-xl border border-border bg-background">
            <div className="p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-foreground">Technologies</h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Core technologies powering this project
              </p>

              {technologies.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {technologies.map(technology => (
                    <TechnologyBadge
                      key={technology.id}
                      name={technology.name}
                      category={technology.category}
                      featured={technology.featured}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-xs text-muted-foreground">
                  No technologies recorded.
                </p>
              )}

              {technologiesWithNotes.length > 0 ? (
                <div className="mt-6 border-t border-border pt-5">
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">
                      Technology Notes
                    </h4>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Why these technologies are used in this project
                    </p>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {technologiesWithNotes.map(technology => (
                      <TechnologyNoteCard
                        key={technology.id}
                        name={technology.name}
                        category={technology.category}
                        purpose={technology.purpose}
                        rationale={technology.rationale}
                        description={technology.description}
                        featured={technology.featured}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </AnimatedDetails>
      </section>
    </div>
  );
}

function AnimatedDetails({
  title,
  meta,
  children
}: {
  title: string;
  meta: string;
  children: ReactNode;
}) {
  return (
    <details className="group border-t border-border">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-5 transition-colors duration-200 hover:bg-surface-muted/60 sm:px-6 [&::-webkit-details-marker]:hidden">
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-out group-open:rotate-180"
        />

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground">{title}</p>
        </div>

        <span className="hidden text-xs text-muted-foreground sm:block">{meta}</span>
      </summary>

      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-open:grid-rows-[1fr]">
        <div className="overflow-hidden">
          <div className="-translate-y-1 border-t border-border bg-background/40 px-5 py-0 opacity-0 transition-[opacity,transform,padding] duration-300 ease-out group-open:translate-y-0 group-open:py-5 group-open:opacity-100 sm:px-6">
            {children}
          </div>
        </div>
      </div>
    </details>
  );
}

function TechnologyBadge({
  name,
  category,
  featured
}: {
  name: string;
  category: string | null;
  featured: boolean;
}) {
  return (
    <div
      title={category ? `${name} · ${category}` : name}
      className={[
        'inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5',

        featured ? 'border-theme-accent/20 bg-theme-accent/5' : 'border-border bg-surface'
      ].join(' ')}>
      <span
        className={[
          'size-1.5 rounded-full',
          featured ? 'bg-theme-accent' : 'bg-muted-foreground/40'
        ].join(' ')}
      />

      <span className="text-xs font-medium text-foreground">{name}</span>
    </div>
  );
}

function TechnologyNoteCard({
  name,
  category,
  purpose,
  rationale,
  description,
  featured
}: {
  name: string;
  category: string | null;
  purpose: string | null;
  rationale: string | null;
  description: string | null;
  featured: boolean;
}) {
  return (
    <article
      className={[
        'rounded-xl border p-4',

        featured
          ? 'border-theme-accent/20 bg-theme-accent/[0.035]'
          : 'border-border bg-surface'
      ].join(' ')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h5 className="truncate text-sm font-semibold text-foreground">{name}</h5>

          {category ? (
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {category}
            </p>
          ) : null}
        </div>

        <span
          className={[
            'mt-1 size-2 shrink-0 rounded-full',

            featured ? 'bg-theme-accent' : 'bg-border-strong'
          ].join(' ')}
        />
      </div>

      <div className="mt-4 space-y-3">
        {purpose ? <TechnologyCardField label="Purpose" value={purpose} /> : null}

        {rationale ? <TechnologyCardField label="Why" value={rationale} /> : null}

        {description ? <TechnologyCardField label="Notes" value={description} /> : null}
      </div>
    </article>
  );
}

function TechnologyCardField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-xs leading-5 text-foreground/85">{value}</p>
    </div>
  );
}

function ScopeItem({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{title}</p>

      <p className="mt-2 text-sm leading-6 text-foreground">{value}</p>
    </div>
  );
}

function ScopeDate({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>

      <p className="mt-1.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
