import { AcquisitionHeader } from '@/features/opportunities/components/AcquisitionHeader';
import { opportunityRequest } from '@/server/opportunities/client';
import { requireOpportunityAdministrator } from '@/server/opportunities/workspace-access';
import { addClientSource, updateClientSourceDecision } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Commercial discovery sources · Rcentz', robots: { index: false, follow: false } };

type DiscoverySource = {
  id: string; key: string; name: string; homepage: string; kind: string; lane: string;
  method: string; approval: string; enabled: boolean; permittedEndpoint: string | null;
  cadenceMinutes: number; maxItemsPerRun: number; notes: string;
};
type Registry = { sources: DiscoverySource[]; collectionEnabled: boolean };
const card = 'rounded-xl border border-border bg-card p-5';
const field = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground';
const button = 'rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50';
const friendly = (value: string) => value.replaceAll('_', ' ').toLowerCase().replace(/^./, c => c.toUpperCase());

export default async function ClientDiscoverySourcesPage() {
  await requireOpportunityAdministrator();
  const registry = await opportunityRequest<Registry>({ operation: 'client:source-list' });
  const sources = registry.sources;
  const approved = sources.filter(s => s.approval === 'APPROVED').length;
  const active = sources.filter(s => s.approval === 'APPROVED' && s.enabled).length;
  return <main className="rcentz-dashboard-frame px-4 py-6 sm:px-6 lg:px-8">
    <div className="rcentz-dashboard-inner mx-auto w-full max-w-6xl space-y-6">
      <AcquisitionHeader active="sources" title="Source management" description="Review and maintain sources used for manual opportunity intake. Source approval is separate from web discovery."/>
      <section className="grid gap-3 sm:grid-cols-3" aria-label="Source registry summary">
        {[['Registered sources', sources.length], ['Approved sources', approved], ['Approved and enabled', active]].map(([label, value]) =>
          <div className={card} key={label}><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p></div>)}
      </section>
      <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        <strong className="font-medium text-foreground">Registry feeds are not connected to collection.</strong> These sources support manual intake. Public web discovery runs separately; approving a registry source does not change its searches.
      </div>
      <section className="space-y-4" aria-labelledby="sources-heading">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="sources-heading" className="text-lg font-semibold">Registered sources</h2><span className="text-sm text-muted-foreground">{sources.length} records</span></div>
        {sources.length === 0 ? <div className={card}><p className="text-sm text-muted-foreground">No discovery sources yet. Add a draft below, then review it before approval.</p></div> :
          <div className="space-y-3">{sources.map(source => <article key={source.id} className={`${card} space-y-3`}>
            <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 space-y-1"><h3 className="font-semibold">{source.name}</h3><p className="break-all text-xs text-muted-foreground">{source.homepage}</p><p className="text-xs text-muted-foreground">{source.key}</p></div>
              <div className="flex flex-wrap gap-2"><span className="rounded-md border border-border px-2 py-1 text-xs">{friendly(source.approval)}</span><span className="rounded-md border border-border px-2 py-1 text-xs">{source.enabled ? 'Enabled' : 'Disabled'}</span></div></div>
            <dl className="grid gap-2 text-sm sm:grid-cols-3"><div><dt className="text-muted-foreground">Discovery lane</dt><dd>{friendly(source.lane)}</dd></div><div><dt className="text-muted-foreground">Source type</dt><dd>{friendly(source.kind)}</dd></div><div><dt className="text-muted-foreground">Collection method</dt><dd>{friendly(source.method)}</dd></div></dl>
            <p className="text-xs text-muted-foreground">Limit: {source.maxItemsPerRun} items/run · Cadence: {source.cadenceMinutes} minutes · No collection configured</p>
            {source.notes ? <p className="text-sm text-muted-foreground">{source.notes}</p> : null}
            <div className="flex flex-wrap gap-2 border-t border-border pt-3">
              {source.approval === 'DRAFT' ? <form action={updateClientSourceDecision}><input type="hidden" name="id" value={source.id}/><input type="hidden" name="decision" value="APPROVE"/><input type="hidden" name="confirmation" value="REVIEWED-COMMERCIAL-SOURCE"/><button className={button} type="submit">Approve reviewed source</button></form> : null}
              {source.approval === 'APPROVED' && !source.enabled ? <form action={updateClientSourceDecision}><input type="hidden" name="id" value={source.id}/><input type="hidden" name="decision" value="ENABLE"/><input type="hidden" name="confirmation" value="REVIEWED-COMMERCIAL-SOURCE"/><button className={button} type="submit">Enable</button></form> : null}
              {source.approval === 'APPROVED' && source.enabled ? <form action={updateClientSourceDecision}><input type="hidden" name="id" value={source.id}/><input type="hidden" name="decision" value="DISABLE"/><input type="hidden" name="confirmation" value="REVIEWED-COMMERCIAL-SOURCE"/><button className={button} type="submit">Disable</button></form> : null}
              {source.approval !== 'SUSPENDED' ? <form action={updateClientSourceDecision}><input type="hidden" name="id" value={source.id}/><input type="hidden" name="decision" value="SUSPEND"/><input type="hidden" name="confirmation" value="REVIEWED-COMMERCIAL-SOURCE"/><button className={button} type="submit">Suspend</button></form> : null}
            </div>
          </article>)}</div>}
      </section>
      <details className={`${card} space-y-4`}><summary className="cursor-pointer font-semibold">Add a discovery source (draft)</summary>
        <form action={addClientSource} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm">Source name<input className={field} name="name" minLength={3} maxLength={140} required placeholder="Official public tenders"/></label>
          <label className="space-y-1 text-sm">Source key<input className={field} name="key" pattern="[a-z0-9][a-z0-9-]{2,79}" required placeholder="official-tenders"/></label>
          <label className="space-y-1 text-sm sm:col-span-2">Official homepage (HTTPS)<input className={field} type="url" name="homepage" required placeholder="https://example.org"/></label>
          <label className="space-y-1 text-sm">Discovery lane<select className={field} name="lane"><option value="DIRECT_DEMAND">Direct commercial demand</option><option value="PROSPECT_SIGNAL">Business prospect signals</option><option value="PARTNERSHIP">Partnerships</option></select></label>
          <label className="space-y-1 text-sm">Source type<select className={field} name="kind"><option value="PUBLIC_RFP">Public RFP / tender</option><option value="PUBLIC_PROJECT_REQUEST">Public project request</option><option value="COMPANY_WEBSITE">Company website</option><option value="BUSINESS_DIRECTORY">Business directory</option><option value="PARTNERSHIP_NOTICE">Partnership notice</option><option value="OTHER_PUBLIC">Other public source</option></select></label>
          <label className="space-y-1 text-sm">Review / collection method<select className={field} name="method"><option value="MANUAL_REVIEW">Manual review (recommended first)</option><option value="PUBLIC_FEED">Public feed</option><option value="OFFICIAL_API">Official API</option></select></label>
          <label className="space-y-1 text-sm">Permitted endpoint (only for feed/API)<input className={field} type="url" name="permittedEndpoint" placeholder="https://example.org/feed"/></label>
          <label className="space-y-1 text-sm">Minimum interval, minutes<input className={field} name="cadenceMinutes" type="number" min={60} max={43200} defaultValue={1440} required/></label>
          <label className="space-y-1 text-sm">Maximum items per run<input className={field} name="maxItemsPerRun" type="number" min={1} max={100} defaultValue={20} required/></label>
          <label className="space-y-1 text-sm sm:col-span-2">Internal review notes<textarea className={field} name="notes" maxLength={2000} rows={3} placeholder="What commercial signals does this source provide?"/></label>
          <div className="sm:col-span-2 space-y-2"><p className="text-xs text-muted-foreground">The API validates official HTTPS URLs, same-host endpoints, limits and source type. A source always starts disabled and in draft.</p><button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" type="submit">Save draft source</button></div>
        </form>
      </details>
    </div>
  </main>;
}
