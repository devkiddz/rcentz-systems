import Link from "next/link";
import { requireFinderOwner } from "@/server/opportunities/access";
import { opportunityRequest } from "@/server/opportunities/client";
import { validateContacts } from "@/features/opportunities/lib/contacts";
import { opportunityHref } from "@/features/opportunities/lib/navigation";
import { CopyEmail } from "@/features/opportunities/components/CopyEmail";
import { finderButtonVariants } from "@/features/opportunities/components/FinderButton";
export const dynamic="force-dynamic";
export const metadata={title:"Opportunity contacts",robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{page?:string}>}) {
  await requireFinderOwner();
  const query=await searchParams;
  const {contacts,pagination:p}=validateContacts(await opportunityRequest({operation:"contacts",page:Number(query.page)||1}));
  return <main className="rcentz-dashboard-frame px-4 py-6 sm:px-6 lg:px-8"><div className="rcentz-dashboard-inner mx-auto w-full max-w-6xl space-y-8">
    <header className="flex flex-wrap items-start justify-between gap-4"><div className="max-w-2xl space-y-3"><p className="text-xs uppercase tracking-wider text-muted-foreground">Private opportunity research</p><h1 className="text-3xl font-semibold tracking-tight">Company contacts</h1><p className="text-sm leading-relaxed text-muted-foreground">Published addresses linked to saved opportunities. Purpose is inferred from the mailbox name; company association and deliverability remain unverified.</p></div><Link href="/admin/opportunities" className={finderButtonVariants({variant:"outline"})}>Back to opportunities</Link></header>
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{contacts.map(c=><article key={c.opportunityId+c.email+c.sourceUrl} className="space-y-5 rounded-2xl border border-border bg-surface p-6 sm:p-7"><div className="space-y-2"><p className="text-xs text-muted-foreground">{c.purpose} · Published, unverified</p><h2 className="font-semibold">{c.company}</h2><p className="break-all font-mono text-sm select-all">{c.email}</p></div><p className="text-sm text-muted-foreground">{c.title}</p><CopyEmail email={c.email}/><div className="space-y-2 border-t border-border pt-4"><Link href={opportunityHref({id:c.opportunityId,title:c.title})} className="block text-sm text-primary underline underline-offset-4">Open opportunity</Link><a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="block text-sm text-primary underline underline-offset-4">Open published source ↗</a><p className="text-xs text-muted-foreground">Observed {new Date(c.observedAt).toLocaleDateString("en-GB",{timeZone:"Africa/Lagos"})}</p></div></article>)}</div>
    {!contacts.length?<div className="rounded-2xl border border-border bg-surface p-7 text-sm text-muted-foreground">No published contacts in active, non-quarantined opportunities yet. Future research checks recruitment and procurement/business pages. No addresses are invented.</div>:null}
    <nav aria-label="Contact pages" className="flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-muted-foreground">Page {p.page} of {p.pages} · {p.total} published contact references</p><div className="flex gap-3">{p.hasPrevious?<Link className={finderButtonVariants({variant:"outline"})} href={`?page=${p.page-1}`}>Previous</Link>:null}{p.hasNext?<Link className={finderButtonVariants({variant:"outline"})} href={`?page=${p.page+1}`}>Next</Link>:null}</div></nav>
  </div></main>;
}
