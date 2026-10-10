import type { RetentionData } from "../lib/retention";
import { SettingsSection } from "./SettingsSection";
import { RetentionPanel } from "./RetentionPanel";
import Link from "next/link";
import type { FinderData } from "../types";
import { defaultSkills } from "../lib/matching";
import { saveProfile } from "../server/actions";
import { ProjectEvidenceEditor } from "./ProjectEvidenceEditor";
import { SubmitButton } from "./SubmitButton";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { finderButtonVariants as buttonVariants } from "./FinderButton";

export function FinderSettings({ data, saved, retention }: { data: FinderData; saved: boolean; retention: RetentionData|null }) {
  const { profile, analytics } = data;
  return <main className="rcentz-dashboard-frame px-4 py-6 sm:px-6 lg:px-8">
    <div className="rcentz-dashboard-inner mx-auto w-full max-w-[1200px] space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Private opportunities</p>
          <h1 className="text-3xl font-semibold tracking-tight">Configure your hunt.</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">Set your direction, evidence and work boundaries. Changes guide the next collection; your review queue stays separate.</p>
        </div>
        <Link href="/admin/opportunities" className={buttonVariants({variant: "outline"})}>Back to opportunities</Link>
      </header>
      {saved ? <Card role="status" className="p-4 text-sm">Your hunt profile has been saved.</Card> : null}
      <form action={saveProfile} className="space-y-8">
        <input type="hidden" name="returnTo" value="settings" />
        <SettingsSection title="Career direction" description="Skills you can explain and roles you want to pursue." defaultOpen>
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
        </SettingsSection>
        <SettingsSection title="Project references" description={`${profile?.projectEvidence?.length || 0} saved references — your contribution and supporting evidence.`}><ProjectEvidenceEditor entries={profile?.projectEvidence || []} /></SettingsSection>
        <SettingsSection title="Work boundaries & discovery" description="Experience, weekly hours, eligibility and collection controls.">
          <p className="text-sm leading-relaxed text-muted-foreground">Home country informs eligibility checks; it does not confine the hunt to that country.</p>
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
        <div className="space-y-3 border-t border-border pt-6"><h3 className="font-semibold">Source coverage & collection</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{analytics ? (analytics.searchConfigured ? "Broad web search is configured." : "Broad web search is awaiting configuration.") : "Source configuration status is unavailable."} Source health and collection failures remain in your review workspace.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">Standard collection limits: up to 25 new saves per run, including two stretch roles, with 500 untouched records. Six opportunities appear per review page.</p>

        </div>
        </SettingsSection>
        <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Saving does not start a collection or remove existing opportunities.</p>
          <SubmitButton>Save profile</SubmitButton>
        </div>
      </form>
      <SettingsSection id="storage" title="Storage & cleanup" description="Protect useful records and preview old untouched entries." defaultOpen={retention?.preview === true}><RetentionPanel data={retention} /></SettingsSection>
      <SettingsSection title="Schedule & delivery" description="Daily timing and where your discoveries arrive.">
          <p className="text-sm leading-relaxed text-muted-foreground">Daily at 07:00 UTC / 08:00 Lagos while collection is enabled. Manual checks share the existing 20-hour cooldown.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">Results appear in your private opportunity workspace. Email and push delivery are not configured.</p>
      </SettingsSection>
    </div>
  </main>;
}
