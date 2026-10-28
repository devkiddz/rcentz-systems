import type { RuntimeMetrics } from '@/server/runtime-monitor/read';
import type { ProjectIntelligence } from '@/server/intelligence/read-project-intelligence';
import { ProjectIntelligenceDashboard } from './ProjectIntelligenceDashboard';
import { projectImagesConfigured } from '@/features/admin/server/media/project-images';
import { DeliveryProgress } from '@/components/ui/DeliveryProgress';
import { AdminProjectImages } from './AdminProjectImages';
import type { ReactNode } from 'react';

import Link from 'next/link';

import type { LucideIcon } from 'lucide-react';

import {
  ArrowUpRight,
  CalendarDays,
  CircleGauge,
  FileStack,
  Flag,
  FolderKanban,
  Globe2,
  Layers3,
  ListChecks,
  MessageSquareText,
  PackageCheck,
  Pencil,
  ReceiptText,
  ServerCog,
  UserRound,
  Wrench
} from 'lucide-react';

import { MilestoneHealthChart } from '@/features/client/components/overview/MilestoneHealthChart';

import { AdminProjectMilestoneManager } from '@/features/admin/components/projects/AdminProjectMilestoneManager';
import { ProjectSectionTabs } from './ProjectSectionTabs';
import { ProjectDevelopmentObservability } from '@/features/admin/components/projects/ProjectDevelopmentObservability';
import { AdminProjectMonitoringCards } from './AdminProjectMonitoringCards';
import type { ClientProjectAnalytics } from '@/features/analytics/server/read/get-client-project-analytics';
import type { AdminProject } from '@/features/admin/server/projects/get-admin-project';
import type { ProjectActivitySummary } from '@/server/rcentz-api/project-activity-client';
import { ProjectWorkspaceTabs, type WorkspaceTab } from './ProjectWorkspaceTabs';

type AdminProjectPageProps = {
  project: AdminProject;
  canReconcile?: boolean;
  activity?: ProjectActivitySummary;
  analytics?: ClientProjectAnalytics | null;
  runtimeMetrics?: RuntimeMetrics;
  intelligence?: ProjectIntelligence | null;
  tab?: WorkspaceTab;
  selectorProjects?: Array<{ id: string; name: string }>;
};

