import type { ReactNode } from "react";
import Link from "next/link";
import { Radio } from "lucide-react";
import type { ClientProjectAnalytics } from "@/features/analytics/server/read/get-client-project-analytics";
import { ProjectDecisionSummary } from "./ProjectDecisionSummary";

import type { LucideIcon } from "lucide-react";

import {
  CalendarDays,
  ChevronDown,
  CircleGauge,
  ExternalLink,
  Flag,
  GitBranch,
  Globe2,
  Layers3,
  ServerCog,
} from "lucide-react";

import { CopyProjectIdButton } from "@/features/client/components/overview/CopyProjectIdButton";
import { MilestoneHealthChart } from "@/features/client/components/overview/MilestoneHealthChart";
import { ProjectScreenshotCarousel } from "@/features/client/components/overview/ProjectScreenshotCarousel";

import { ClientProjectMilestonesSection } from "@/features/client/components/projects/ClientProjectMilestonesSection";

import type { ClientProject } from "@/features/client/server/projects/get-client-project";

type ProjectDetailsSectionProps = {
  project: ClientProject;
  analytics?: ClientProjectAnalytics;
};

function humanize(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
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
    return value.replace(/^https?:\/\//, "").split("/")[0];
  }
}

function getCurrentDeliverable(project: ClientProject) {
  return (
    project.deliverables.find(
      (deliverable) => deliverable.status === "IN_PROGRESS",
    ) ??
    project.deliverables.find(
      (deliverable) =>
        deliverable.status === "REVIEW" ||
        deliverable.status === "BLOCKED" ||
        deliverable.status === "READY",
    ) ??
    project.deliverables.find(
      (deliverable) => deliverable.status === "PLANNED",
    ) ??
    null
  );
}

