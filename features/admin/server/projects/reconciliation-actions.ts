'use server';
import { revalidatePath } from 'next/cache';
import { reconciliationRequest, type ReconciliationResult } from '@/server/rcentz-api/reconciliation-client';
const valid = (x: unknown): x is string => typeof x === 'string' && /^[A-Za-z0-9:_-]{1,160}$/.test(x);
const prValid = (n: number) => Number.isSafeInteger(n) && n > 0;
export async function reviewHistoricalCommit(input: {projectId:string;sourceId:string;commitId:string;prNumber:number}) {
  if (!valid(input.projectId)||!valid(input.sourceId)||!valid(input.commitId)||!prValid(input.prNumber))
    return {ok:false as const,error:'Invalid review request'};
  try {
    const result = await reconciliationRequest<ReconciliationResult>({operation:'review',sourceId:input.sourceId,commitId:input.commitId,prNumber:input.prNumber});
    if (result.candidate.projectId !== input.projectId) return {ok:false as const,error:'Project mismatch'};
    return {ok:true as const,candidate:result.candidate};
  } catch {return {ok:false as const,error:'Review unavailable or permission denied'};}
}
export async function decideHistoricalCommit(input: {projectId:string;sourceId:string;commitId:string;prNumber:number;
  decision:'APPROVE'|'REJECT';reason:string;targetDeliveryMilestoneId:string|null}) {
  if (!valid(input.projectId)||!valid(input.sourceId)||!valid(input.commitId)||!prValid(input.prNumber)||
      !['APPROVE','REJECT'].includes(input.decision)||typeof input.reason!=='string'||
      input.reason.trim().length<15||input.reason.trim().length>1000||
      (input.decision==='APPROVE'&&!valid(input.targetDeliveryMilestoneId))||
      (input.targetDeliveryMilestoneId!==null&&!valid(input.targetDeliveryMilestoneId)))
    return {ok:false,error:'Invalid decision or reason'};
  try {
    await reconciliationRequest({operation:'decide',sourceId:input.sourceId,commitId:input.commitId,
      prNumber:input.prNumber,decision:input.decision,reason:input.reason.trim(),
      targetDeliveryMilestoneId:input.targetDeliveryMilestoneId});
    revalidatePath(`/admin/projects/${input.projectId}`);
    return {ok:true};
  } catch {return {ok:false,error:'Decision unavailable or permission denied'};}
}
