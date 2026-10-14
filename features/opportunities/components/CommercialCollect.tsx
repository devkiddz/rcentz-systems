'use client';
import { useActionState } from 'react';
import { collectCommercialLeads, type LeadActionState } from '@/features/opportunities/server/client-lead-actions';
const initial:LeadActionState={status:'idle',message:''};
export function CommercialCollect({configured}:{configured:boolean}){
 const [state,action,pending]=useActionState(collectCommercialLeads,initial);
 return <div className="space-y-3"><form action={action}><button disabled={pending||!configured} type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{pending?'Searching and saving leads…':'Collect opportunities'}</button></form>{state.message?<p role={state.status==='error'?'alert':'status'} className="rounded-md border border-border p-3 text-sm">{state.message}</p>:null}{!configured?<p className="text-sm text-muted-foreground">Public web search needs to be connected in the API deployment before collection can run.</p>:null}</div>;
}
