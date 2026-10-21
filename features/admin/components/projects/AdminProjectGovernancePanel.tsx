'use client';
import { useEffect, useState, useTransition } from 'react';
import { mutateProjectGovernance, readProjectGovernance, type GovernanceSnapshot } from '@/features/admin/server/projects/project-governance-ui-actions';

export function AdminProjectGovernancePanel({projectId}:{projectId:string}) {
 const [data,setData]=useState<GovernanceSnapshot|null>(null);
 const [error,setError]=useState('');
 const [pending,start]=useTransition();
 const [selected,setSelected]=useState('');
 const [title,setTitle]=useState('');
 const [description,setDescription]=useState('');
 const [required,setRequired]=useState(true);
 const [reason,setReason]=useState('');
 const [percent,setPercent]=useState('');
 const [evidence,setEvidence]=useState('');
 const [editing,setEditing]=useState('');
 async function reload() {
  try { const snapshot=await readProjectGovernance(projectId);setData(snapshot);setError(''); }
  catch {setError('Governance records are unavailable or access was denied.');}
 }
 useEffect(()=>{void reload();},[projectId]);
 function submit(action:Parameters<typeof mutateProjectGovernance>[0]) {
  setError(''); start(async()=>{
   const result=await mutateProjectGovernance(action);
   if (!result.success) {setError(result.error??'Operation rejected');return;}
   setTitle('');setDescription('');setReason('');setEvidence('');setEditing('');await reload();
  });
 }
 const item=data?.milestones.find(m=>m.id===selected)??data?.milestones[0];
 const revision=item?.criteria.reduce((max,c)=>Math.max(max,c.revision),0)??0;
 const latest=item?.reviews[0];
 const approved=latest?.decision==='APPROVED' && latest.criteriaRevision===revision;
 const canApprove=revision>0 && item?.criteria.some(c=>c.required) && item.criteria.every(c=>!c.required||c.verified);
 const field='w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground';
 return <section className="mt-6 rounded-xl border border-border bg-card p-5 space-y-4" aria-label="Milestone governance">
  <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-base font-semibold">Milestone accountability</h3><p className="text-xs text-muted-foreground">Acceptance evidence, verification and approval are recorded by Rcentz API.</p></div><span className="text-sm font-medium">Project progress: {data?.progress??'—'}%</span></div>
  {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  {!data ? <p className="text-sm text-muted-foreground">Loading governance records…</p> : <>
   <label className="block text-sm">Milestone
    <select className={field} value={item?.id??''} onChange={e=>{setSelected(e.target.value);setEditing('');setReason('');}}>
     {data.milestones.map(m=><option key={m.id} value={m.id}>{m.title}</option>)}
    </select>
   </label>
   {item ? <><div className="flex flex-wrap gap-3 text-xs text-muted-foreground"><span>Criteria revision: {revision||'None'}</span><span>Review: {approved?'Approved':latest?.decision??'Not reviewed'}</span><span>{item.status}</span></div>
    <ul className="space-y-2">{item.criteria.map(c=><li key={c.id} className="rounded-lg border border-border p-3 text-sm"><div className="flex flex-wrap justify-between gap-3"><div><strong>{c.title}</strong> <span className="text-xs text-muted-foreground">{c.required?'Required':'Optional'} · {c.verified?'Verified':'Unverified'}</span>{c.description&&<p className="text-xs text-muted-foreground">{c.description}</p>}</div><div className="flex gap-2"><button className="text-xs underline" disabled={pending} onClick={()=>{setEditing(c.id);setTitle(c.title);setDescription(c.description??'');setRequired(c.required);}}>Edit</button><button className="text-xs underline" disabled={pending} onClick={()=>{
      if (!c.verified && evidence.trim().length<3) {setError('Enter evidence reference/details below before verification.');return;}
      submit({operation:'criterion:verify',projectId,milestoneId:item.id,criterionId:c.id,verified:!c.verified,evidence:c.verified?null:{description:evidence.trim()}});
     }}>{c.verified?'Revoke':'Verify'}</button></div></div></li>)}</ul>
    <label className="block text-xs">Evidence for verification (reference, commit SHA or description)<input className={field} value={evidence} maxLength={1000} onChange={e=>setEvidence(e.target.value)}/></label>
    <form className="grid gap-2" onSubmit={e=>{e.preventDefault();submit(editing?{operation:'criterion:update',projectId,milestoneId:item.id,criterionId:editing,criterion:{title,description:description||null,required,sortOrder:editing?item.criteria.find(c=>c.id===editing)?.sortOrder??0:item.criteria.length}}:{operation:'criterion:create',projectId,milestoneId:item.id,criterion:{title,description:description||null,required,sortOrder:item.criteria.length}});}}>
     <strong className="text-sm">{editing?'Edit acceptance criterion':'Add acceptance criterion'}</strong>
     <input className={field} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Criterion title" maxLength={160} required minLength={3}/>
     <textarea className={field} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Evidence expectations / acceptance details" maxLength={2000}/>
     <label className="text-xs"><input type="checkbox" checked={required} onChange={e=>setRequired(e.target.checked)}/> Required for approval</label>
     <div className="flex gap-3"><button className="rounded-lg border border-border px-3 py-2 text-sm" disabled={pending} type="submit">{editing?'Save criterion':'Add criterion'}</button>{editing&&<button type="button" className="text-sm underline" onClick={()=>{setEditing('');setTitle('');setDescription('');}}>Cancel edit</button>}</div>
    </form>
    <div className="space-y-2 border-t border-border pt-3"><strong className="text-sm">Milestone review</strong><p className="text-xs text-muted-foreground">Approval requires verified required criteria and uses the current revision.</p>
     <textarea className={field} value={reason} maxLength={2000} onChange={e=>setReason(e.target.value)} placeholder="Review or rejection reason"/>
     <div className="flex flex-wrap gap-2"><button type="button" className="rounded-lg border border-border px-3 py-2 text-sm" disabled={pending||!canApprove} onClick={()=>submit({operation:'milestone:review',projectId,milestoneId:item.id,decision:'APPROVED',expectedRevision:revision,reason})}>Approve</button><button type="button" className="rounded-lg border border-border px-3 py-2 text-sm" disabled={pending||revision<1||reason.trim().length<10} onClick={()=>submit({operation:'milestone:review',projectId,milestoneId:item.id,decision:'REJECTED',expectedRevision:revision,reason})}>Reject</button></div>
     {item.reviews.length>0&&<ol className="text-xs text-muted-foreground">{item.reviews.map(r=><li key={r.id}>{r.decision} · revision {r.criteriaRevision} · {new Date(r.createdAt).toLocaleDateString()}{r.reason?` · ${r.reason}`:''}</li>)}</ol>}
    </div>
   </>:<p className="text-sm text-muted-foreground">Create a milestone first to manage its acceptance criteria.</p>}
   <details className="border-t border-border pt-3"><summary className="cursor-pointer text-sm">Administrative progress override</summary><p className="text-xs text-muted-foreground">Restricted to authorized project administrators. Recalculation supersedes this value; the audit record remains.</p><div className="mt-2 grid gap-2"><input className={field} type="number" min={0} max={100} value={percent} onChange={e=>setPercent(e.target.value)} placeholder="Progress %"/><textarea className={field} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Audit reason (minimum 10 characters)"/><button type="button" disabled={pending||percent.trim()===''||reason.trim().length<10} className="w-fit rounded-lg border border-border px-3 py-2 text-sm" onClick={()=>submit({operation:'project:override',projectId,percent:Number(percent),reason})}>Record override</button></div></details>
  </>}
 </section>;
}
