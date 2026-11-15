import { ProjectOverviewHero } from './ProjectOverviewHero';
import type { RuntimeMetrics } from '@/server/runtime-monitor/read';
import type { ProjectIntelligence } from '@/server/intelligence/read-project-intelligence';
import { ProjectIntelligenceDashboard } from './ProjectIntelligenceDashboard';
import { projectImagesConfigured } from '@/features/admin/server/media/project-images';
import { AdminProjectImages } from './AdminProjectImages';
import type { ReactNode } from 'react';

import Link from 'next/link';

import type { LucideIcon } from 'lucide-react';

import {
  ArrowUpRight,
  CalendarDays,
  FileStack,
  Globe2,
  Layers3,
  MessageSquareText,
  ReceiptText,
  ServerCog,
  Wrench
} from 'lucide-react';

import { AdminProjectMilestoneManager } from '@/features/admin/components/projects/AdminProjectMilestoneManager';
import { AdminProjectLogsHistory } from './AdminProjectLogsHistory';
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

export function AdminProjectPage({
  project,
  canReconcile = false,
  activity,
  tab = 'overview',
  selectorProjects = [], analytics, runtimeMetrics, intelligence }: AdminProjectPageProps) {
  const milestones = project.milestones.filter(milestone => milestone.status !== 'CANCELLED');

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

  const liveUrl = project.portfolio?.liveUrl ?? null;

  const repositoryUrl = project.portfolio?.repositoryUrl ?? null;

  return (
    <main className="rcentz-dashboard-frame px-4 py-6 sm:px-6 lg:px-8">
      <div className="rcentz-dashboard-inner mx-auto w-full max-w-[1200px] space-y-6">
        {/* PM-OVERVIEW-CLEANUP-V3 */}
        <section aria-label="Project navigation">
          <ProjectWorkspaceTabs currentProjectId={project.id} currentTab={tab} projects={selectorProjects} />
        </section>

        {tab === 'overview' ? (
          <>
            {/* PM-OVERVIEW-HERO-PASS-01 */}
            <ProjectOverviewHero project={project} activity={activity} />

            {/* PM-WORKSPACE-PASS-1 */}
            <AdminProjectMonitoringCards project={project} analytics={analytics} intelligence={intelligence} runtimeMetrics={runtimeMetrics} />

            {/* Advanced management remains available; registered milestones are shown above. */}
            <details id="advanced-milestone-management" className="rounded-2xl border border-border bg-surface">
              <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-foreground">Advanced milestone management · Add, edit or remove milestones</summary>
              <div className="border-t border-border p-3 sm:p-5">
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
              </div>
            </details>

            <details id="project-media" className="rounded-2xl border border-border bg-surface">
              <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-foreground">Project media gallery · Manage screenshots</summary>
              <div className="border-t border-border p-3 sm:p-5">
                <AdminProjectImages projectId={project.id} images={project.media} configured={projectImagesConfigured()} />
              </div>
            </details>

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
        ) : tab === 'logs' ? (
          <AdminProjectLogsHistory project={project} activity={activity} canReconcile={canReconcile} />
        ) : (
          <section className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-base font-semibold text-foreground">
              {tab === 'resources' ? 'Resources' : 'Settings'}
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
