import Link from 'next/link';
import { requireOpportunityAdministrator } from '@/server/opportunities/workspace-access';
import { DiscoveryReview } from './review';
export const dynamic='force-dynamic';
export const metadata={title:'Discovery Review · Rcentz Systems',robots:{index:false,follow:false}};
export default async function DiscoveryPage(){await requireOpportunityAdministrator();return <main className="rcentz-dashboard-frame px-4 py-6 sm:px-6 lg:px-8"><div className="rcentz-dashboard-inner mx-auto w-full max-w-6xl space-y-6"><header className="space-y-3"><Link href="/admin/opportunities/clients" className="text-sm text-muted-foreground hover:underline">← Client Acquisition</Link><h1 className="text-2xl font-semibold">Discovery Review</h1><p className="max-w-3xl text-sm text-muted-foreground">Find traceable public procurement notices and review their fit against the Rcentz commercial knowledge catalogue. Results are temporary and require eligibility assessment before pursuit.</p></header><DiscoveryReview/></div></main>}