export function ProjectDetailsSection({
  project,
  analytics,
}: ProjectDetailsSectionProps) {
  const currentDeliverable = getCurrentDeliverable(project);

  const liveUrl = project.portfolio?.liveUrl ?? null;

  const repositoryUrl = project.portfolio?.repositoryUrl ?? null;

  const projectTagline =
    project.portfolio?.tagline ??
    project.description ??
    "Project delivery workspace";

  const domain =
    project.infrastructure?.primaryDomain ??
    getHostname(liveUrl) ??
    "Not published";

  const hostingProvider =
    project.infrastructure?.hostingProvider ?? "Not recorded";

  const technologies = project.technologies;

  const technologiesWithNotes = technologies.filter(
    (technology) =>
      Boolean(technology.purpose) ||
      Boolean(technology.rationale) ||
      Boolean(technology.description),
  );

  const milestones = project.milestones.filter(
    (milestone) => milestone.status !== "CANCELLED",
  );

  const completedMilestones = milestones.filter(
    (milestone) => milestone.status === "COMPLETED",
  ).length;

  const activeMilestones = milestones.filter(
    (milestone) =>
      milestone.status === "IN_PROGRESS" ||
      milestone.status === "REVIEW" ||
      milestone.status === "BLOCKED",
  ).length;

  const remainingMilestones = milestones.filter(
    (milestone) => milestone.status === "PLANNED",
  ).length;

  const hasScopeInformation =
    Boolean(project.purpose) ||
    Boolean(project.expectedOutcome) ||
    Boolean(currentDeliverable?.agreementSummary) ||
    Boolean(currentDeliverable?.rationale) ||
    Boolean(currentDeliverable?.extensionReason);

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex min-h-16 items-center justify-between gap-4 border-b border-border px-5 sm:px-6">
        <div>
          <h2 className="text-sm font-semibold tracking-[-0.025em] text-foreground">
            Project Details
          </h2>

          <p className="mt-1 hidden text-xs text-muted-foreground sm:block">
            Current delivery, access and project state
          </p>
        </div>
      </div>

      <div className="grid gap-5 p-4 sm:p-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(220px,0.8fr)]">
        <div className="min-w-0">
          <p className="mb-3 text-xs font-semibold">
            Latest application preview
          </p>
          <ProjectScreenshotCarousel
            screenshots={project.media}
            projectName={project.name}
            projectTagline={projectTagline}
            liveUrl={liveUrl}
            compact
          />
        </div>
        <div className="min-w-0 space-y-5 xl:pt-7">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Application access
            </p>
            <p className="mt-2 text-sm font-semibold">{projectTagline}</p>
            {liveUrl ? (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/5 px-3 text-xs font-medium text-emerald-700 dark:text-emerald-400"
              >
                <Radio
                  aria-hidden="true"
                  className="size-3.5 motion-safe:animate-pulse"
                />{" "}
                Live application
                <ExternalLink aria-hidden="true" className="size-3" />
              </a>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                Preview not published yet
              </p>
            )}
          </div>
          <div className="space-y-3">
            <AccessRow
              icon={Globe2}
              label="Domain"
              value={domain}
              href={liveUrl}
            />
            <AccessRow
              icon={ServerCog}
              label="Hosting"
              value={hostingProvider}
            />
            <AccessRow
              icon={GitBranch}
              label="Repository"
              value={repositoryUrl ? "Source repository" : "Not connected"}
              href={repositoryUrl}
            />
            <ProjectIdRow projectId={project.id} />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-background">
          <MilestoneHealthChart
            completed={completedMilestones}
            active={activeMilestones}
            remaining={remainingMilestones}
            total={milestones.length}
            compact
            segments={milestones
              .filter((item) => item.status === "COMPLETED")
              .map((item) => item.title)}
          />
          <div className="border-t border-border px-4 py-3 text-center">
            <p className="text-xs font-medium">{humanize(project.status)}</p>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Last updated
            </p>
            <time
              dateTime={project.updatedAt.toISOString()}
              className="mt-1 block text-[11px] text-muted-foreground"
            >
              {new Intl.DateTimeFormat("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "Africa/Lagos",
              }).format(project.updatedAt)}{" "}
              WAT
            </time>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-border px-4 py-4 sm:grid-cols-4 sm:px-6">
        <ProjectMeta
          label="Started"
          value={formatDate(project.startedAt)}
          icon={CalendarDays}
        />
        <ProjectMeta
          label="Status"
          value={humanize(project.status)}
          icon={Flag}
          accent
        />
        <ProjectMeta
          label="Progress"
          value={`${clampProgress(project.progress)}%`}
          icon={CircleGauge}
        />
        <ProjectMeta
          label={project.completedAt ? "Completed" : "Expected completion"}
          value={formatDate(project.completedAt ?? project.expectedEndAt)}
          icon={CalendarDays}
        />
      </div>
      <div className="border-t border-border p-4 sm:p-6">
        <p className="mb-4 text-xs leading-6 text-muted-foreground">
          Review the latest preview and keep decisions connected to your
          project.
        </p>
        <ProjectDecisionSummary project={project} analytics={analytics} />
        <Link
          href="#analytics"
          className="mt-4 inline-flex min-h-9 items-center gap-2 text-xs font-medium text-theme-accent"
        >
          View full performance analysis{" "}
          <ChevronDown aria-hidden="true" className="size-3" />
        </Link>
      </div>

      <AnimatedDetails
        title="Milestone progress"
        meta={`${completedMilestones} of ${milestones.length} completed`}
      >
        <ClientProjectMilestonesSection project={project} />
      </AnimatedDetails>

      <AnimatedDetails
        title="Project Scope & Agreements"
        meta="Delivery context"
      >
        {hasScopeInformation ? (
          <div className="grid gap-6 md:grid-cols-2">
            <ScopeItem
              title="Project Purpose"
              value={
                project.purpose ?? "No project purpose has been published."
              }
            />

            <ScopeItem
              title="Expected Outcome"
              value={
                project.expectedOutcome ??
                "No expected outcome has been published."
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
            No client-visible scope or agreement information has been published
            yet.
          </p>
        )}
      </AnimatedDetails>

      <AnimatedDetails
        title="Development Summary"
        meta="Technology and technical context"
      >
        <div className="overflow-hidden rounded-xl border border-border bg-background">
          <div className="p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-foreground">
              Technologies
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Core technologies powering this project
            </p>

            {technologies.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {technologies.map((technology) => (
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
                  {technologiesWithNotes.map((technology) => (
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
  );
}

function AnimatedDetails({
  title,
  meta,
  children,
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

        <span className="hidden text-xs text-muted-foreground sm:block">
          {meta}
        </span>
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

function ProjectMeta({
  label,
  value,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-background px-3 py-2">
      <div className="flex items-center gap-1.5">
        <Icon
          aria-hidden="true"
          className="size-3 shrink-0 text-muted-foreground"
        />

        <p className="truncate text-[10px] text-muted-foreground">{label}</p>
      </div>

      <div className="mt-1 flex items-center gap-2">
        {accent ? (
          <span className="size-1.5 shrink-0 rounded-full bg-theme-accent" />
        ) : null}

        <p className="truncate text-xs font-semibold text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

function AccessRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string | null;
}) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,6.25rem)_minmax(0,1fr)] items-center gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <Icon
          aria-hidden="true"
          className="size-3.5 shrink-0 text-muted-foreground"
        />

        <span className="truncate text-xs text-muted-foreground">{label}</span>
      </div>

      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-foreground transition-colors hover:text-theme-accent"
        >
          <span className="truncate">{value}</span>

          <ExternalLink aria-hidden="true" className="size-3 shrink-0" />
        </a>
      ) : (
        <span className="min-w-0 truncate text-xs font-semibold text-foreground">
          {value}
        </span>
      )}
    </div>
  );
}

function ProjectIdRow({ projectId }: { projectId: string }) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,6.25rem)_minmax(0,1fr)] items-center gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <Layers3
          aria-hidden="true"
          className="size-3.5 shrink-0 text-muted-foreground"
        />

        <span className="truncate text-xs text-muted-foreground">
          Project ID
        </span>
      </div>

      <div className="flex min-w-0 items-center gap-1">
        <span
          title={projectId}
          className="min-w-0 flex-1 truncate font-mono text-xs font-semibold text-foreground"
        >
          {projectId}
        </span>

        <CopyProjectIdButton value={projectId} />
      </div>
    </div>
  );
}

