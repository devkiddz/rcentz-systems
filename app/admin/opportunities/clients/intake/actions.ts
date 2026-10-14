'use server';

import { revalidatePath } from 'next/cache';
import { opportunityRequest } from '@/server/opportunities/client';
import { requireOpportunityAdministrator } from '@/server/opportunities/workspace-access';

export type NoticePreview = { sourceApproval: string; canSave: boolean; notice: { sourceName: string; noticeUrl: string; buyer: string; title: string; description: string; deadline: string | null; country: string | null; eligibilityNotes: string; warnings: string[]; requiresHumanReview: boolean } };
export type NoticeFormState = { status: 'idle' | 'preview' | 'saved' | 'error'; message: string; preview?: NoticePreview; savedId?: string };
const get = (data: FormData, key: string) => String(data.get(key) ?? '').trim();

export async function submitManualNotice(_previous: NoticeFormState, form: FormData): Promise<NoticeFormState> {
  await requireOpportunityAdministrator();
  const intent = get(form, 'intent');
  if (intent !== 'preview' && intent !== 'save') return { status: 'error', message: 'Invalid form operation.' };
  const sourceId = get(form, 'sourceId');
  const noticeUrl = get(form, 'noticeUrl');
  const title = get(form, 'title');
  const description = get(form, 'description');
  const buyer = get(form, 'buyer');
  const eligibilityNotes = get(form, 'eligibilityNotes');
  const deadline = get(form, 'deadline');
  const country = get(form, 'country');
  if (!sourceId || !noticeUrl || !title || description.length < 12 || !buyer || eligibilityNotes.length < 10) {
    return { status: 'error', message: 'Select a source and complete the notice URL, buyer, title, description and eligibility notes.' };
  }
  if (noticeUrl.length > 2048 || title.length > 240 || description.length > 4000 || buyer.length > 180 || eligibilityNotes.length > 1500 || country.length > 100) {
    return { status: 'error', message: 'One or more fields exceed the allowed length.' };
  }
  const payload = { sourceId, noticeUrl, title, description, buyer, eligibilityNotes, deadline: deadline || null, country: country || null };
  try {
    // Always preview again immediately before saving: no stale client approval decisions.
    const preview = await opportunityRequest<NoticePreview>({ operation: 'client:notice-preview', ...payload });
    if (intent === 'preview') return { status: 'preview', message: preview.canSave ? 'Preview complete. This source is approved for manual intake.' : 'Preview complete. Source is not approved; saving is blocked.', preview };
    if (!preview.canSave) return { status: 'error', message: 'Source is not approved. Preview is allowed, but saving is blocked.', preview };
    if (get(form, 'confirm') !== 'on') return { status: 'error', message: 'Confirm that you reviewed the original notice before saving.', preview };
    const saved = await opportunityRequest<{ id: string; state: string }>({ operation: 'client:notice-save', ...payload, confirm: 'SAVE-MANUAL-NOTICE' });
    revalidatePath('/admin/opportunities/clients');
    return { status: 'saved', message: 'Notice saved as NEW for human qualification. No collection started.', savedId: saved.id, preview };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Notice could not be processed.';
    return { status: 'error', message: message.slice(0, 500) };
  }
}
