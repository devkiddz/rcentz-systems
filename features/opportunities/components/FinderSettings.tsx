import Link from "next/link";
import type { FinderData } from "../types";
import { defaultSkills } from "../lib/matching";
import { saveProfile } from "../server/actions";
import { ProjectEvidenceEditor } from "./ProjectEvidenceEditor";
import { SubmitButton } from "./SubmitButton";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";

export function FinderSettings({ data, saved }: { data: FinderData; saved: boolean }) {
  const { profile, analytics } = data;
  return <main className="rcentz-dashboard-frame px-4 py-6 sm:px-6 lg:px-8">
    <div className="rcentz-dashboard-inner mx-auto w-full max-w-[1200px] space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Private opportunities</p>
          <h1 className="text-3xl font-semibold tracking-tight">Configure your hunt.</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">Set your direction, evidence and work boundaries. Changes guide the next collection; your review queue stays separate.</p>
        </div>
        <Link href="/admin/opportunities" className={buttonVariants({variant: "outline"})}>Back to opportunities</Link>
      </header>
      {saved ? <Card role="status" className="p-4 text-sm">Your hunt profile has been saved.</Card> : null}
      <form action={saveProfile} className="space-y-6">
        <input type="hidden" name="returnTo" value="settings" />
        <Card className="gap-5 p-5 sm:p-6">
          <div className="space-y-2"><h2 className="font-semibold">Career direction</h2><p className="text-sm text-muted-foreground">Use skills you can explain and roles you actually want to pursue.</p></div>
          <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm">Skills, separated by commas</span>
                <Input
                  name="skills"
                  defaultValue={(profile?.skills || defaultSkills).join(", ")}
                  required
                  maxLength={1000}
                />
              </label>
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm">
                  Priority roles, separated by commas
                </span>
                <Input
                  name="targetRoles"
                  defaultValue={(
                    profile?.targetRoles || [
                      "Frontend Engineer",
                      "Software Developer",
                      "Product Engineer",
                    ]
                  ).join(", ")}
                  required
                  maxLength={640}
                />
              </label>
          </div>
        </Card>
        <Card className="gap-5 p-5 sm:p-6"><ProjectEvidenceEditor entries={profile?.projectEvidence || []} /></Card>
        <Card className="gap-5 p-5 sm:p-6">
          <div className="space-y-2"><h2 className="font-semibold">Work boundaries & discovery</h2><p className="text-sm text-muted-foreground">Home country informs eligibility checks; it does not confine the hunt to that country.</p></div>
          <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm">
                  Minimum years of experience you can substantiate
                </span>
                <Input
                  name="experienceYears"
                  type="number"
                  min={0}
                  max={50}
                  defaultValue={profile?.experienceYears ?? 2}
                  required
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm">
                  Home country · for eligibility checks
                </span>
                <Input
                  name="homeCountry"
                  defaultValue={profile?.homeCountry || "Nigeria"}
                  required
                  maxLength={80}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm">Maximum weekly hours · optional</span>
                <Input
                  name="maxWeeklyHours"
                  type="number"
                  min={1}
                  max={80}
                  defaultValue={profile?.maxWeeklyHours ?? ""}
                />
              </label>
              <div className="space-y-3 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="relocation"
                    defaultChecked={profile?.relocation ?? true}
                  />
                  Consider relocation / sponsorship
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="researchEnabled"
                    defaultChecked={profile?.researchEnabled ?? true}
                  />
                  Enable web and company research
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="enabled"
                    defaultChecked={profile?.enabled ?? false}
                  />
                  Enable daily collection
                </label>
              </div>
          </div>
        </Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">Saving does not start a collection or remove existing opportunities.</p>
          <SubmitButton>Save profile</SubmitButton>
        </div>
      </form>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card className="gap-4 p-5 sm:p-6"><h2 className="font-semibold">Schedule & delivery</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">Daily at 07:00 UTC / 08:00 Lagos while collection is enabled. Manual checks share the existing 20-hour cooldown.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">Results appear in your private opportunity workspace. Email and push delivery are not configured.</p>
        </Card>
        <Card className="gap-4 p-5 sm:p-6"><h2 className="font-semibold">Source coverage & storage</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{analytics ? (analytics.searchConfigured ? "Broad web search is configured." : "Broad web search is awaiting configuration.") : "Source configuration status is unavailable."} Source health and collection failures remain in your review workspace.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">Standard collection limits: up to 25 new saves per run, including two stretch roles, with 500 untouched records. Six opportunities appear per review page.</p>
          <p className="text-xs leading-5 text-muted-foreground">Retention is managed in the API deployment. This page does not expose its enablement state or run cleanup. Storage preview and controls are the next phase.</p>
        </Card>
      </div>
    </div>
  </main>;
}
