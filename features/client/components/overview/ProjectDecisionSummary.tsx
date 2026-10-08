import type { ClientProject } from "@/features/client/server/projects/get-client-project";
import type { ClientProjectAnalytics } from "@/features/analytics/server/read/get-client-project-analytics";
import { Check, Circle, MessageSquare } from "lucide-react";
import Link from "next/link";

export function ProjectDecisionSummary({
  project,
  analytics,
}: {
  project: ClientProject;
  analytics?: ClientProjectAnalytics;
}) {
  const checklist = project.deliverables.slice(0, 4);
  const reviews = [
    ...project.approvals
      .slice(0, 3)
      .map((item) => ({
        id: item.id,
        title: item.title.replace(/^Demo review:\s*/i, ""),
        done: item.status === "ACCEPTED",
      })),
    ...project.supportTickets
      .slice(0, 2)
      .map((item) => ({
        id: item.id,
        title: item.subject.replace(/^\[DEMO\]\s*/i, ""),
        done: ["CLOSED", "RESOLVED"].includes(item.status),
      })),
  ];
  const available = analytics?.available ? analytics : null;
  const days = available?.daily.slice(-6) ?? [];
  const max = Math.max(1, ...days.map((day) => day.pageViews));
  const points = days
    .map(
      (day, index) => `${12 + index * 44},${78 - (day.pageViews / max) * 58}`,
    )
    .join(" ");
  const demo = available?.collection.sample ?? false;
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <SummaryCard title="Delivery checklist">
        {checklist.length ? (
          checklist.map((item) => {
            const done = item.status === "ACCEPTED";
            return (
              <p
                key={item.id}
                className="flex items-start gap-2 text-xs leading-5"
              >
                {done ? (
                  <Check
                    aria-hidden="true"
                    className="mt-0.5 size-3.5 shrink-0 text-theme-accent"
                  />
                ) : (
                  <Circle
                    aria-hidden="true"
                    className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                  />
                )}
                <span className={done ? "text-muted-foreground" : ""}>
                  {item.title}
                </span>
              </p>
            );
          })
        ) : (
          <p className="text-xs text-muted-foreground">
            Your delivery checklist will appear here.
          </p>
        )}
        <p className="pt-2 text-[10px] text-muted-foreground">
          {
            project.deliverables.filter((item) => item.status === "ACCEPTED")
              .length
          }{" "}
          / {project.deliverables.length} accepted
        </p>
      </SummaryCard>
      <SummaryCard title="Reviews & support">
        {reviews.length ? (
          reviews.map((item) => (
            <p
              key={item.id}
              className="flex items-start gap-2 text-xs leading-5"
            >
              {item.done ? (
                <Check
                  aria-hidden="true"
                  className="mt-0.5 size-3.5 shrink-0 text-theme-accent"
                />
              ) : (
                <Circle
                  aria-hidden="true"
                  className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                />
              )}
              <span
                className={
                  item.done ? "text-muted-foreground line-through" : ""
                }
              >
                {item.title}
              </span>
            </p>
          ))
        ) : (
          <p className="text-xs text-muted-foreground">
            No review or support requests yet.
          </p>
        )}
        <Link
          href={
            project.conversations[0]
              ? `/dashboard/messages?conversation=${project.conversations[0].id}`
              : "/dashboard/messages"
          }
          className="inline-flex min-h-9 items-center gap-2 text-xs font-medium"
        >
          <MessageSquare aria-hidden="true" className="size-3" /> Project
          conversations
        </Link>
      </SummaryCard>
      <SummaryCard title="Performance analytics">
        <p className="text-[10px] text-muted-foreground">
          {demo ? "Sample analytics · last 6 days" : "Page views · last 6 days"}
        </p>
        {available ? (
          <>
            <svg
              viewBox="0 0 244 96"
              role="img"
              aria-label={`Page views for the last six days: ${days.map((day) => `${day.label}: ${day.pageViews}`).join(", ")}`}
              className="h-24 w-full"
            >
              {[24, 48, 72].map((y) => (
                <line
                  key={y}
                  x1="8"
                  x2="236"
                  y1={y}
                  y2={y}
                  stroke="var(--border)"
                  strokeWidth="0.6"
                />
              ))}
              <polyline
                points={points}
                fill="none"
                stroke="var(--theme-accent)"
                strokeWidth="1.4"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
            <div className="flex justify-between text-[9px] text-muted-foreground">
              <span>{days[0]?.label}</span>
              <span>{days.at(-1)?.label}</span>
            </div>
            <p className="pt-2 text-xs">
              <strong>
                {days
                  .reduce((sum, day) => sum + day.pageViews, 0)
                  .toLocaleString("en-NG")}
              </strong>{" "}
              page views
            </p>
          </>
        ) : (
          <p className="py-6 text-xs leading-5 text-muted-foreground">
            Performance data will appear when analytics is connected.
          </p>
        )}
      </SummaryCard>
    </div>
  );
}
function SummaryCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-xl border border-border bg-background p-4">
      <h3 className="mb-3 text-xs font-semibold">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
