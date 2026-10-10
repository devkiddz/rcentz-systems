import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Building2,
  MapPin,
  Wallet,
  BriefcaseBusiness,
} from "lucide-react";
import type { FinderData } from "../types";
import { opportunityHref } from "../lib/navigation";
export const selectClass =
  "w-full rounded-lg bg-input/30 px-3 py-2 text-sm ring-1 ring-foreground/10 focus-visible:outline-none focus-visible:ring-ring";
export const label = (s: string) => s.toLowerCase().replaceAll("_", " ");
export function OpportunityCard({
  job,
  returnQuery = "",
}: {
  job: FinderData["jobs"][number];
  returnQuery?: string;
}) {
  const a = job.assessment;
  const concern = job.quarantined
    ? job.research?.flags[0]?.reason ||
      a.concerns[0] ||
      "Recruitment risk needs review."
    : a.concerns[0] ||
      (a.unknowns || a.questions)[0] ||
      "Confirm workload, eligibility and employer before applying.";
  const href = opportunityHref(job) + returnQuery;
  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors duration-200 hover:border-border-strong motion-reduce:transition-none">
      <Link
        href={href}
        prefetch={false}
        aria-label={`Open ${job.title} at ${job.company}`}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/40"
      />
      <header className="px-6 pb-0 pt-6 sm:px-7 sm:pt-7">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className={
                  job.quarantined
                    ? "size-1.5 shrink-0 rounded-full bg-destructive"
                    : "size-1.5 shrink-0 rounded-full bg-theme-accent"
                }
              />
              <span className="text-xs font-normal capitalize text-muted">
                {label(job.status)}
              </span>
            </div>
            <h2 className="mt-4 break-words text-base font-medium tracking-tight text-foreground">
              {job.title}
            </h2>
            <p className="mt-2 break-words text-sm text-muted">{job.company}</p>
          </div>
          <span className="shrink-0 pt-0.5 text-xs capitalize text-muted">
            {label(job.kind)}
          </span>
        </div>
      </header>
      <div className="flex flex-1 flex-col px-6 py-6 sm:px-7 sm:py-7">
        <dl className="grid gap-5 sm:grid-cols-2">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-4 shrink-0 items-center justify-center pt-1">
              <MapPin aria-hidden className="size-3.5 text-muted" />
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-muted">Location</dt>
              <dd className="mt-1 break-words text-xs font-normal leading-5 text-foreground">
                {job.location || "Unconfirmed"}
              </dd>
            </div>
          </div>
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-4 shrink-0 items-center justify-center pt-1">
              <Wallet aria-hidden className="size-3.5 text-muted" />
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-muted">Compensation</dt>
              <dd className="mt-1 break-words text-xs font-normal leading-5 text-foreground">
                {job.salary || "Undisclosed"}
              </dd>
            </div>
          </div>
        </dl>
        <p className="mt-5 line-clamp-2 text-xs leading-5 text-muted">
          {job.description.replace(/\s+/g, " ").trim().slice(0, 240) ||
            a.eligibility}
        </p>
        <div
          className="mt-5 flex flex-wrap gap-x-3 gap-y-2"
          aria-label="Matched skills"
        >
          {a.matched.slice(0, 4).map((skill) => (
            <span key={skill} className="text-xs text-muted">
              {skill}
            </span>
          ))}
          {a.matched.length > 4 && (
            <span className="text-xs text-muted">+{a.matched.length - 4}</span>
          )}
        </div>
        <div className="mt-6 border-t border-border pt-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-muted">Career fit · evidence score</p>
              <p className="mt-1 text-xs font-normal leading-5 text-foreground">
                {a.verdict}
              </p>
            </div>
            <p className="shrink-0 text-lg font-medium tabular-nums tracking-tight text-foreground">
              {job.score}
              <span className="ml-1 text-xs font-normal text-muted">/100</span>
            </p>
          </div>
          <progress
            value={job.score}
            max={100}
            aria-label="Evidence-based career fit score"
            className="mt-3 block h-1 w-full overflow-hidden rounded-full bg-surface-muted accent-theme-accent [&::-webkit-progress-bar]:bg-surface-muted [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-theme-accent [&::-moz-progress-bar]:bg-theme-accent"
          />
        </div>
        <div className="mt-6 border-l border-border pl-3">
          <p
            className={
              job.quarantined
                ? "text-xs font-medium text-destructive"
                : "text-xs font-medium text-foreground"
            }
          >
            {job.quarantined ? "Risk to review" : "Before you commit"}
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
            {concern}
          </p>
        </div>
      </div>
      <footer className="border-t border-border px-6 py-5 sm:px-7">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <BriefcaseBusiness aria-hidden className="size-3.5" />
            {job.jobType ? label(job.jobType) : "Terms unconfirmed"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Building2 aria-hidden className="size-3.5" />
            {job.research?.contacts.length || 0} public contacts
          </span>
          <span>
            Seen{" "}
            {new Date(job.lastSeenAt).toLocaleDateString("en-GB", {
              timeZone: "Africa/Lagos",
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-20 inline-flex h-8 items-center justify-center gap-1.5 rounded-lg text-xs font-normal text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/40"
          >
            Original source <ArrowUpRight aria-hidden className="size-3.5" />
          </a>
          <span className="inline-flex h-8 items-center gap-1.5 text-xs font-medium text-foreground">
            Open brief <ArrowRight aria-hidden className="size-3.5" />
          </span>
        </div>
        <p className="mt-2 text-xs text-muted">
          {label(job.source)} ·{" "}
          {job.quarantined ? "Quarantined" : "Verification pending"}
        </p>
      </footer>
    </article>
  );
}
