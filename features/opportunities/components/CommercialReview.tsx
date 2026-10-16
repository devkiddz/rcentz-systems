'use client';
import { useActionState, useState } from 'react';
import { clientStates,clientStateLabels,type Prospect } from '@/features/opportunities/commercial-types';
import { saveCommercialReview,type LeadActionState } from '@/features/opportunities/server/client-lead-actions';
const initial:LeadActionState={status:'idle',message:''};
const checks=[{key:'source',title:'Source & legitimacy',label:'I checked the original source and legitimacy.'},{key:'intent',title:'Buying intent',label:'The buyer has a real need and purchasing intent.'},{key:'eligibility',title:'Supplier eligibility',label:'Location, agreement and supplier requirements are suitable.'},{key:'capacity',title:'Delivery capacity',label:'Rcentz has suitable evidence, availability and delivery capacity.'}];
export function CommercialReview({prospect}:{prospect:Prospect}){
 const [state,action,pending]=useActionState(saveCommercialReview,initial);
 const review=prospect.qualification.review;
 const saved=review&&typeof review==='object'&&'confirmedChecks' in review&&Array.isArray(review.confirmedChecks)?review.confirmedChecks:[];
 const [confirmed,setConfirmed]=useState<string[]>(checks.filter(c=>saved.includes(c.key)).map(c=>c.key));
 const [notes,setNotes]=useState(prospect.notes);
 const [stage,setStage]=useState(prospect.state);
 const advancing=['QUALIFIED','PURSUING','WON'].includes(stage);
 return <form action={action} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm" aria-labelledby="review-heading">
  <input type="hidden" name="id" value={prospect.id}/><input type="hidden" name="updatedAt" value={prospect.updatedAt}/>
  <div className="space-y-1 border-b border-border px-5 py-5 sm:px-6"><p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Your decision</p><h2 id="review-heading" className="text-lg font-semibold">Review & next action</h2><p className="text-sm leading-6 text-muted-foreground">Check the evidence, record what matters, then choose the next stage.</p></div>
  <fieldset disabled={pending} className="space-y-6 p-5 sm:p-6"><legend className="sr-only">Commercial lead assessment</legend>
   <label className="block space-y-2 text-sm"><span className="font-medium">Pipeline stage</span><select name="state" value={stage} onChange={e=>setStage(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-3">{clientStates.map(s=><option key={s} value={s}>{clientStateLabels[s]}</option>)}</select><span className="block text-xs leading-5 text-muted-foreground">Keep it Reviewing while key facts are unconfirmed. Archive unsuitable leads to retain their evidence and history.</span></label>
   <fieldset className="space-y-3"><legend className="mb-2 w-full"><span className="flex flex-wrap items-center justify-between gap-2 text-sm font-medium"><span>Qualification checklist</span><span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs tabular-nums">{confirmed.length} / 4 confirmed</span></span></legend>{checks.map(c=><label key={c.key} className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/50"><input type="checkbox" name={c.key} checked={confirmed.includes(c.key)} onChange={e=>setConfirmed(current=>e.target.checked?[...current,c.key]:current.filter(k=>k!==c.key))} className="mt-1 size-4 shrink-0 accent-primary"/><span className="space-y-1"><span className="block text-sm font-medium">{c.title}</span><span className="block text-xs leading-5 text-muted-foreground">{c.label}</span></span></label>)}</fieldset>
   {advancing&&(confirmed.length<4||notes.trim().length<10)?<p className="rounded-lg border border-border bg-muted/40 p-3 text-sm leading-6" role="status">To advance this lead, confirm all four checks and add an assessment of at least 10 characters. Only confirm what you have verified.</p>:null}
   <label className="block space-y-2 text-sm"><span className="font-medium">Assessment & next action</span><textarea name="notes" maxLength={6000} rows={9} value={notes} onChange={e=>setNotes(e.target.value)} placeholder={'Buyer need and source checks…\nFit, eligibility and budget gaps…\nNext action and proposal draft…'} className="w-full resize-y rounded-xl border border-input bg-background p-3 leading-6" aria-describedby="review-notes-hint"/><span id="review-notes-hint" className="flex flex-wrap justify-between gap-2 text-xs leading-5 text-muted-foreground"><span>Include unanswered questions and any draft proposal. Saving keeps it private.</span><span className="tabular-nums">{notes.length.toLocaleString()} / 6,000</span></span></label>
  </fieldset>
  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/20 px-5 py-4 sm:px-6"><p className="max-w-sm text-xs leading-5 text-muted-foreground">Saving records your review. It does not submit a bid or contact the buyer.</p><button type="submit" disabled={pending} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">{pending?'Saving review…':'Save review'}</button></div>
  {state.message?<p role={state.status==='error'?'alert':'status'} className="border-t border-border px-5 py-4 text-sm leading-6 sm:px-6">{state.message}</p>:null}
 </form>;
}
