import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { updateOpportunity } from "../server/actions";
import { statuses } from "../lib/matching";
import type { FinderData } from "../types";
import { SubmitButton } from "./SubmitButton";
import { selectClass, label } from "./OpportunityCard";
const when = (s: string) =>
  new Date(s).toLocaleDateString("en-GB", { timeZone: "Africa/Lagos" });
export function OpportunityDetail({
  job,
}: {
  job: FinderData["jobs"][number];
}) {
  const a = job.assessment,
    r = job.research;
  return (
    <div className="grid items-start gap-8 xl:grid-cols-3">
      <div className="min-w-0 space-y-8 xl:col-span-2">
        <Card className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-6 ring-0 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{label(job.kind)}</Badge>
            <Badge variant={job.quarantined ? "destructive" : "outline"}>
              {job.quarantined
                ? "Quarantined"
                : r?.risk === "REVIEW"
                  ? "Research lead"
                  : "Verification pending"}
            </Badge>
            <span className="ml-auto text-xs text-muted-foreground">
              {job.source.replaceAll("_", " ")}
            </span>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{job.company}</p>
            <h1 className="mt-1 text-xl font-medium leading-snug sm:text-2xl">
              {job.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {job.location || "Location unconfirmed"} ·{" "}
              {job.salary || "Compensation undisclosed"}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <strong>{a.verdict}</strong>
              <span className="shrink-0 font-mono text-xs">
                {job.score}/100
              </span>
            </div>
            <progress
              className="h-1.5 w-full accent-primary"
              value={job.score}
              max={100}
              aria-label="Evidence-based fit score"
            />
            <p className="text-xs text-muted-foreground">
              Fit score measures recorded evidence; it is not a hiring
              probability.
            </p>
          </div>
          {a.concerns.length > 0 && (
            <div className="space-y-3 border-t border-border pt-5 text-sm">
              {a.concerns.map((c) => (
                <p key={c}>{c}</p>
              ))}
            </div>
          )}
          <p className="text-sm">{a.eligibility}</p>
          {!!r?.flags.length && (
            <div className="space-y-3 border-l border-destructive/30 pl-4 text-sm">
              <p className="font-medium">Risk evidence — inspect the context</p>
              {r.flags.map((f) => (
                <div key={f.reason}>
                  <p>{f.reason}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {f.evidence}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
        <details
          open
          className="rounded-2xl border border-border bg-surface p-6 text-sm sm:p-7"
        >
          <summary className="cursor-pointer font-medium">
            Career fit & blunt unknowns
          </summary>
          <div className="mt-6 space-y-6">
            {a.dimensions?.map((d) => (
              <div key={d.name}>
                <p className="text-xs font-medium text-muted-foreground">
                  {d.name}
                </p>
                <p>{d.finding}</p>
              </div>
            ))}
            <div>
              <p className="font-medium">Evidence</p>
              <ul className="mt-3 list-disc space-y-2 pl-4">
                {(a.evidence || a.matched).map((v) => (
                  <li key={v}>{v}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium">Still unknown</p>
              <ul className="mt-3 list-disc space-y-2 pl-4">
                {(a.unknowns || a.questions).map((v) => (
                  <li key={v}>{v}</li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-muted-foreground">
              {r?.coverage ||
                "Legacy result: employer and contact research not yet recorded."}
            </p>
          </div>
        </details>
        <details
          open
          className="rounded-2xl border border-border bg-surface p-6 text-sm sm:p-7"
        >
          <summary className="cursor-pointer font-medium">
            Company contacts & research trail ({r?.contacts.length || 0})
          </summary>
          <div className="mt-6 space-y-5">
            <p className="text-xs text-muted-foreground">
              Published role addresses. Company association and deliverability
              are unverified. No messages are sent.
            </p>
            {r?.contacts.map((c) => (
              <div key={c.email + c.sourceUrl}>
                <p className="break-all font-mono text-xs">{c.email}</p>
                <a
                  href={c.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary underline"
                >
                  Source · observed {when(c.observedAt)} ↗
                </a>
              </div>
            ))}
            {!r?.contacts.length && (
              <p className="text-muted-foreground">
                No public recruitment or business email found in the pages
                checked.
              </p>
            )}
            {r?.pages.map((p, i) => (
              <p key={p.url + i} className="text-xs">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-primary underline"
                >
                  {new URL(p.url).hostname} ↗
                </a>{" "}
                · {p.status}
              </p>
            ))}
          </div>
        </details>
        <details
          open
          className="rounded-2xl border border-border bg-surface p-6 text-sm sm:p-7"
        >
          <summary className="cursor-pointer font-medium">
            Source description excerpt
          </summary>
          <p className="mt-6 whitespace-pre-wrap leading-7 text-muted-foreground">
            {job.description}
          </p>
        </details>
        <div className="space-y-3 px-1">
          <a
            className="text-sm font-medium text-primary underline"
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            View original source ↗
          </a>
          <p className="text-xs text-muted-foreground">
            {r?.publishedKnown
              ? `Published ${when(job.publishedAt)}`
              : "Publication date unconfirmed"}{" "}
            · Seen {when(job.lastSeenAt)}. Opening, deadline and recruiter
            authority require verification.
          </p>
        </div>
      </div>
      <aside className="space-y-8 xl:sticky xl:top-8">
        <Card className="gap-5 rounded-2xl border border-border bg-surface p-6 ring-0 sm:p-7">
          <h2 className="text-sm font-medium">Your next move</h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Review the evidence, record your decision and protect time for your
            own work. Nothing is sent automatically.
          </p>{" "}
          <form action={updateOpportunity} className="space-y-5">
            <input type="hidden" name="id" value={job.id} />
            <label className="block space-y-1">
              <span className="text-xs">Your decision</span>
              <select
                name="status"
                defaultValue={job.status}
                className={selectClass}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {label(s)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-xs">
                Notes / why this protects or harms your vision
              </span>
              <Textarea
                name="notes"
                defaultValue={job.notes}
                maxLength={2000}
                rows={4}
              />
            </label>
            <p className="text-xs text-muted-foreground">
              Archive removes this item from the normal queue and keeps its
              decision history.
            </p>
            <SubmitButton>Save decision</SubmitButton>
          </form>
        </Card>
        <Card className="gap-4 rounded-2xl border border-border bg-surface p-6 ring-0 sm:p-7">
          <h2 className="text-sm font-medium">What this score means</h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Fit reflects recorded evidence, not hiring probability. Public
            emails and risk checks do not establish employer legitimacy.
          </p>
        </Card>
      </aside>
    </div>
  );
}
