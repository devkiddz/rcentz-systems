'use server';
import { opportunityRequest } from '@/server/opportunities/client';
import { requireOpportunityAdministrator } from '@/server/opportunities/workspace-access';
export type DiscoveryResult = {source:string;sourceUrl:string;readOnly:boolean;checked:number;note:string;candidates:{recommendation:string;id:string;title:string;buyer:string;description:string;url:string;deadline:string|null;publishedAt:string|null;warnings:string[];matches:{id:string;title:string;score:number;explanation:string;solutions:{id:string;name:string;status:string;requiresReview:boolean}[]}[]}[]};
export type DiscoveryState = {status:'idle'|'loaded'|'error';message:string;result?:DiscoveryResult};
export async function reviewPublicOpportunities(_previous:DiscoveryState):Promise<DiscoveryState>{
  await requireOpportunityAdministrator();
  try { const result=await opportunityRequest<DiscoveryResult>({operation:'client:discovery-review'});
    return {status:'loaded',message:`Reviewed ${result.checked} public notice releases. ${result.candidates.length} potential software-service opportunities for review.`,result};
  } catch { return {status:'error',message:'The official source is currently unavailable or returned an unsupported response. Nothing was saved.'}; }
}
