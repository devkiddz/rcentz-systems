'use server';
import { revalidatePath } from 'next/cache';
import { opportunityRequest } from '@/server/opportunities/client';
import { requireOpportunityAdministrator } from '@/server/opportunities/workspace-access';
import { clientStates } from '@/features/opportunities/commercial-types';
export type LeadActionState={status:'idle'|'success'|'error';message:string};
export async function collectCommercialLeads(_previous:LeadActionState):Promise<LeadActionState>{
 void _previous;
 await requireOpportunityAdministrator();
 try{
  const result=await opportunityRequest<{status:string;message:string;added:number;nextEligibleAt?:string}>({operation:'client:collect'});
  if(!result||typeof result.message!=='string'||result.message.length>1000||typeof result.status!=='string')throw Error('Invalid collection result');
  revalidatePath('/admin/opportunities/clients');revalidatePath('/admin/opportunities/clients/discovery');
  return {status:['failed','unavailable','not_configured'].includes(result.status)?'error':'success',message:result.message+(result.nextEligibleAt?' Next eligible run: '+new Date(result.nextEligibleAt).toLocaleString('en-GB',{timeZone:'Africa/Lagos'})+' Lagos.':'')};
 }catch{return {status:'error',message:'Collection could not be completed. Check the API connection and acquisition permissions. Earlier leads remain available.'};}
}
export async function saveCommercialReview(_previous:LeadActionState,form:FormData):Promise<LeadActionState>{
 await requireOpportunityAdministrator();
 const id=form.get('id'),state=form.get('state'),notes=form.get('notes'),updatedAt=form.get('updatedAt');
 if(typeof id!=='string'||!/^[A-Za-z0-9_-]{1,160}$/.test(id)||typeof state!=='string'||!(clientStates as readonly string[]).includes(state)||typeof notes!=='string'||notes.length>6000||typeof updatedAt!=='string')return {status:'error',message:'Review details are invalid.'};
 const confirmedChecks=['source','intent','eligibility','capacity'].filter(k=>form.get(k)==='on');
 if(['QUALIFIED','PURSUING','WON'].includes(state)&&(confirmedChecks.length!==4||notes.trim().length<10))return {status:'error',message:'Before advancing, confirm source, buying intent, eligibility and capacity, and explain your assessment in the notes.'};
 try{
  await opportunityRequest({operation:'client:decision',id,state,notes,updatedAt,confirmedChecks});
  revalidatePath('/admin/opportunities/clients');revalidatePath('/admin/opportunities/clients/'+id);
  return {status:'success',message:'Review saved. No message was sent and no project was created.'};
 }catch{return {status:'error',message:'Review could not be saved. Reload the lead in case it changed, then try again. Your unsaved text remains in this form.'};}
}
