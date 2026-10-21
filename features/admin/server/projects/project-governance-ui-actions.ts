'use server';
import { revalidatePath } from 'next/cache';
import { governanceRequest } from '@/server/rcentz-api/governance-client';

export type GovernanceSnapshot = {
 id: string; progress: number; milestones: Array<{
  id: string; title: string; status: string;
  criteria: Array<{id:string;title:string;description:string|null;required:boolean;verified:boolean;verifiedAt:string|null;revision:number;sortOrder:number}>;
  reviews: Array<{id:string;decision:string;reason:string|null;criteriaRevision:number;createdAt:string}>;
 }>;
};
type Action =
 | {operation:'criterion:create';projectId:string;milestoneId:string;criterion:{title:string;description:string|null;required:boolean;sortOrder:number}}
 | {operation:'criterion:update';projectId:string;milestoneId:string;criterionId:string;criterion:{title:string;description:string|null;required:boolean;sortOrder:number}}
 | {operation:'criterion:verify';projectId:string;milestoneId:string;criterionId:string;verified:boolean;evidence:Record<string,unknown>|null}
 | {operation:'milestone:review';projectId:string;milestoneId:string;decision:'APPROVED'|'REJECTED';expectedRevision:number;reason?:string}
 | {operation:'project:override';projectId:string;percent:number;reason:string};
const validId = (x:string) => /^[a-zA-Z0-9:_-]{1,160}$/.test(x);
export async function readProjectGovernance(projectId:string):Promise<GovernanceSnapshot> {
 if (!validId(projectId)) throw new Error('Invalid project');
 return governanceRequest<GovernanceSnapshot>({operation:'governance:read',projectId});
}
export async function mutateProjectGovernance(action:Action):Promise<{success:boolean;error?:string}> {
 if (!validId(action.projectId) || ('milestoneId' in action && !validId(action.milestoneId)) ||
     ('criterionId' in action && !validId(action.criterionId))) return {success:false,error:'Invalid identifier'};
 try {
  const payload = action;
  if (payload.operation==='criterion:create' || payload.operation==='criterion:update') {
   if (payload.criterion.title.trim().length<3 || payload.criterion.title.length>160 ||
       (payload.criterion.description?.length??0)>2000) return {success:false,error:'Invalid criterion'};
  }
  if (payload.operation==='milestone:review' && payload.decision==='REJECTED' && (payload.reason?.trim().length??0)<10)
    return {success:false,error:'Rejection requires a reason (10+ characters)'};
  if (payload.operation==='project:override' && (payload.reason.trim().length<10 || !Number.isInteger(payload.percent) || payload.percent<0 || payload.percent>100))
    return {success:false,error:'Invalid progress override'};
  if (action.operation === 'project:override') {
    await governanceRequest({
      operation: 'project:override',
      projectId: action.projectId,
      percent: action.percent,
      reason: action.reason,
    });
  } else {
    const { projectId: _projectId, ...request } = action;
    await governanceRequest(request);
  }
  revalidatePath(`/admin/projects/${action.projectId}`);
  return {success:true};
 } catch { return {success:false,error:'Action rejected by governance policy or API unavailable'}; }
}


