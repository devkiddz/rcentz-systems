import Link from 'next/link';

import { opportunityRequest } from '@/server/opportunities/client';

import { requireOpportunityAdministrator } from '@/server/opportunities/workspace-access';



export const dynamic = 'force-dynamic';

export const metadata = { title: 'Client Acquisition · Rcentz', robots: { index: false, follow: false } };



type ClientOverview = { total: number; settings: { discoveryEnabled: boolean } | null };

type Capability = { id: string; name: string; status: string; solutions?: unknown[] };

type CompanyOverview = {

  profile: { name: string; operatingCountry: string; deliveryMode: string; availabilityNote: string } | null;

  capabilities: Capability[];

  services: { id: string; name: string }[];

};



export default async function ClientAcquisitionPage() {

  await requireOpportunityAdministrator();

  const data = await opportunityRequest<CompanyOverview>({ operation: 'company:list' });

  const acquisition = await opportunityRequest<ClientOverview>({ operation: 'client:list', page: 1 });

  const ready = data.capabilities.filter((capability) => capability.status === 'READY').length;

  const solutions = data.capabilities.reduce((sum, capability) => sum + (capability.solutions?.length ?? 0), 0);

  return (

    <main className="rcentz-dashboard-frame px-4 py-6 sm:px-6 lg:px-8">

      <div className="rcentz-dashboard-inner mx-auto w-full max-w-6xl space-y-6">

        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div className="space-y-2">

            <h1 className="text-2xl font-semibold">Client Acquisition</h1>

            <p className="text-sm text-muted-foreground">Commercial prospecting for software projects, client contracts, retainers and partnerships.</p>

          </div>

          <Link href="/admin/opportunities/clients/discovery" className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">Discovery review</Link>
          <Link href="/admin/opportunities/clients/intake" className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">Opportunity intake</Link>
          <Link href="/admin/opportunities/clients/sources" className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">Discovery sources</Link>

          <Link href="/admin/opportunities/clients/settings" className="inline-flex w-fit rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">Acquisition configuration</Link>

        </header>

        <section aria-label="Commercial readiness" className="grid gap-3 sm:grid-cols-3">

          {[{label:'Client prospects',value:acquisition.total},{label:'Ready capabilities',value:ready},{label:'Solution blueprints',value:solutions}].map((stat) => (

            <div key={stat.label} className="rounded-xl border border-border bg-card p-5">

              <p className="text-sm text-muted-foreground">{stat.label}</p>

              <p className="mt-2 text-3xl font-semibold tabular-nums">{stat.value}</p>

            </div>

          ))}

        </section>

        <section className="space-y-3 rounded-xl border border-border bg-card p-5">

          <h2 className="font-semibold">Commercial discovery status</h2>

          <p className="text-sm text-muted-foreground">Client Acquisition records are read from its own API and company profile. Commercial collection remains disabled until the dedicated collector is reviewed.</p>

          <p className="text-sm text-muted-foreground">{data.profile ? `Operating profile: ${data.profile.name} · ${data.profile.operatingCountry} · ${data.profile.deliveryMode}` : 'Set up the company operating profile before activating commercial matching.'}</p>

          <Link href="/admin/commercial-capabilities" className="inline-flex rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">Manage commercial capabilities</Link>

        </section>

        <section className="space-y-2 rounded-xl border border-border bg-card p-5">

          <h2 className="font-semibold">Acquisition settings</h2>

          <p className="text-sm text-muted-foreground">{acquisition.settings ? 'Saved acquisition preferences are available.' : 'No acquisition preferences saved yet.'} Collection: {acquisition.settings?.discoveryEnabled ? 'Enabled' : 'Disabled'}.</p>

          <Link href="/admin/opportunities/clients/settings" className="text-sm underline underline-offset-4">View configuration</Link>

        </section>

        <section className="space-y-2 rounded-xl border border-border bg-card p-5">

          <h2 className="font-semibold">Service knowledge base</h2>

          <p className="text-sm text-muted-foreground">{data.services.length} existing service records available for capability relationships. This is not a lead count.</p>

        </section>

      </div>

    </main>

  );

}
