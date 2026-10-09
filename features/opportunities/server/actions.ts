'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { opportunityRequest } from '@/server/opportunities/client';
export async function saveProfile(form: FormData) {
 await opportunityRequest({ operation: 'profile', skills: String(form.get('skills') || '').split(',').map(s => s.trim()).filter(Boolean), experienceYears: Number(form.get('experienceYears')), enabled: form.get('enabled') === 'on' });
 revalidatePath('/admin/opportunities');
}
export async function collectNow() {
 const result = await opportunityRequest<{status: string}>({ operation: 'collect' });
 revalidatePath('/admin/opportunities');
 redirect('/admin/opportunities?run=' + result.status);
}
export async function updateOpportunity(form: FormData) {
 await opportunityRequest({ operation: 'decision', id: String(form.get('id') || ''), status: String(form.get('status') || ''), notes: String(form.get('notes') || '') });
 revalidatePath('/admin/opportunities');
}
