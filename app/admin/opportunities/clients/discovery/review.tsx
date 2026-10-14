'use client';
import { useActionState, useState } from 'react';
import { reviewPublicOpportunities, type DiscoveryState } from './actions';
const initial:DiscoveryState={status:'idle',message:''};
export function DiscoveryReview(){
  const [state,action,pending]=useActionState(reviewPublicOpportunities,initial);
  const [view,setView]=useState<'recommended'|'all'>('recommended');
  const candidates=state.result?.candidates || [];
  const strong=candidates.filter(item=>item.recommendation==='STRONG_TECHNICAL_SIGNAL');
  const visible=view==='recommended'?strong:candidates;
  return <div className="space-y-5">
    <form action={action} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-5">
      <div className="space-y-1"><h2 className="font-semibold">UK Contracts Finder</h2><p className="text-sm text-muted-foreground">Public procurement · Software-service recommendations · Human qualification required</p></div>
      <button type="submit" disabled={pending} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{pending?'Reviewing public notices…':'Find opportunities'}</button>
    </form>
    {state.message?<p role="status" className="rounded-md border border-border p-3 text-sm">{state.message}</p>:null}
    {state.result?<div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Discovery relevance filter">
          <button type="button" onClick={()=>setView('recommended')} aria-pressed={view==='recommended'} className={`rounded-md border px-3 py-2 text-sm ${view==='recommended'?'bg-muted font-semibold':'border-border'}`}>Recommended ({strong.length})</button>
          <button type="button" onClick={()=>setView('all')} aria-pressed={view==='all'} className={`rounded-md border px-3 py-2 text-sm ${view==='all'?'bg-muted font-semibold':'border-border'}`}>All potential matches ({candidates.length})</button>
        </div><p className="text-xs text-muted-foreground">Technical signal only · Eligibility and delivery unverified</p>
      </div>
      {visible.length===0?<p className="text-sm text-muted-foreground">No {view==='recommended'?'strong technical recommendations':'potential technical opportunities'} in the current source window. Try the broader view or review another source later; this does not mean no opportunities exist.</p>:null}
      {visible.map(item=><article key={item.id} className="space-y-3 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.recommendation==='STRONG_TECHNICAL_SIGNAL'?'Strong technical signal':'Potential technical signal'} · Qualification pending</p>
          <h3 className="text-lg font-semibold">{item.title}</h3><p className="text-sm text-muted-foreground">{item.buyer} · Deadline: {item.deadline?new Date(item.deadline).toLocaleDateString():'Not confirmed'}</p>
        </div><a href={item.url} target="_blank" rel="noopener noreferrer" className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted">Original notice ↗</a></div>
        <p className="line-clamp-4 text-sm text-muted-foreground">{item.description}</p>
        <div className="space-y-2"><p className="text-sm font-medium">Why this might fit Rcentz</p>
          <p className="text-sm text-muted-foreground">{item.recommendation==='STRONG_TECHNICAL_SIGNAL'?'The opportunity title explicitly mentions a software-related service.':'Technical terms appear in the scope; the actual work must be reviewed.'}</p>
          {item.matches.length?item.matches.map(m=><div key={m.id} className="rounded-md border border-border p-3 text-sm"><p className="font-medium">Possible problem: {m.title}</p><p className="text-muted-foreground">{m.explanation}</p><p className="mt-1 text-muted-foreground">Draft solution references: {m.solutions.length?m.solutions.map(s=>s.name).join(', '):'No linked solution'}</p></div>):<p className="text-sm text-muted-foreground">No confirmed business-problem catalogue match. Not automatically disqualified.</p>}
        </div><p className="text-xs text-muted-foreground">External source evidence only. Eligibility, geographic restrictions, registration and delivery capacity require human review. Nothing saved or submitted.</p>
      </article>)}
    </div>:null}
  </div>;
}
