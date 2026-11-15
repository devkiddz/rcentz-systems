import type { ReactNode } from "react";
import Link from "next/link";
import { Check, Circle, ArrowUpRight, Activity, BarChart3 } from "lucide-react";
import type { ClientProject } from "@/features/client/server/projects/get-client-project";
import type { ClientProjectAnalytics } from "@/features/analytics/server/read/get-client-project-analytics";
function Sparkline({ values, label }: { values: number[]; label: string }) {
  const max = Math.max(1, ...values);
  const points = values
    .map(
      (v, i) =>
        `${4 + i * (192 / Math.max(1, values.length - 1))},${46 - (v / max) * 40}`,
    )
    .join(" ");
  return (
    <svg
      viewBox="0 0 200 52"
      role="img"
      aria-label={label}
      className="h-14 w-full"
    >
      <polyline
        points={points}
        fill="none"
        stroke="var(--theme-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function Card({
  title,
  badge,
  children,
  href,
}: {
  title: string;
  badge?: string;
  children: ReactNode;
  href?: string;
}) {
  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card">
      <header className="flex min-h-14 items-center justify-between gap-3 border-b border-border px-4">
        <h3 className="text-sm font-semibold">
          {title}
          {badge ? (
            <span className="ml-2 rounded-full border border-theme-accent/20 bg-theme-accent-faint px-2 py-1 text-xs font-medium text-theme-accent">
              {badge}
            </span>
          ) : null}
        </h3>
        {href ? (
          <Link
            href={href}
            aria-label={"Open " + title.toLowerCase()}
            className="inline-flex size-10 items-center justify-center rounded-lg hover:bg-surface-muted"
          >
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        ) : null}
      </header>
      <div className="flex-1 p-4">{children}</div>
    </section>
  );
}
function displayDate(date: Date | string | null | undefined) {
  return date
    ? new Date(date).toLocaleString("en-GB", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "Africa/Lagos",
      }) + " WAT"
    : "No events recorded";
}
export function ProjectDecisionSummary({
  project,
  analytics,
}: {
  project: ClientProject;
  analytics?: ClientProjectAnalytics;
}) {
  const a = analytics?.available ? analytics : null;
  const complete = project.deliverables.filter(
    (d) => d.status === "ACCEPTED",
  ).length;
  const reviews = [
    ...project.approvals.map((v) => ({
      id: v.id,
      title: v.title,
      done: v.status === "ACCEPTED",
    })),
    ...project.supportTickets.map((v) => ({
      id: v.id,
      title: v.subject,
      done: ["CLOSED", "RESOLVED"].includes(v.status),
    })),
  ];
  return (
    <div className="grid items-stretch gap-4 lg:grid-cols-3">
      <Card
        title="Delivery checklist"
        badge={complete + "/" + project.deliverables.length}
      >
        <div
          tabIndex={0}
          role="region"
          aria-label="Scrollable delivery checklist"
          className="max-h-64 space-y-2 overflow-y-auto rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {project.deliverables.length ? (
            project.deliverables.map((d) => {
              const done = d.status === "ACCEPTED";
              return (
                <div
                  key={d.id}
                  className={
                    "flex items-start gap-3 rounded-lg border p-3 " +
                    (done
                      ? "border-theme-accent/20 bg-theme-accent-faint"
                      : "border-border bg-surface-muted")
                  }
                >
                  {done ? (
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-theme-accent"
                    />
                  ) : (
                    <Circle
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    />
                  )}
                  <div className="min-w-0">
                    <p
                      className={
                        "break-words text-xs font-medium leading-6 " +
                        (done ? "text-theme-accent line-through" : "")
                      }
                    >
                      {d.title}
                    </p>
                    <p className="mt-1 text-xs capitalize text-muted-foreground">
                      {d.status.toLowerCase().replaceAll("_", " ")}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="py-6 text-sm leading-6 text-muted-foreground">
              The team will add delivery items as the project scope is agreed.
            </p>
          )}
        </div>
        <Link
          href="#milestones"
          className="mt-4 inline-flex min-h-11 items-center text-xs font-medium hover:underline"
        >
          Review milestones →
        </Link>
      </Card>
      <Card
        title="Observability"
        badge={a?.collection.sample ? "Sample" : a ? "30 days" : undefined}
        href="#analytics"
      >
        {a ? (
          <>
            <div className="flex items-center gap-2 text-xs">
              <Activity
                aria-hidden="true"
                className="size-4 text-theme-accent"
              />
              <span>Collection {a.collection.status.toLowerCase()}</span>
            </div>
            {[
              {
                label: "Recorded events",
                values: a.daily.map((d) => d.totalEvents),
              },
              { label: "Page views", values: a.daily.map((d) => d.pageViews) },
            ].map((metric) => (
              <div
                key={metric.label}
                className="mt-4 grid grid-cols-2 items-center gap-3"
              >
                <div>
                  <p className="text-xs text-muted-foreground">
                    {metric.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {metric.values
                      .reduce((sum, v) => sum + v, 0)
                      .toLocaleString("en-NG")}
                  </p>
                </div>
                <Sparkline
                  values={metric.values}
                  label={metric.label + " over the last 30 days"}
                />
              </div>
            ))}
            <dl className="mt-4 space-y-3 border-t border-border pt-4 text-xs">
              <div>
                <dt className="text-muted-foreground">Last event received</dt>
                <dd className="mt-1">
                  {displayDate(a.collection.lastIngestedAt)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Last aggregation</dt>
                <dd className="mt-1">
                  {a.collection.lastAggregatedAt
                    ? displayDate(a.collection.lastAggregatedAt)
                    : "Awaiting aggregation"}
                </dd>
              </div>
            </dl>
          </>
        ) : (
          <div className="py-6 text-sm leading-6 text-muted-foreground">
            Project observability will appear when analytics collection is
            connected.
          </div>
        )}
        <details className="mt-4 border-t border-border pt-3">
          <summary className="cursor-pointer text-xs font-medium">
            Reviews and support ({reviews.length})
          </summary>
          <div
            tabIndex={0}
            role="region"
            aria-label="Scrollable reviews and support"
            className="mt-3 max-h-48 space-y-2 overflow-y-auto"
          >
            {reviews.length ? (
              reviews.map((r) => (
                <p
                  key={r.id}
                  className="rounded-lg bg-surface-muted p-3 text-xs leading-6"
                >
                  {r.done ? "Completed · " : "Open · "}
                  {r.title}
                </p>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">
                No review or support requests.
              </p>
            )}
          </div>
        </details>
      </Card>
      <Card
        title="Analytics"
        badge={a?.collection.sample ? "Sample data" : a ? "30 days" : undefined}
        href="#analytics"
      >
        {a ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Sessions</p>
                <p className="mt-2 text-2xl font-semibold">
                  {a.summary.sessions.toLocaleString("en-NG")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Page views</p>
                <p className="mt-2 text-2xl font-semibold">
                  {a.summary.pageViews.toLocaleString("en-NG")}
                </p>
              </div>
            </div>
            <div className="mt-5">
              <Sparkline
                values={a.daily.map((d) => d.sessions)}
                label="Daily sessions over the last 30 days"
              />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {a.summary.clicks.toLocaleString("en-NG")} recorded clicks ·{" "}
              {a.summary.totalEvents.toLocaleString("en-NG")} events
            </p>
            <Link
              href="#analytics"
              className="mt-5 inline-flex min-h-11 items-center text-xs font-semibold hover:underline"
            >
              View full analytics →
            </Link>
          </>
        ) : (
          <div className="flex min-h-52 flex-col items-center justify-center text-center">
            <BarChart3
              aria-hidden="true"
              className="size-8 text-muted-foreground"
            />
            <h4 className="mt-4 text-sm font-semibold">
              Understand your project traffic
            </h4>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              Recorded visitors, page views and engagement will appear once
              tracking is enabled by the team.
            </p>
            <Link
              href="/dashboard/messages"
              className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-semibold"
            >
              Discuss analytics
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
