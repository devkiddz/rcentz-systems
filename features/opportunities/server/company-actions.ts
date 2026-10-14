'use server';
import { revalidatePath } from 'next/cache';
import { opportunityRequest } from '@/server/opportunities/client';

const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const csv = (f: FormData, k: string) => str(f, k).split(',').map(x => x.trim()).filter(Boolean);
const numberOrNull = (f: FormData, k: string) => str(f, k) === '' ? null : Number(str(f, k));
const route = '/admin/opportunities/capabilities';
export async function saveCompanyProfile(form: FormData) {
  await opportunityRequest({ operation: 'company:profile', name: str(form, 'name'), operatingCountry: str(form, 'operatingCountry'), deliveryMode: str(form, 'deliveryMode'), availabilityNote: str(form, 'availabilityNote'), weeklyHours: numberOrNull(form, 'weeklyHours'), concurrentCapacity: numberOrNull(form, 'concurrentCapacity') });
  revalidatePath(route);
}
export async function saveCompanyCapability(form: FormData) {
  await opportunityRequest({ operation: 'company:capability', ...(str(form,'id') ? {id:str(form,'id')} : {}), key: str(form,'key'), name: str(form,'name'), purpose: str(form,'purpose'), serviceId: str(form,'serviceId'), status: str(form,'status'), businessProblems: csv(form,'businessProblems'), possibleWork: csv(form,'possibleWork'), agreementTypes: csv(form,'agreementTypes'), deliveryLimits: csv(form,'deliveryLimits') });
  revalidatePath(route);
}
export async function saveCapabilitySolution(form: FormData) {
  await opportunityRequest({ operation: 'company:solution', ...(str(form,'id') ? {id:str(form,'id')} : {}), capabilityId: str(form,'capabilityId'), key: str(form,'key'), name: str(form,'name'), problem: str(form,'problem'), proposedWorkflow: str(form,'proposedWorkflow'), status: str(form,'status'), intendedUsers: csv(form,'intendedUsers'), deliverables: csv(form,'deliverables'), buyerPhrases: csv(form,'buyerPhrases'), discoveryQuestions: csv(form,'discoveryQuestions'), exclusions: csv(form,'exclusions') });
  revalidatePath(route);
}