function humanize(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function clampProgress(value: number) {
  return Math.min(100, Math.max(0, value));
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

function formatCurrency(
  value: {
    toString(): string;
  } | null,
  currency: string
) {
  if (!value) {
    return 'Not set';
  }

  const amount = Number(value.toString());

  if (!Number.isFinite(amount)) {
    return 'Not set';
  }

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(amount);
}

function getStatusDotClass(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 'bg-theme-accent';

    case 'ON_HOLD':
    case 'REVIEW':
      return 'bg-[var(--chart-warning)]';

    case 'CANCELLED':
    case 'BLOCKED':
      return 'bg-[var(--chart-danger)]';

    default:
      return 'bg-theme-accent';
  }
}

export function AdminProjectPage({
  project,
  canReconcile = false,
  activity,
  tab = 'overview',
  selectorProjects = [], analytics, runtimeMetrics, intelligence }: AdminProjectPageProps) {
  const milestones = project.milestones.filter(milestone => milestone.status !== 'CANCELLED');

  const completedMilestones = milestones.filter(milestone => milestone.status === 'COMPLETED').length;

  const activeMilestones = milestones.filter(
    milestone =>
      milestone.status === 'IN_PROGRESS' || milestone.status === 'REVIEW' || milestone.status === 'BLOCKED'
  ).length;

  const remainingMilestones = milestones.filter(milestone => milestone.status === 'PLANNED').length;

  const currentMilestone =
    milestones.find(milestone => milestone.status === 'IN_PROGRESS') ??
    milestones.find(milestone => milestone.status === 'REVIEW') ??
    milestones.find(milestone => milestone.status === 'BLOCKED') ??
    milestones.find(milestone => milestone.status === 'PLANNED') ??
    null;

  const currentDeliverable =
    project.deliverables.find(deliverable => deliverable.status === 'IN_PROGRESS') ??
    project.deliverables.find(deliverable => deliverable.status === 'REVIEW') ??
    project.deliverables.find(deliverable => deliverable.status === 'READY') ??
    project.deliverables.find(deliverable => deliverable.status === 'BLOCKED') ??
    project.deliverables.find(deliverable => deliverable.status === 'PLANNED') ??
    null;

  const clientLabel =
    project.client?.clientProfile?.companyName ?? project.client?.name ?? 'No client assigned';

  const liveUrl = project.portfolio?.liveUrl ?? null;

  const repositoryUrl = project.portfolio?.repositoryUrl ?? null;

  const canPreview = project.visibility === 'PUBLIC' && Boolean(project.portfolio?.publishedAt);

  return (
    <main className="rcentz-dashboard-frame px-4 py-6 sm:px-6 lg:px-8">
      <div className="rcentz-dashboard-inner mx-auto w-full max-w-[1200px] space-y-6">
        {/* PM-OVERVIEW-CLEANUP-V3 */}
        <section aria-label="Project navigation">
          <ProjectWorkspaceTabs currentProjectId={project.id} currentTab={tab} projects={selectorProjects} />
        </section>

        {tab === 'overview' ? (
          <>
            {/* PM-OVERVIEW-COMPACT-V2 */}
            <section
              aria-label="Project overview"
              className="overflow-hidden rounded-2xl border border-border bg-surface">
              <header className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-b border-border bg-surface-raised px-4 py-3 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <h2 className="whitespace-nowrap text-sm font-semibold text-foreground">Project Details</h2>
                  <details className="relative">
                    <summary
                      aria-label="Project actions"
                      className="flex size-8 cursor-pointer list-none items-center justify-center rounded-lg border border-border text-foreground hover:bg-surface-muted [&::-webkit-details-marker]:hidden">
                      <span aria-hidden="true" className="text-lg leading-none">
                        ···
                      </span>
                    </summary>

                    <div className="absolute left-0 top-full z-30 mt-1 min-w-40 rounded-lg border border-border bg-background p-1 shadow-lg">
                      <Link
                        href={`/admin/projects/${project.id}/edit`}
                        className="block rounded-md px-3 py-2 text-xs text-foreground hover:bg-surface-muted">
                        Edit project
                      </Link>

                      <Link
                        href={`/admin/projects/${project.id}/customer-view`}
                        className="block rounded-md px-3 py-2 text-xs text-foreground hover:bg-surface-muted">
                        Customer view
                      </Link>

                      <Link
                        href={`/admin/projects/${project.id}/sources`}
                        className="block rounded-md px-3 py-2 text-xs text-foreground hover:bg-surface-muted">
                        Development sources
                      </Link>
                    </div>
                  </details>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                  <span title="Last modified" className="inline-flex items-center gap-1.5 text-muted">
                    <CalendarDays className="size-3.5" />
                    {formatDate(project.updatedAt)}
                  </span>
                  <span title="Project status" className="inline-flex items-center gap-1.5 text-foreground">
                    <span className={`size-2 rounded-full ${getStatusDotClass(project.status)}`} />
                    {humanize(project.status)}
                  </span>
                  <span title="Project duration" className="inline-flex items-center gap-1.5 text-muted">
                    <CircleGauge className="size-3.5" />
                    {project.startedAt
                      ? `${Math.max(0, Math.floor((new Date(project.updatedAt).getTime() - new Date(project.startedAt).getTime()) / 86400000))} days recorded`
                      : 'Not started'}
                  </span>
                  <span title="Project visibility" className="inline-flex items-center gap-1.5 text-muted">
                    <Globe2 className="size-3.5" />
                    {humanize(project.visibility)}
                  </span>
                </div>
              </header>

              <div className="grid xl:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
                <div className="min-w-0 border-b border-border p-4 sm:p-5 xl:border-b-0 xl:border-r">
                  <div className="grid gap-5 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                    <div className="flex min-h-44 items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
                      {project.media[0]?.url ? (
                        <img
                          src={project.media[0].url}
                          alt={project.media[0].alt ?? `Screenshot of ${project.name}`}
                          className="aspect-video w-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 py-8 text-muted">
                          <FolderKanban className="size-7" />
                          <span className="text-xs">No project screenshot</span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 space-y-3 text-xs">
                      <p className="line-clamp-2 text-sm font-semibold text-foreground">{project.name}</p>
                      <div title="Client / project owner" className="flex items-start gap-2">
                        <UserRound className="mt-0.5 size-4 shrink-0 text-muted" />
                        <span className="break-words text-foreground">{clientLabel}</span>
                      </div>
                      {liveUrl ? (
                        <div title="Live project URL" className="flex items-start gap-2">
                          <Globe2 className="mt-0.5 size-4 shrink-0 text-muted" />
                          <a
                            href={liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-w-0 break-all text-foreground hover:underline">
                            {liveUrl.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      ) : null}
                      {repositoryUrl ? (
                        <div title="Repository" className="flex items-start gap-2">
                          <ServerCog className="mt-0.5 size-4 shrink-0 text-muted" />
                          <a
                            href={repositoryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-w-0 break-all text-foreground hover:underline">
                            {repositoryUrl.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      ) : null}
                      <div title="Started" className="flex items-start gap-2">
                        <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted" />
                        <span className="text-foreground">
                          Started {formatDate(project.startedAt ?? project.createdAt)}
                        </span>
                      </div>
                      {canPreview || liveUrl ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {canPreview ? (
                            <Link
                              href={`/portfolio/${project.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface-muted">
                              Public preview <ArrowUpRight className="size-3" />
                            </Link>
                          ) : null}
                          {liveUrl ? (
                            <a
                              href={liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface-muted">
                              Live project <ArrowUpRight className="size-3" />
                            </a>
                          ) : null}
                        </div>
                      ) : null}
                      {project.expectedEndAt ? (
                        <div title="Target date" className="flex items-start gap-2">
                          <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted" />
                          <span className="text-foreground">Target {formatDate(project.expectedEndAt)}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
                <aside aria-label="Project progress" className="min-w-0 p-4 sm:p-5">
                  <h3 className="text-xs font-semibold text-foreground">Project Progress</h3>
                  <div
                    className="relative mx-auto my-3 size-28"
                    role="img"
                    aria-label={`Overall project progress: ${clampProgress(project.progress)} percent`}>
                    <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
                      <circle
                        cx="60"
                        cy="60"
                        r="48"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="12"
                        className="text-theme-accent/15"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="48"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 48}
                        strokeDashoffset={2 * Math.PI * 48 * (1 - clampProgress(project.progress) / 100)}
                        className="text-theme-accent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <strong className="text-xl font-semibold tabular-nums text-foreground">
                        {clampProgress(project.progress)}%
                      </strong>
                    </div>
                  </div>
                  <div className="space-y-2 border-t border-border pt-3 text-xs">
                    <div className="flex justify-between gap-2">
                      <span className="text-muted">Milestones</span>
                      <span className="font-medium text-foreground">
                        {completedMilestones} / {milestones.length}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted">Latest commit</span>
                      <span className="font-mono font-medium text-foreground">
                        {activity?.latestCommit?.sha.slice(0, 7) ?? 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </aside>
              </div>
            </section>

            {/* PM-WORKSPACE-PASS-1 */}
            <AdminProjectMonitoringCards project={project} activity={activity} analytics={analytics} runtimeMetrics={runtimeMetrics} />

                        <ProjectSectionTabs
              milestones={<>
<div id="project-milestones" className="scroll-mt-24" />
            <AdminProjectMilestoneManager
              projectId={project.id}
              projectName={project.name}
              milestones={project.milestones.map(milestone => ({
                id: milestone.id,
                deliveryManaged: Boolean(milestone.delivery),

                title: milestone.title,

                slug: milestone.slug,

                description: milestone.description,

                purpose: milestone.purpose,

                expectedOutcome: milestone.expectedOutcome,

                status: milestone.status,

                priority: milestone.priority,

                visibility: milestone.visibility,

                progress: milestone.progress,

                sortOrder: milestone.sortOrder,

                startedAt: milestone.startedAt?.toISOString() ?? null,

                dueDate: milestone.dueDate?.toISOString() ?? null,

                completedAt: milestone.completedAt?.toISOString() ?? null,

                completionNotes: milestone.completionNotes,

                counts: {
                  deliverables: milestone._count.deliverables,

                  features: milestone._count.features,

                  processes: milestone._count.processes,

                  files: milestone._count.files
                }
              }))}
            />

                          </>}
              development={<>
<div id="project-development" className="scroll-mt-24" />
            <ProjectDevelopmentObservability
              activity={activity}
              canReconcile={canReconcile}
              projectId={project.id}
              milestones={project.milestones
                .filter(milestone => Boolean(milestone.delivery))
                .map(milestone => ({ id: milestone.id, title: milestone.title }))}
            />

                          </>}
              media={<>
<div id="project-media" className="scroll-mt-24" />
            <AdminProjectImages
              projectId={project.id}
              images={project.media}
              configured={projectImagesConfigured()}
            />

                          </>}
            />

<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <ManagementCard
                icon={Layers3}
                label="Features"
                value={project._count.features}
                note="Project capability records"
              />

              <ManagementCard
                icon={Wrench}
                label="Processes"
                value={project._count.processes}
                note="Requirements and blockers"
              />

              <ManagementCard
                icon={FileStack}
                label="Files"
                value={project._count.files}
                note="Project resources"
              />

              <ManagementCard
                icon={MessageSquareText}
                label="Updates"
                value={project._count.updates}
                note="Delivery activity"
              />
            </section>

            <section className="grid items-start gap-5 xl:grid-cols-2">
              <AdminInformationPanel title="Project access" description="Infrastructure and technical access">
                <InfoRow
                  icon={Globe2}
                  label="Domain"
                  value={project.infrastructure?.primaryDomain ?? 'Not recorded'}
                  href={liveUrl}
                />

                <InfoRow
                  icon={ServerCog}
                  label="Hosting"
                  value={project.infrastructure?.hostingProvider ?? 'Not recorded'}
                />

                <InfoRow
                  icon={ServerCog}
                  label="Database"
                  value={project.infrastructure?.databaseProvider ?? 'Not recorded'}
                />

                <InfoRow
                  icon={Globe2}
                  label="Repository"
                  value={
                    repositoryUrl
                      ? repositoryUrl.replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/\/$/, '')
                      : 'Not connected'
                  }
                  href={repositoryUrl}
                />
              </AdminInformationPanel>

              <AdminInformationPanel title="Commercial state" description="Connected business records">
                <InfoRow icon={ReceiptText} label="Invoices" value={String(project._count.invoices)} />

                <InfoRow
                  icon={MessageSquareText}
                  label="Conversations"
                  value={String(project._count.conversations)}
                />

                <InfoRow
                  icon={Wrench}
                  label="Support tickets"
                  value={String(project._count.supportTickets)}
                />

                <InfoRow icon={CalendarDays} label="Updated" value={formatDate(project.updatedAt)} />
              </AdminInformationPanel>
            </section>

            <AdminDetails title="Deliverables" meta={`${project.deliverables.length} records`}>
              {project.deliverables.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {project.deliverables.map(deliverable => (
                    <article
                      key={deliverable.id}
                      className="rounded-xl border border-border bg-background p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-mono text-xs uppercase tracking-[0.1em] text-theme-accent">
                            {humanize(deliverable.type)}
                          </p>

                          <h3 className="mt-1.5 text-sm font-semibold text-foreground">
                            {deliverable.title}
                          </h3>
                        </div>

                        <span className="shrink-0 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-medium text-muted">
                          {humanize(deliverable.status)}
                        </span>
                      </div>

                      {(deliverable.summary ?? deliverable.description) ? (
                        <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted">
                          {deliverable.summary ?? deliverable.description}
                        </p>
                      ) : null}

                      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-3">
                        <RecordStat label="Progress" value={`${clampProgress(deliverable.progress)}%`} />

                        <RecordStat label="Target" value={formatDate(deliverable.dueDate)} />

                        <RecordStat label="Visibility" value={humanize(deliverable.visibility)} />
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState message="No deliverables recorded yet." />
              )}
            </AdminDetails>

            <AdminDetails title="Scope & agreements" meta="Project intelligence">
              <div className="grid gap-4 md:grid-cols-2">
                <ScopeCard title="Purpose" value={project.purpose ?? 'No project purpose recorded.'} />

                <ScopeCard title="Vision" value={project.vision ?? 'No project vision recorded.'} />

                <ScopeCard
                  title="Expected outcome"
                  value={project.expectedOutcome ?? 'No expected outcome recorded.'}
                />

                <ScopeCard
                  title="Current delivery"
                  value={
                    currentDeliverable
                      ? `${currentDeliverable.title} — ${humanize(currentDeliverable.status)}`
                      : currentMilestone
                        ? `${currentMilestone.title} — ${humanize(currentMilestone.status)}`
                        : 'No active delivery record.'
                  }
                />
              </div>
            </AdminDetails>

            <AdminDetails title="Technology" meta={`${project.technologies.length} technologies`}>
              {project.technologies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map(technology => (
                    <span
                      key={technology.id}
                      className={[
                        'rounded-full border px-3 py-1.5 font-mono text-xs',
                        technology.featured
                          ? 'border-theme-accent/30 bg-theme-accent-faint text-theme-accent-strong'
                          : 'border-border bg-background text-muted'
                      ].join(' ')}>
                      {technology.name}

                      {technology.category ? ` · ${technology.category}` : ''}
                    </span>
                  ))}
                </div>
              ) : (
                <EmptyState message="No technologies recorded yet." />
              )}
            </AdminDetails>
          </>
        ) : tab === 'analytics' ? (
          <ProjectIntelligenceDashboard intelligence={intelligence ?? null} runtimeMetrics={runtimeMetrics} />
        ) : (
          <section className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-base font-semibold text-foreground">
              {tab === 'resources'
                ? 'Resources'
                : tab === 'logs'
                  ? 'Logs & History'
                  : 'Settings'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              This workspace tab is reserved for the next reorganization stage. Existing project records and
              controls remain available in Project Overview.
            </p>
            {tab === 'settings' ? (
              <Link
                href={`/admin/projects/${project.id}/edit`}
                className="mt-4 inline-flex rounded-lg border border-border px-3 py-2 text-xs font-medium">
                Open project editor
              </Link>
            ) : null}
          </section>
        )}
      </div>
    </main>
  );
}

function StatusBadge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
      {children}
    </span>
  );
}

function OverviewMetric({
  icon: Icon,
  label,
  value,
  note
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex size-8 items-center justify-center rounded-lg border border-border bg-background">
          <Icon className="size-3.5 text-theme-accent" />
        </div>

        <span className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">{value}</span>
      </div>

      <p className="mt-4 text-xs font-semibold text-foreground">{label}</p>

      <p className="mt-1 text-xs leading-4 text-muted">{note}</p>
    </div>
  );
}

function ManagementCard({
  icon: Icon,
  label,
  value,
  note
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  note: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background">
          <Icon className="size-4 text-theme-accent" />
        </div>

        <div>
          <p className="text-xs font-semibold text-foreground">{label}</p>

          <p className="mt-1 text-xs leading-4 text-muted">{note}</p>
        </div>

        <span className="ml-auto shrink-0 text-2xl font-semibold tabular-nums text-foreground">{value}</span>
      </div>
    </div>
  );
}

function ProjectMeta({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-surface-subtle p-4">
      <div className="flex items-center gap-2">
        <Icon className="size-3.5 text-muted" />

        <span className="text-xs text-muted">{label}</span>
      </div>

      <p className="mt-2 break-words text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function AdminInformationPanel({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface">
      <header className="border-b border-border bg-surface-raised px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>

        <p className="mt-1 text-xs text-muted">{description}</p>
      </header>

      <div className="divide-y divide-border px-5">{children}</div>
    </section>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string | null;
}) {
  return (
    <div className="grid min-w-0 gap-1 py-4 sm:grid-cols-[minmax(0,8rem)_minmax(0,1fr)] sm:items-center sm:gap-4">
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="size-3.5 shrink-0 text-muted" />

        <span className="truncate text-xs text-muted">{label}</span>
      </div>

      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="flex min-w-0 items-center justify-end gap-1.5 text-xs font-semibold text-foreground transition-colors hover:text-theme-accent">
          <span className="truncate">{value}</span>

          <ArrowUpRight className="size-3 shrink-0" />
        </a>
      ) : (
        <p className="break-words text-sm font-medium text-foreground sm:text-right">{value}</p>
      )}
    </div>
  );
}

function AdminDetails({ title, meta, children }: { title: string; meta: string; children: ReactNode }) {
  return (
    <details className="group overflow-hidden rounded-2xl border border-border bg-surface">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 bg-surface-raised px-5 transition-colors hover:bg-surface-muted sm:px-6 [&::-webkit-details-marker]:hidden">
        <span className="text-xs font-semibold text-foreground">{title}</span>

        <span className="text-xs text-muted">{meta}</span>
      </summary>

      <div className="border-t border-border p-4 sm:p-5">{children}</div>
    </details>
  );
}

function RecordStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.08em] text-muted">{label}</p>

      <p className="mt-1 text-xs font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ScopeCard({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-xl border border-border bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-theme-accent">{title}</p>

      <p className="mt-2 text-xs leading-5 text-foreground">{value}</p>
    </article>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
      <p className="text-xs text-muted">{message}</p>
    </div>
  );
}
