import { sourceContext } from "../lib/source-context";
import { finderButtonVariants } from "./FinderButton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { updateOpportunity } from "../server/actions";
import { statuses } from "../lib/matching";
import type { FinderData } from "../types";
import { SubmitButton } from "./SubmitButton";
import { selectClass, label } from "./OpportunityCard";
const recommendations = {PURSUE: "Pursue after verification", STRETCH: "Stretch — disclose the gaps", SKIP: "Skip for now", CLARIFY: "Clarify before pursuing", QUARANTINE: "Quarantine — review recruitment risk"};
const evidenceLabels = {SUPPORTED: "Contribution recorded", CLAIMED: "Example needed", GAP: "Missing evidence", UNKNOWN: "Unconfirmed"};
const when = (s: string) => new Date(s).toLocaleDateString("en-GB", {timeZone: "Africa/Lagos"});
const clean = (s: string) => s.replace(/\.{2,}/g, ".").trim();
const sectionClass = "rounded-2xl border border-border bg-surface p-6 text-sm sm:p-7";
export function OpportunityDetail({job}: {job: FinderData["jobs"][number]}) {
  const a = job.assessment, research = job.research, review = a.careerReview;
  const context = sourceContext(job), lead = context !== "VACANCY_TEXT";
  const requirements = lead ? [] : review?.requirements || [];
  const supported = requirements.filter(r => r.evidence === "SUPPORTED");
  const needsExample = requirements.filter(r => r.evidence === "CLAIMED");
  const missing = requirements.filter(r => r.evidence === "GAP" && r.priority === "REQUIRED");
  const summaries = [{title:"Contribution evidence",rows:supported},{title:"Examples to prepare",rows:needsExample},{title:"Required evidence gaps",rows:missing}].filter(group=>group.rows.length);
  const verdict = job.quarantined ? recommendations.QUARANTINE : lead ? recommendations.CLARIFY : review ? recommendations[review.recommendation] : a.verdict;
  const reason = job.quarantined ? "Review recruitment risk before pursuing this source." : context === "RESULTS_PAGE" ?
    "This is a jobs-results page, not one vacancy. Its snippets may mix employers, salaries and requirements. Identify an individual vacancy before assessing your fit." :
    context === "DISCOVERY_SNIPPET" ? "The full vacancy and employer are unconfirmed. This discovery snippet is not enough to assess your career fit." :
    review?.reason || "A detailed contribution assessment is not yet available. Review the source and the recorded discovery context.";
  const nextSteps = lead ? [context === "RESULTS_PAGE" ? "Open the source and choose one employer’s individual vacancy." : "Open the individual vacancy and confirm the employer and full requirements.", "Confirm location eligibility, compensation and workload before applying."] : review?.nextSteps.slice(0, 4) || a.questions.slice(0, 3);
  return <div className="grid items-start gap-8 xl:grid-cols-3">
    <div className="min-w-0 space-y-8 xl:col-span-2">
      <Card className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-6 ring-0 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="capitalize">{context === "RESULTS_PAGE" ? "Jobs results page" : lead ? "Discovery lead" : label(job.kind)}</Badge>
          {job.quarantined ? <Badge variant="destructive">Risk to review</Badge> : null}
          <span className="ml-auto text-xs capitalize text-muted-foreground">{label(job.source)}</span>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{lead ? "Employer unconfirmed" : job.company}</p>
          <h1 className="text-xl font-medium leading-snug sm:text-2xl">{job.title}</h1>
          {!lead ? <p className="text-sm text-muted-foreground">{job.location || "Location unconfirmed"} · {job.salary || "Compensation undisclosed"}</p> : null}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <a className={finderButtonVariants({variant:"outline"})} href={job.url} target="_blank" rel="noopener noreferrer">{lead ? "Open discovery source" : "View original vacancy"} ↗</a>
          <p className="text-xs text-muted-foreground">Seen {when(job.lastSeenAt)}</p>
        </div>
      </Card>
      <Card className="gap-6 rounded-2xl border border-border bg-surface p-6 ring-0 sm:p-7">
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Career recommendation</p>
          <h2 className="text-base font-medium">{verdict}</h2>
          <p className="text-sm leading-relaxed">{reason}</p>
        </div>
        {!lead && summaries.length ? <div className="grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
          {summaries.map(group => <div key={group.title} className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground">{group.title}</h3>
            <p className="text-sm leading-relaxed">{group.rows.slice(0,4).map(r=>r.name).join(", ")}{group.rows.length > 4 ? ` +${group.rows.length-4}` : ""}</p>
          </div>)}
        </div> : null}
        <div className="space-y-3 border-t border-border pt-6">
          <h3 className="text-sm font-medium">Your next step</h3>
          <ul className="list-disc space-y-2 pl-4 text-sm leading-relaxed">{nextSteps.map(step => <li key={step}>{step}</li>)}</ul>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{lead ? "No vacancy-specific fit score or requirements are inferred from this source." : "Uses your current saved profile and owner-recorded contributions; not an independent audit."} Your saved decision is unchanged.</p>
      </Card>
      {!lead && requirements.length ? <details className={sectionClass}>
        <summary className="cursor-pointer font-medium">Requirement evidence ({requirements.length})</summary>
        <div className="mt-6 space-y-5">{requirements.map((r,i) => <div key={`${r.name}-${i}`} className="space-y-3 border-b border-border pb-5 last:border-b-0 last:pb-0">
          <div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="font-medium">{r.name}</h3><span className="text-xs capitalize text-muted-foreground">{label(r.priority)} · {evidenceLabels[r.evidence]}</span></div>
          <blockquote className="border-l border-border pl-4 text-xs leading-relaxed text-muted-foreground">“{r.quote}”</blockquote>
          <p className="leading-relaxed">{r.finding}</p>
          {r.projects.length ? <p className="text-xs text-muted-foreground">References: {r.projects.join(", ")}</p> : null}
        </div>)}</div>
      </details> : null}
      <details open={job.quarantined || undefined} className={sectionClass}>
        <summary className="cursor-pointer font-medium">Source verification & contacts ({research?.contacts.length || 0})</summary>
        <div className="mt-6 space-y-5">
          <p className="text-xs leading-relaxed text-muted-foreground">Public contacts and source text do not verify recruiter authority. Nothing is sent automatically.</p>
          {research?.flags.map((f,i) => <div key={i} className="space-y-2"><p className="font-medium">{f.reason}</p><p className="text-xs text-muted-foreground">{f.evidence}</p></div>)}
          {research?.contacts.length ? research.contacts.map(c => <div key={c.email+c.sourceUrl} className="space-y-1"><p className="break-all font-mono text-xs">{c.email}</p><a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">Published source · {when(c.observedAt)} ↗</a></div>) : <p className="text-muted-foreground">No public recruitment contact found in the pages checked.</p>}
          {research?.pages.map((page,i) => <p key={page.url+i} className="text-xs leading-relaxed"><a href={page.url} target="_blank" rel="noopener noreferrer" className="break-all text-primary underline">{new URL(page.url).hostname} ↗</a> · {page.status}</p>)}
          <p className="text-xs text-muted-foreground">Opening, deadline and work authorization still need confirmation.</p>
        </div>
      </details>
      {!lead ? <details className={sectionClass}>
        <summary className="cursor-pointer font-medium">Earlier discovery context</summary>
        <div className="mt-6 space-y-5">
          <p className="text-xs text-muted-foreground">Recorded at collection. Keyword overlap {job.score}/100 is not career fit or hiring probability.</p>
          {a.dimensions?.map(d => <div key={d.name} className="space-y-1"><p className="text-xs font-medium text-muted-foreground">{d.name}</p><p>{clean(d.finding)}</p></div>)}
          <div className="space-y-2"><h3 className="font-medium">Questions still open</h3><ul className="list-disc space-y-2 pl-4">{(a.unknowns || a.questions).map(s=><li key={s}>{clean(s)}</li>)}</ul></div>
          <p className="text-xs text-muted-foreground">{review?.coverage || "Detailed contribution assessment unavailable for this release."}</p>
        </div>
      </details> : null}
      <details className={sectionClass}>
        <summary className="cursor-pointer font-medium">{lead ? "Discovery snippet" : "Source description"}</summary>
        <p className="mt-6 whitespace-pre-wrap leading-7 text-muted-foreground">{job.description}</p>
      </details>
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
      </aside>
  </div>;
}
