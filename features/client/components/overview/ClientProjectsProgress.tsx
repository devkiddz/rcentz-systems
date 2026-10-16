import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  CalendarDays,
  Plus,
  Layers3,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  projectInitials,
  safeProjectImage,
} from "@/features/client/lib/workspace";
import type { ClientOverviewProject } from "@/features/client/server/overview/get-client-overview";
const label = (v: string) =>
  v
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (s) => s.toUpperCase());
const date = (v: Date | null) =>
  v
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        timeZone: "Africa/Lagos",
      }).format(v)
    : "To be agreed";
export function ClientProjectsProgress({
  projects,
}: {
  projects: ClientOverviewProject[];
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Your projects</h2>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">
            Delivery progress, next steps and recent project activity.
          </p>
        </div>
        <Link
          href="/dashboard/projects"
          className="inline-flex min-h-11 items-center gap-2 text-xs font-medium hover:underline"
        >
          View all <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.slice(0, 6).map((project) => {
          const progress = Math.round(
            Math.min(100, Math.max(0, project.progress)),
          );
          const logo = safeProjectImage(project.logo?.url);
          return (
            <article
              key={project.id}
              className="min-w-0 rounded-xl border border-border bg-background p-4 transition-colors hover:border-foreground/30"
            >
              <div className="flex items-start gap-3">
                <Avatar className="size-11 shrink-0 rounded-xl border border-border bg-muted">
                  <AvatarImage
                    src={logo || undefined}
                    alt={project.name + " logo"}
                    className="object-contain p-1"
                  />
                  <AvatarFallback className="rounded-xl text-sm font-semibold">
                    {projectInitials(project.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="break-words text-sm font-semibold leading-6">
                    <Link
                      href={"/dashboard/projects/" + project.id}
                      className="rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {project.name}
                    </Link>
                  </h3>
                  <p className="mt-1 break-all text-xs leading-5 text-muted-foreground">
                    {project.domain ||
                      project.liveUrl ||
                      "Domain not connected"}
                  </p>
                </div>
                <ArrowUpRight
                  aria-hidden="true"
                  className="mt-1 size-4 shrink-0 text-muted-foreground"
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full border border-border bg-muted/30 px-2.5 py-1 text-xs">
                  {label(project.status)}
                </span>
                <span className="text-xs font-semibold">
                  {progress}% complete
                </span>
              </div>
              <div
                role="progressbar"
                aria-label={project.name + " progress"}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full rounded-full bg-theme-accent"
                  style={{ width: progress + "%" }}
                />
              </div>
              <dl className="mt-4 space-y-3 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <dt className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
                    <Layers3 aria-hidden="true" className="size-3.5" />
                    Milestones
                  </dt>
                  <dd className="font-medium">
                    {project.milestoneSummary.completed}/
                    {project.milestoneSummary.total} complete
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Next delivery</dt>
                  <dd className="mt-1 break-words font-medium leading-5">
                    {project.status === "COMPLETED"
                      ? "Delivery completed"
                      : project.nextMilestone?.title ||
                        "Awaiting delivery plan"}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarDays aria-hidden="true" className="size-3.5" />
                    Target
                  </dt>
                  <dd className="text-right">{date(project.expectedEndAt)}</dd>
                </div>
              </dl>
              <p className="mt-4 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">
                {project.status === "COMPLETED"
                  ? "Project completed"
                  : project.health.reason}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">
                  Updated {date(project.updatedAt)}
                </span>
                <Link
                  href={"/dashboard/projects/" + project.id}
                  className="inline-flex min-h-11 items-center gap-1 font-medium hover:underline"
                >
                  Open project{" "}
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
      {!projects.length ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-sm leading-6 text-muted-foreground">
          Your project workspaces and delivery details will appear here.
        </p>
      ) : null}
      <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          {projects.length > 6
            ? "Showing your six most recently updated projects."
            : "Have another project in mind?"}
        </p>
        <Link
          href="/start-project"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 text-xs font-semibold hover:bg-muted"
        >
          <Plus aria-hidden="true" className="size-4" />
          Start a project
        </Link>
      </footer>
    </section>
  );
}
