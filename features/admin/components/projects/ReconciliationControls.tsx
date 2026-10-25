'use client';
import {useState, useTransition} from 'react';
import {decideHistoricalCommit,reviewHistoricalCommit} from '@/features/admin/server/projects/reconciliation-actions';
type Commit = {id:string;sha:string;message:string;committedAt:string;issue:string|null};
export function ReconciliationControls({projectId,sourceId,targetDeliveryMilestoneId,commits,onCommitted}:{
 projectId:string;sourceId:string;targetDeliveryMilestoneId:string;commits:Commit[];onCommitted:()=>void;
}) {
 const [commitId,setCommitId]=useState('');
 const [prText,setPrText]=useState('');
 const [reason,setReason]=useState('');
 const [review,setReview]=useState<Awaited<ReturnType<typeof reviewHistoricalCommit>>|null>(null);
 const [error,setError]=useState('');
 const [success,setSuccess]=useState('');
 const [pending,start]=useTransition();
 const prNumber=Number(prText);
 const validPr=prText.trim()!==''&&Number.isSafeInteger(prNumber)&&prNumber>0;
 const selected=commits.find(c=>c.id===commitId);
 const candidate=review?.ok?review.candidate:null;
 const approvable=Boolean(candidate?.disposition==='REVIEW_REQUIRED'&&candidate.evidence?.verifiedMerge&&candidate.milestoneKey);
 const field='w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground';
 const reset=()=>{setReview(null);setError('');setSuccess('');};
 function doReview(){if(!selected||!validPr)return;reset();start(async()=>{const result=await reviewHistoricalCommit({projectId,sourceId,commitId,prNumber});setReview(result);if(!result.ok)setError(result.error);});}
 function doDecision(decision:'APPROVE'|'REJECT'){
  if(!selected||!validPr||reason.trim().length<15||reason.trim().length>1000)return;
  if(decision==='APPROVE'&&!approvable)return;
  setError('');start(async()=>{const result=await decideHistoricalCommit({projectId,sourceId,commitId,prNumber,decision,reason,targetDeliveryMilestoneId:decision==='APPROVE'?targetDeliveryMilestoneId:null});
   if(!result.ok){setError(result.error??'Decision rejected');return;}
   setSuccess(`${decision==='APPROVE'?'Association recorded':'Rejection recorded'}; milestone completion unchanged.`);
   setReview(null);setCommitId('');setReason('');onCommitted();
  });
 }
 return <details className="rounded-xl border border-border p-4">
  <summary className="cursor-pointer text-sm font-medium text-foreground">Review historical GitHub commits</summary>
  <p className="mt-2 text-xs text-muted">SUPER_ADMIN only. Approval associates evidence; it never completes a milestone. PR number is a lookup hint, not proof.</p>
  {commits.length===0?<p className="mt-3 text-xs text-muted">No unassigned commits found for this source.</p>:<div className="mt-3 space-y-3">
   <label className="block text-xs text-foreground">Unassigned commit<select className={`${field} mt-1`} value={commitId} onChange={e=>{setCommitId(e.target.value);reset();}}><option value="">Select commit</option>{commits.map(c=><option key={c.id} value={c.id}>{c.sha.slice(0,8)} · {c.message.slice(0,80)}</option>)}</select></label>
   <label className="block text-xs text-foreground">Merged GitHub PR number<input className={`${field} mt-1`} type="number" min="1" step="1" value={prText} onChange={e=>{setPrText(e.target.value);reset();}}/></label>
   <button type="button" disabled={pending||!selected||!validPr} onClick={doReview} className="rounded-lg border border-border px-3 py-2 text-xs disabled:opacity-50">{pending?'Checking…':'Verify PR evidence'}</button>
   {candidate&&<div className="rounded-lg border border-border p-3 text-xs text-foreground"><p>Evidence: {candidate.disposition} · {candidate.reason}</p><p>Milestone marker: {candidate.milestoneKey??'None'}</p><p>Verified merge: {candidate.evidence?.verifiedMerge?'Yes':'No'}</p><p className="mt-1 text-muted">Selected target is the currently displayed tracked milestone. A mismatched marker is rejected by the API.</p></div>}
   {candidate&&<><label className="block text-xs text-foreground">Decision reason (15–1000 characters)<textarea className={`${field} mt-1`} value={reason} maxLength={1000} onChange={e=>setReason(e.target.value)}/></label>
    <div className="flex gap-2"><button type="button" disabled={pending||!approvable||reason.trim().length<15} onClick={()=>doDecision('APPROVE')} className="rounded-lg border border-border px-3 py-2 text-xs disabled:opacity-50">Approve association</button><button type="button" disabled={pending||reason.trim().length<15} onClick={()=>doDecision('REJECT')} className="rounded-lg border border-border px-3 py-2 text-xs disabled:opacity-50">Reject</button></div></>}
  </div>}
  {error&&<p role="alert" className="mt-2 text-xs text-destructive">{error}</p>}
  {success&&<p role="status" className="mt-2 text-xs text-foreground">{success}</p>}
 </details>;
}
