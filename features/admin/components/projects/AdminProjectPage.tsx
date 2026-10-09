import type { ReactNode } from 'react';

import Link from 'next/link';

import type { LucideIcon } from 'lucide-react';

import {
  ArrowLeft,
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

import type { AdminProject } from '@/features/admin/server/projects/get-admin-project';

type AdminProjectPageProps = {
  project: AdminProject;
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

export function AdminProjectPage({ project }: AdminProjectPageProps) {
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
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1200px] space-y-6">
        <section>
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground">
            <ArrowLeft className="size-3.5" />
            Projects
          </Link>

          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  aria-hidden="true"
                  className={['size-1.5 rounded-full', getStatusDotClass(project.status)].join(' ')}
                />

                <p className="font-mono text-xs uppercase tracking-[0.16em] text-theme-accent">
                  Project Management
                </p>
              </div>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
                {project.name}
              </h1>

              <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted">
                {project.serviceRequest ? 'Manage delivery, milestones and decisions for this project.' : (project.purpose ?? project.description ?? 'Project delivery workspace.').slice(0, 180)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge>{humanize(project.status)}</StatusBadge>

              <StatusBadge>{humanize(project.visibility)}</StatusBadge>

              {project.serviceRequest && project.serviceRequest.status !== 'DRAFT' ? (
                <Link href={`/admin/projects/${project.id}/onboarding`} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <FileStack aria-hidden="true" className="size-4" />
                  Preview onboarding
                </Link>
              ) : null}
              <Link
                href={`/admin/projects/${project.id}/edit`}
                className="inline-flex h-9 items-center gap-2 rounded-xl bg-foreground px-4 text-xs font-semibold text-background transition-opacity hover:opacity-90">
                <Pencil className="size-3.5" />
                Edit project
              </Link>
            </div>
          </div>

          {canPreview || liveUrl ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {canPreview ? (
                <Link
                  href={`/portfolio/${project.slug}`}
                  target="_blank"
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-foreground transition-colors hover:bg-surface-muted">
                  Public preview
                  <ArrowUpRight className="size-3.5" />
                </Link>
              ) : null}

              {liveUrl ? (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-foreground transition-colors hover:bg-surface-muted">
                  Live project
                  <ArrowUpRight className="size-3.5" />
                </a>
              ) : null}
            </div>
          ) : null}
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <OverviewMetric
            icon={CircleGauge}
            label="Progress"
            value={`${clampProgress(project.progress)}%`}
            note="Overall delivery"
          />

          <OverviewMetric
            icon={FolderKanban}
            label="Milestones"
            value={String(project._count.milestones)}
            note={`${completedMilestones} completed`}
          />

          <OverviewMetric
            icon={PackageCheck}
            label="Deliverables"
            value={String(project._count.deliverables)}
            note="Agreed outputs"
          />

          <OverviewMetric
            icon={ListChecks}
            label="Tasks"
            value={String(project._count.tasks)}
            note="Execution records"
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          <header className="border-b border-border bg-surface-raised px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Project control</h2>

                <p className="mt-1 text-xs text-muted">
                  Delivery status and agreed project details.
                </p>
              </div>

              <span className="text-xs text-muted">Updated {formatDate(project.updatedAt)}</span>
            </div>
          </header>

          <div className="grid xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <div className="border-b border-border p-5 sm:p-6 xl:border-b-0 xl:border-r">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted">
                  Overall progress
                </p>

                <div className="mt-3 flex items-end justify-between gap-4">
                  <span className="text-[34px] font-semibold tracking-[-0.06em] text-foreground">
                    {clampProgress(project.progress)}%
                  </span>

                  <span className="text-xs font-medium text-muted">{humanize(project.status)}</span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full bg-theme-accent transition-[width]"
                    style={{
                      width: `${clampProgress(project.progress)}%`
                    }}
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <ProjectMeta icon={CalendarDays} label="Started" value={formatDate(project.startedAt)} />

                <ProjectMeta icon={CalendarDays} label="Target" value={formatDate(project.expectedEndAt)} />

                <ProjectMeta icon={Flag} label="Status" value={humanize(project.status)} />

                <ProjectMeta
                  icon={CircleGauge}
                  label="Budget"
                  value={formatCurrency(project.budget, project.currency)}
                />
              </div>

              <div className="mt-6 rounded-xl border border-border bg-background p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface">
                    <UserRound className="size-4 text-theme-accent" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted">Client</p>

                    <p className="mt-1 truncate text-sm font-semibold text-foreground">{clientLabel}</p>

                    {project.client ? (
                      <p className="mt-1 truncate text-xs text-muted">{project.client.email}</p>
                    ) : (
                      <p className="mt-1 text-xs text-muted">Client assignment is pending.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="min-h-[340px] p-3">
              <MilestoneHealthChart
                completed={completedMilestones}
                active={activeMilestones}
                remaining={remainingMilestones}
                total={milestones.length}
              />
            </div>
          </div>
        </section>

        <AdminProjectMilestoneManager
          projectId={project.id}
          projectName={project.name}
          milestones={project.milestones.map(milestone => ({
            id: milestone.id,

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

            <InfoRow icon={Wrench} label="Support tickets" value={String(project._count.supportTickets)} />

            <InfoRow icon={CalendarDays} label="Updated" value={formatDate(project.updatedAt)} />
          </AdminInformationPanel>
        </section>

        <AdminDetails title="Deliverables" meta={`${project.deliverables.length} records`}>
          {project.deliverables.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {project.deliverables.map(deliverable => (
                <article key={deliverable.id} className="rounded-xl border border-border bg-background p-4">
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
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex size-8 items-center justify-center rounded-lg border border-border bg-background">
          <Icon className="size-3.5 text-theme-accent" />
        </div>

        <span className="text-xl font-semibold tracking-[-0.04em] text-foreground">{value}</span>
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
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background">
          <Icon className="size-4 text-theme-accent" />
        </div>

        <div>
          <p className="text-xs font-semibold text-foreground">{label}</p>

          <p className="mt-1 text-xs leading-4 text-muted">{note}</p>
        </div>

        <span className="ml-auto text-lg font-semibold tabular-nums text-foreground">{value}</span>
      </div>
    </div>
  );
}

function ProjectMeta({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-center gap-2">
        <Icon className="size-3.5 text-muted" />

        <span className="text-xs text-muted">{label}</span>
      </div>

      <p className="mt-2 text-xs font-semibold text-foreground">{value}</p>
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
    <div className="grid min-w-0 grid-cols-[minmax(0,8rem)_minmax(0,1fr)] items-center gap-4 py-3.5">
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
        <p className="truncate text-right text-xs font-semibold text-foreground">{value}</p>
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
