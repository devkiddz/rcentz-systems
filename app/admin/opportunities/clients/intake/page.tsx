import Link from 'next/link';
import { opportunityRequest } from '@/server/opportunities/client';
import { requireOpportunityAdministrator } from '@/server/opportunities/workspace-access';
import { ManualNoticeForm } from './form';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Opportunity intake · Rcentz', robots: { index: false, follow: false } };
type Source = { id: string; name: string; key: string; homepage: string; approval: string; enabled: boolean; method: string };
type Registry = { sources: Source[] };

export default async function ManualOpportunityIntake() {
  await requireOpportunityAdministrator();
  const registry = await opportunityRequest<Registry>({ operation: 'client:source-list' });
  return <main className="rcentz-dashboard-frame px-4 py-6 sm:px-6 lg:px-8">
    <div className="rcentz-dashboard-inner mx-auto w-full max-w-6xl space-y-6">
      <Link href="/admin/opportunities/clients" className="text-sm text-muted-foreground hover:underline">← Client Acquisition</Link>
      <header className="space-y-2"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Client Acquisition / Opportunity intake</p>
        <h1 className="text-2xl font-semibold tracking-tight">Opportunity intake</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">Review a public commercial opportunity, retain its original source and eligibility notes, then add it to the acquisition pipeline for qualification. No websites are fetched or automatically collected.</p>
      </header>
      <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">Draft sources are available for <strong className="text-foreground">preview only</strong>. Saving requires a source approved by an authorized administrator. Every saved opportunity starts as NEW and still requires independent qualification.</div>
      <ManualNoticeForm sources={registry.sources.map(({ id, name, homepage, approval, method }) => ({ id, name, homepage, approval, method }))}/>
      <div className="text-sm text-muted-foreground">Need to review or approve a source? <Link href="/admin/opportunities/clients/sources" className="text-foreground underline underline-offset-4">Open Source Management</Link>.</div>
    </div>
  </main>;
}
