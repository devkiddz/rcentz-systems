import { ChevronDown } from "lucide-react";
import { queueQuery } from "../lib/navigation";
import Link from "next/link";
import type { FinderData } from "@/features/opportunities/types";
import { statuses } from "@/features/opportunities/lib/matching";
import {
  collectNow,
} from "@/features/opportunities/server/actions";
import { SubmitButton } from "@/features/opportunities/components/SubmitButton";
import {
  OpportunityCard,
  selectClass,
  label,
} from "@/features/opportunities/components/OpportunityCard";
import { FinderCharts } from "@/features/opportunities/components/FinderCharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FinderButton as Button, finderButtonVariants as buttonVariants } from "./FinderButton";
const notices: Record<string, string> = {
  success:
    "Collection completed. Check source health for partial failures and review the evidence below.",
  failed: "Discovery failed. Saved opportunities and decisions are preserved.",
  cooldown:
    "Already checked within the last 20 hours. Daily collection remains scheduled.",
  disabled: "Enable daily collection in your search profile first.",
};
export function FinderWorkspace({
  data,
  query,
}: {
  data: FinderData;
  query: { status?: string; kind?: string; queue?: string; run?: string };
}) {
  const filter = (statuses as readonly string[]).includes(query.status || "")
    ? query.status
    : undefined;
  const kind = ["EMPLOYMENT", "CONTRACT", "PROJECT"].includes(query.kind || "")
    ? query.kind
    : undefined;
  const queue = query.queue === "quarantine" ? "quarantine" : "review";
  const { profile, jobs, runs, analytics: a, pagination } = data;
  const pageHref = (page: number) => {
    const params = new URLSearchParams({ queue, page: String(page) });
    if (filter) params.set("status", filter);
    if (kind) params.set("kind", kind);
    return "/admin/opportunities?" + params.toString() + "#review-queue";
  };
  return (
    <main className="rcentz-dashboard-frame px-4 py-6 sm:px-6 lg:px-8">
      <div className="rcentz-dashboard-inner mx-auto w-full max-w-[1200px] space-y-5">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Private intelligence · Global opportunities
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Work that moves your vision forward.
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Jobs, contracts and project leads collected daily. Inspect career
              fit, recruitment risk and public company contacts before you
              decide.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/opportunities/settings" className={buttonVariants({variant: "outline"})}>Configure hunt</Link>
          <Badge variant={profile?.enabled ? "secondary" : "outline"}>
            {profile?.enabled
              ? "Daily collection enabled"
              : "Collection paused"}
          </Badge>
          </div>
        </header>
        {query.run && notices[query.run] && (
          <Card role="status" className="p-4 text-sm">
            {notices[query.run]}
          </Card>
        )}
        {a && !a.searchConfigured && (
          <Card className="gap-2 p-4">
            <p className="text-sm font-medium">
              Broad web search is awaiting configuration
            </p>
            <p className="text-sm text-muted-foreground">
              Feeds and configured company boards can run now. A Brave Search
              API key is required in rcentz-api to activate internet discovery
              and company contact research.
            </p>
          </Card>
        )}
        {a && (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                {
                  name: "Saved opportunities",
                  value: a.total,
                  note: "All queues and statuses",
                },
                {
                  name: "Public contact emails",
                  value: a.publicContacts,
                  note: "Published addresses; unverified",
                },
                {
                  name: "Quarantined",
                  value: a.quarantined,
                  note: "Risk signals need your review",
                },
                {
                  name: "Recorded response rate",
                  value: a.responseRate === null ? "—" : a.responseRate + "%",
                  note: `${a.recordedResponses} responses / ${a.recordedApplications} recorded applications`,
                },
              ].map((m) => (
                <Card key={m.name} className="gap-2 p-4">
                  <p className="text-xs text-muted-foreground">{m.name}</p>
                  <p className="text-2xl font-semibold tracking-tight">
                    {m.value}
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {m.note}
                  </p>
                </Card>
              ))}
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              <Card className="gap-4 p-5 lg:col-span-2">
                <div>
                  <h2 className="font-semibold">Activity · Last 30 days</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Discoveries and application events, recorded in UTC.
                  </p>
                </div>
                <FinderCharts daily={a.daily} />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {a.historyCoverage}
                  {a.bounded
                    ? " Reporting limits reached; rates are suppressed when application history is incomplete."
                    : ""}
                </p>
              </Card>
              <Card className="gap-4 p-5">
                <h2 className="font-semibold">Your pipeline</h2>
                <div className="space-y-3">
                  {statuses.map((s) => (
                    <div key={s} className="flex justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">{label(s)}</span>
                      <span className="font-mono">
                        {a.pipeline.find((p) => p.status === s)?.count || 0}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-auto text-xs text-muted-foreground">
                  Current saved states. Outcome history starts with this
                  release.
                </p>
              </Card>
            </div>
          </>
        )}
        <Card className="flex flex-row flex-wrap items-center justify-between gap-4 p-5">
          <div className="max-w-2xl">
            <h2 className="font-semibold">The hunt keeps running</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Daily at 07:00 UTC / 08:00 Lagos while enabled. No links to paste.
              Manual checks share a 20-hour cooldown.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Each run processes up to 180 ranked candidates and researches
              eight public-page trails. Up to 25 new saves per run, including at
              most two stretch roles; untouched records are capped at 500. Weak
              matches and stated workloads above your boundary are skipped.
              Results arrive here; email and push delivery are not configured.
            </p>
          </div>
          <form action={collectNow}>
            <SubmitButton>Collect opportunities</SubmitButton>
          </form>
        </Card>
        {a && (
          <Card className="gap-4 p-5">
            <details className="group/source-health">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/40 [&::-webkit-details-marker]:hidden">
                <h2 className="font-semibold">Source health · Last 30 days</h2>
                <ChevronDown
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted transition-transform group-open/source-health:rotate-180 motion-reduce:transition-none"
                />
              </summary>
              <div className="mt-5 space-y-4">
                <p className="mt-1 text-xs text-muted-foreground">
                  Skipped includes lower-ranked, duplicate-across-source and
                  unmatched candidates. A failed source does not erase earlier
                  results.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b text-xs text-muted-foreground">
                      <tr>
                        {[
                          "Source",
                          "Last result",
                          "Fetched",
                          "New",
                          "Updated",
                          "Skipped",
                        ].map((t) => (
                          <th
                            key={t}
                            className="whitespace-nowrap px-3 py-2 first:pl-0"
                          >
                            {t}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {a.sources.map((s) => (
                        <tr key={s.source} className="border-b last:border-0">
                          <td className="px-3 py-3 first:pl-0">
                            <p className="font-medium">
                              {s.source.replaceAll("_", " ")}
                            </p>
                            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                              {s.runs} runs · {s.failures} failures
                              {s.message ? " · " + s.message : ""}
                            </p>
                          </td>
                          <td className="px-3 py-3">
                            <Badge
                              variant={
                                s.lastStatus === "SUCCESS"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {label(s.lastStatus)}
                            </Badge>
                            <p className="mt-1 whitespace-nowrap text-xs text-muted-foreground">
                              {new Date(s.lastRun).toLocaleDateString("en-GB", {
                                timeZone: "Africa/Lagos",
                              })}
                            </p>
                          </td>
                          {[s.fetched, s.added, s.duplicates, s.skipped].map(
                            (n, i) => (
                              <td
                                key={i}
                                className="px-3 py-3 font-mono text-xs"
                              >
                                {n}
                              </td>
                            ),
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!a.sources.length && (
                  <p className="text-sm text-muted-foreground">
                    Source results will appear after the first collection.
                  </p>
                )}
              </div>
            </details>
          </Card>
        )}
        <div id="review-queue" className="scroll-mt-24 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">
              {queue === "quarantine"
                ? "Quarantine review"
                : "Your review queue"}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                · {jobs.length} of {pagination.total} shown
              </span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Fit score first · Newest first on ties · Six per page
            </p>
          </div>
          <form
            action="/admin/opportunities#review-queue"
            className="grid gap-3 sm:flex sm:flex-wrap sm:items-end"
          >
            <label className="space-y-1">
              <span className="text-xs">Queue</span>
              <select name="queue" defaultValue={queue} className={selectClass}>
                <option value="review">Review</option>
                <option value="quarantine">Quarantine</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs">Opportunity type</span>
              <select
                name="kind"
                defaultValue={kind || ""}
                className={selectClass}
              >
                <option value="">All types</option>
                {["EMPLOYMENT", "CONTRACT", "PROJECT"].map((s) => (
                  <option key={s} value={s}>
                    {label(s)}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs">Decision</span>
              <select
                name="status"
                defaultValue={filter || ""}
                className={selectClass}
              >
                <option value="">All active decisions</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {label(s)}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" variant="outline">
              Apply filters
            </Button>
          </form>
        </div>
        <div className="grid items-stretch gap-8 lg:grid-cols-2">
          {jobs.map((job) => (
            <OpportunityCard
              key={job.id}
              job={job}
              returnQuery={queueQuery({
                ...query,
                page: String(pagination.page),
              })}
            />
          ))}
        </div>
        <nav
          aria-label="Opportunity pages"
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <p role="status" className="text-xs text-muted-foreground">
            {pagination.total
              ? `Showing ${(pagination.page - 1) * 6 + 1}–${(pagination.page - 1) * 6 + jobs.length} of ${pagination.total}`
              : "No matching opportunities"}{" "}
            · Page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex items-center gap-2">
            {pagination.hasPrevious ? (
              <Button
                nativeButton={false}
                variant="outline"
                render={
                  <Link
                    href={pageHref(pagination.page - 1)}
                    prefetch={false}
                    rel="prev"
                  />
                }
              >
                Previous
              </Button>
            ) : (
              <Button variant="outline" disabled>
                Previous
              </Button>
            )}
            {pagination.hasNext ? (
              <Button
                nativeButton={false}
                variant="outline"
                render={
                  <Link
                    href={pageHref(pagination.page + 1)}
                    prefetch={false}
                    rel="next"
                  />
                }
              >
                Next
              </Button>
            ) : (
              <Button variant="outline" disabled>
                Next
              </Button>
            )}
          </div>
        </nav>
        {!jobs.length && (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            {profile
              ? "No opportunities in this view yet. Check source health, collection settings or filters."
              : "Save your career profile to begin. No sample opportunities are inserted."}
          </Card>
        )}
        <Card className="gap-3 p-5">
          <h2 className="font-semibold">Recent collection runs</h2>
          {runs.map((r) => (
            <div
              key={r.id}
              className="space-y-1 border-b pb-3 last:border-0 last:pb-0"
            >
              <p className="text-sm">
                {new Date(r.startedAt).toLocaleString("en-GB", {
                  timeZone: "Africa/Lagos",
                })}{" "}
                · {r.status} · {r.fetched} fetched · {r.added} new
              </p>
              {r.message && (
                <p className="text-xs text-muted-foreground">{r.message}</p>
              )}
            </div>
          ))}
          {!runs.length && (
            <p className="text-sm text-muted-foreground">
              No runs recorded yet.
            </p>
          )}
        </Card>
        <p className="text-xs leading-relaxed text-muted-foreground">
          No source coverage or scam test guarantees legitimacy. Fit assessments
          expose evidence and unknowns; they cannot certify your entire career
          or an employer. Outreach, applications, proposals and SOWs require
          your review and are never sent automatically.
        </p>
      </div>
    </main>
  );
}
