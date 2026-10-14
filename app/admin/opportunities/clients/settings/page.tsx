import Link from 'next/link';
import { opportunityRequest } from '@/server/opportunities/client';
import { requireOpportunityAdministrator } from '@/server/opportunities/workspace-access';
import { saveClientAcquisitionSettings } from '@/features/opportunities/server/client-acquisition-settings-actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Client Acquisition settings · Rcentz', robots: { index: false, follow: false } };

type AcquisitionSettings = { regions: string[]; industries: string[]; engagementTypes: string[]; preferredSources: string[]; businessProblems: string[]; includeUnpriced: boolean; requireBudget: boolean; discoveryEnabled: boolean; minimumScore: number };
type ClientRead = { settings: AcquisitionSettings | null; total: number };
type Profile = { name: string; operatingCountry: string; deliveryMode: string; availabilityNote: string; weeklyHours: number | null; concurrentCapacity: number | null };
type Data = { profile: Profile | null; capabilities: { status: string }[] };

const fields = [
  { name: 'regions', label: 'Target regions', hint: 'Countries or regions; leave blank to explore worldwide.' },
  { name: 'industries', label: 'Target industries', hint: 'Business sectors worth investigating.' },
  { name: 'engagementTypes', label: 'Engagement types', hint: 'For example: custom projects, retainers, partnerships.' },
  { name: 'preferredSources', label: 'Preferred discovery sources', hint: 'Source categories or approved sites; not credentials.' },
  { name: 'businessProblems', label: 'Business problems to identify', hint: 'Signals that a customer may need a solution.' },
] as const;

export default async function ClientAcquisitionSettings({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireOpportunityAdministrator();
  const [data, acquisition, query] = await Promise.all([
    opportunityRequest<Data>({ operation: 'company:list' }),
    opportunityRequest<ClientRead>({ operation: 'client:list', page: 1 }),
    searchParams,
  ]);
  const settings = acquisition.settings;
  return (
    <main className="rcentz-dashboard-frame px-4 py-6 sm:px-6 lg:px-8">
      <div className="rcentz-dashboard-inner mx-auto w-full max-w-6xl space-y-5">
        <Link className="text-sm text-muted-foreground hover:underline" href="/admin/opportunities/clients">← Client Acquisition</Link>
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Acquisition Configuration</h1>
          <p className="text-sm text-muted-foreground">Commercial discovery preferences, independent of Career & Freelance.</p>
        </header>
        {query.saved === '1' ? <p role="status" className="rounded-md border border-border bg-card p-3 text-sm">Acquisition preferences and daily discovery setting saved.</p> : null}
        <section className="space-y-3 rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold">Rcentz operating profile</h2>
          {data.profile ? <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-muted-foreground">Company</dt><dd>{data.profile.name}</dd></div>
            <div><dt className="text-muted-foreground">Operating country</dt><dd>{data.profile.operatingCountry}</dd></div>
            <div><dt className="text-muted-foreground">Delivery mode</dt><dd>{data.profile.deliveryMode}</dd></div>
            <div><dt className="text-muted-foreground">Availability</dt><dd>{data.profile.availabilityNote}</dd></div>
            <div><dt className="text-muted-foreground">Weekly capacity</dt><dd>{data.profile.weeklyHours ?? 'Unconfirmed'}</dd></div>
            <div><dt className="text-muted-foreground">Concurrent engagements</dt><dd>{data.profile.concurrentCapacity ?? 'Unconfirmed'}</dd></div>
          </dl> : <p className="text-sm text-muted-foreground">Company profile not configured.</p>}
          <p className="text-sm text-muted-foreground">{data.capabilities.length} commercial capabilities currently recorded.</p>
          <Link href="/admin/commercial-capabilities" className="inline-flex rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">Manage commercial capabilities</Link>
        </section>
        <form action={saveClientAcquisitionSettings} className="space-y-5 rounded-xl border border-border bg-card p-5">
          <div className="space-y-1">
            <h2 className="font-semibold">Client discovery preferences</h2>
            <p className="text-sm text-muted-foreground">Lists are comma-separated. Empty lists keep discovery open rather than excluding unknown markets.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => <label key={field.name} className="space-y-2 text-sm">
              <span className="block font-medium">{field.label}</span>
              <textarea name={field.name} rows={3} maxLength={3000} defaultValue={(settings?.[field.name] ?? []).join(', ')} className="w-full resize-y rounded-md border border-input bg-background p-3 text-foreground" />
              <span className="block text-xs text-muted-foreground">{field.hint}</span>
            </label>)}
          </div>
          <label className="block space-y-2 text-sm">
            <span className="block font-medium">Minimum match score</span>
            <input name="minimumScore" type="number" min={0} max={100} step={1} required defaultValue={settings?.minimumScore ?? 0} className="w-full max-w-40 rounded-md border border-input bg-background px-3 py-2" />
            <span className="block text-xs text-muted-foreground">Use 0 for broad discovery. Qualification remains separate from collection.</span>
          </label>
          <div className="space-y-3">
            <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="includeUnpriced" defaultChecked={settings?.includeUnpriced ?? true} className="mt-1" /> <span>Include leads with no published budget</span></label>
            <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="requireBudget" defaultChecked={settings?.requireBudget ?? false} className="mt-1" /> <span>Require a published budget (cannot be combined with including unpriced leads)</span></label>
          </div>
          <label className="flex items-start gap-3 rounded-md border border-border p-3 text-sm"><input type="checkbox" name="discoveryEnabled" defaultChecked={settings?.discoveryEnabled ?? false} className="mt-1"/><span>Enable daily commercial discovery at 07:00 UTC / 08:00 Lagos. This saves leads for review; it does not send messages. Manual and scheduled hunts share a 20-hour waiting period.</span></label>
          <button type="submit" className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Save acquisition preferences</button>
        </form>
        <p className="text-sm text-muted-foreground">{acquisition.total} client prospects are stored independently from Career & Freelance. No prospect changes are made here.</p>
      </div>
    </main>
  );
}