function TechnologyBadge({
  name,
  category,
  featured,
}: {
  name: string;
  category: string | null;
  featured: boolean;
}) {
  return (
    <div
      title={category ? `${name} · ${category}` : name}
      className={[
        "inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5",

        featured
          ? "border-theme-accent/20 bg-theme-accent/5"
          : "border-border bg-surface",
      ].join(" ")}
    >
      <span
        className={[
          "size-1.5 rounded-full",
          featured ? "bg-theme-accent" : "bg-muted-foreground/40",
        ].join(" ")}
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
  featured,
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
        "rounded-xl border p-4",

        featured
          ? "border-theme-accent/20 bg-theme-accent/[0.035]"
          : "border-border bg-surface",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h5 className="truncate text-sm font-semibold text-foreground">
            {name}
          </h5>

          {category ? (
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {category}
            </p>
          ) : null}
        </div>

        <span
          className={[
            "mt-1 size-2 shrink-0 rounded-full",

            featured ? "bg-theme-accent" : "bg-border-strong",
          ].join(" ")}
        />
      </div>

      <div className="mt-4 space-y-3">
        {purpose ? (
          <TechnologyCardField label="Purpose" value={purpose} />
        ) : null}

        {rationale ? (
          <TechnologyCardField label="Why" value={rationale} />
        ) : null}

        {description ? (
          <TechnologyCardField label="Notes" value={description} />
        ) : null}
      </div>
    </article>
  );
}

function TechnologyCardField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
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
