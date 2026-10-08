import { AnalyticsLiveRefresh } from "@/features/analytics/components/AnalyticsLiveRefresh";
import { BarChart3, ChevronDown, Radio } from "lucide-react";

import { ProjectTrafficChart } from "@/features/analytics/components/charts/ProjectTrafficChart";

import type { ClientProjectAnalytics } from "@/features/analytics/server/read/get-client-project-analytics";
import type { ClientProject } from "@/features/client/server/projects/get-client-project";

type ClientProjectAnalyticsSectionProps = {
  project: ClientProject;
  analytics: ClientProjectAnalytics;
};

type AvailableAnalytics = Extract<
  ClientProjectAnalytics,
  {
    available: true;
  }
>;

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-NG").format(value);
}

function formatDateTime({
  value,
  timeZone,
}: {
  value: Date | null;
  timeZone: string;
}) {
  if (!value) {
    return "Not yet";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(value);
}

function getFunctionActions(analytics: AvailableAnalytics) {
  const { summary } = analytics;

  return (
    summary.productViews +
    summary.serviceViews +
    summary.addToCarts +
    summary.removeFromCarts +
    summary.checkoutStarted +
    summary.purchases +
    summary.serviceRequests +
    summary.signUps +
    summary.logins
  );
}

export function ClientProjectAnalyticsSection({
  project,
  analytics,
}: ClientProjectAnalyticsSectionProps) {
  return (
    <details
      id="analytics"
      className="group overflow-hidden rounded-[22px] border border-border bg-surface"
    >
      <AnalyticsLiveRefresh
        active={analytics.available && analytics.collection.status === "ACTIVE"}
      />
      <summary className="flex min-h-[92px] cursor-pointer list-none items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-muted/40 sm:px-6 [&::-webkit-details-marker]:hidden">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background">
          <BarChart3
            aria-hidden="true"
            className="size-[18px] text-theme-accent"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[15px] font-semibold tracking-[-0.025em] text-foreground">
              Website Intelligence
            </h2>

            <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {analytics.available && analytics.collection.sample
                ? "Sample data"
                : analytics.available
                  ? formatLabel(analytics.collection.status)
                  : "Unavailable"}
            </span>
          </div>

          <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
            Recorded traffic and engagement. Updates every 30 seconds.
          </p>
        </div>

        {analytics.available ? (
          <div className="hidden shrink-0 items-center gap-6 lg:flex">
            <SummaryMetric
              label="Sessions"
              value={formatNumber(analytics.summary.sessions)}
            />

            <SummaryMetric
              label="Views"
              value={formatNumber(analytics.summary.pageViews)}
            />

            <SummaryMetric
              label="Clicks"
              value={formatNumber(analytics.summary.clicks)}
            />
          </div>
        ) : null}

        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180"
        />
      </summary>

      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-open:grid-rows-[1fr]">
        <div className="overflow-hidden">
          <div className="border-t border-border">
            {analytics.available ? (
              <ProjectAnalysis project={project} analytics={analytics} />
            ) : (
              <AnalyticsUnavailable reason={analytics.reason} />
            )}
          </div>
        </div>
      </div>
    </details>
  );
}

function ProjectAnalysis({
  project,
  analytics,
}: {
  project: ClientProject;
  analytics: AvailableAnalytics;
}) {
  const { summary, daily, collection, activeGoals, sources } = analytics;

  const functionActions = getFunctionActions(analytics);

  return (
    <>
      <div className="flex flex-col gap-3 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Performance analysis
          </h3>

          <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
            {collection.sample
              ? "Simulated analytics for the customer demonstration. No live traffic is claimed."
              : `Recorded intelligence from ${project.name}.`}
          </p>
        </div>

        <span className="w-fit rounded-full border border-border bg-background px-3 py-1.5 text-[10px] text-muted-foreground">
          Chart: last 30 days
        </span>
      </div>

      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.72fr)]">
        <ProjectTrafficChart data={daily} />

        <div className="rounded-[18px] border border-border bg-background/35 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Totals since tracking began
          </p>

          <div className="mt-5 divide-y divide-border">
            <AnalysisMetric
              label="Visits"
              description="Tracked browsing sessions"
              value={formatNumber(summary.sessions)}
            />

            <AnalysisMetric
              label="Pages"
              description="Recorded page views"
              value={formatNumber(summary.pageViews)}
            />

            <AnalysisMetric
              label="Clicks"
              description="Tracked calls to action"
              value={formatNumber(summary.clicks)}
            />

            <AnalysisMetric
              label="Functions"
              description={
                functionActions
                  ? "Recorded feature and action usage"
                  : "Feature outcome tracking is not connected"
              }
              value={functionActions ? formatNumber(functionActions) : "—"}
            />

            <AnalysisMetric
              label="Conversions"
              description={
                activeGoals > 0
                  ? "Completed configured goals"
                  : "No conversion goals configured"
              }
              value={activeGoals > 0 ? formatNumber(summary.conversions) : "—"}
            />

            <AnalysisMetric
              label="Traffic sources"
              description="Referring domains · last 30 days"
              value={
                sources.length
                  ? `${sources.length} recorded`
                  : "Awaiting traffic"
              }
            />
          </div>
          {sources.length ? (
            <ul className="mt-3 space-y-2 text-[10px] text-muted-foreground">
              {sources.map((source) => (
                <li key={source.source} className="flex justify-between gap-3">
                  <span className="truncate">
                    {source.source === "direct"
                      ? "Direct / unreported"
                      : source.source}
                  </span>
                  <span>{formatNumber(source.views)} views</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="grid border-t border-border bg-surface-muted/20 sm:grid-cols-2">
        <div className="flex items-start gap-3 px-5 py-5 sm:px-6">
          <Radio
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-theme-accent"
          />

          <div>
            <p className="text-[11px] font-medium text-foreground">
              Analytics collection{" "}
              {formatLabel(collection.status).toLowerCase()}
            </p>

            <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
              Last event:{" "}
              {formatDateTime({
                value: summary.lastEventAt,
                timeZone: collection.timezone,
              })}
            </p>
          </div>
        </div>

        <div className="border-t border-border px-5 py-5 sm:border-l sm:border-t-0 sm:px-6">
          <p className="text-[11px] font-medium text-foreground">
            Aggregation status
          </p>

          <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
            Last rebuilt:{" "}
            {formatDateTime({
              value: collection.lastAggregatedAt,
              timeZone: collection.timezone,
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-4 sm:px-6">
        <p className="text-[10px] text-muted-foreground">
          {formatNumber(summary.totalEvents)}{" "}
          {collection.sample ? "simulated event" : "raw-event"}
          {summary.totalEvents === 1 ? "" : "s"} represented in the current
          aggregate.
        </p>

        <span className="shrink-0 rounded-full border border-border bg-background px-3 py-1.5 text-[9px] text-muted-foreground">
          Project scoped
        </span>
      </div>
    </>
  );
}

function AnalyticsUnavailable({
  reason,
}: {
  reason: "NOT_CONFIGURED" | "CLIENT_HIDDEN";
}) {
  const message =
    reason === "NOT_CONFIGURED"
      ? "Rcentz analytics has not been configured for this project yet."
      : "Client analytics access is currently unavailable for this project.";

  return (
    <div className="px-7 py-12 text-center">
      <BarChart3
        aria-hidden="true"
        className="mx-auto size-7 text-muted-foreground"
      />

      <h3 className="mt-4 text-base font-semibold text-foreground">
        Analytics unavailable
      </h3>

      <p className="mx-auto mt-2 max-w-md text-[12px] leading-5 text-muted-foreground">
        {message}
      </p>
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold tracking-[-0.02em] text-foreground">
        {value}
      </p>
    </div>
  );
}

function AnalysisMetric({
  label,
  description,
  value,
}: {
  label: string;
  description: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-foreground">{label}</p>

        <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
          {description}
        </p>
      </div>

      <span className="shrink-0 text-[14px] font-semibold tracking-[-0.02em] text-foreground">
        {value}
      </span>
    </div>
  );
}
