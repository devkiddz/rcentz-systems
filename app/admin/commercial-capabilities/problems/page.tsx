import Link from 'next/link';
import { requireOpportunityAdministrator } from '@/server/opportunities/workspace-access';
import { opportunityRequest } from '@/server/opportunities/client';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Business Problems · Rcentz', robots: { index: false, follow: false } };
type Group = { id:string; key:string; name:string; description:string };
type Blueprint = { id:string; name:string; problem:string; proposedWorkflow:string; status:string; groupId:string | null };
type Association = { id:string; rationale:string; qualificationCriteria:string[]; priority:number; solution:Blueprint };
type Problem = { id:string; key:string; title:string; description:string; symptoms:string[]; impact:string[]; status:string; solutions:Association[] };
type Knowledge = { problems:Problem[]; groups:Group[] };

export default async function Page() {
 await requireOpportunityAdministrator();
 const knowledge = await opportunityRequest<Knowledge>({operation:'knowledge:list'});
 return <main className="rcentz-dashboard-frame px-4 py-6 sm:px-6 lg:px-8"><div className="rcentz-dashboard-inner mx-auto w-full max-w-6xl space-y-6">
  <header className="flex flex-wrap items-start justify-between gap-4"><div className="space-y-2"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Commercial knowledge</p><h1 className="text-2xl font-semibold tracking-tight">Business Problems</h1><p className="max-w-2xl text-sm text-muted-foreground">Start with a customer&apos;s challenge. Open a problem to understand its impact and the solutions Rcentz could propose.</p></div><div className="flex flex-wrap gap-2"><Link className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted" href="/admin/commercial-capabilities">Capabilities</Link><Link className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" href="/admin/commercial-capabilities/problems/manage">Manage knowledge</Link></div></header>
  <section aria-label="Business problem catalogue" className="grid gap-4 md:grid-cols-2">{knowledge.problems.length === 0 ? <div className="rounded-xl border border-border bg-card p-6"><h2 className="font-semibold">No problems yet</h2><p className="mt-2 text-sm text-muted-foreground">Add the first problem in Knowledge Management.</p></div> : knowledge.problems.map(problem=><article key={problem.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5"><div className="flex items-start justify-between gap-3"><span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Business problem</span><span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">{problem.status}</span></div><h2 className="text-lg font-semibold">{problem.title}</h2><p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{problem.description}</p><div className="mt-auto flex items-center justify-between gap-3 pt-2"><span className="text-xs text-muted-foreground">{problem.solutions.length} relevant {problem.solutions.length===1?'solution':'solutions'}</span><Link className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted" href={`/admin/commercial-capabilities/problems/${encodeURIComponent(problem.key)}`}>View problem →</Link></div></article>)}</section>
 </div></main>;
}
