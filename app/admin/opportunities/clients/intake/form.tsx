'use client';

import { useActionState } from 'react';
import { submitManualNotice, type NoticeFormState } from './actions';

type Source = { id: string; name: string; homepage: string; approval: string; method: string };
const initial: NoticeFormState = { status: 'idle', message: '' };
const field = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground';
export function ManualNoticeForm({ sources }: { sources: Source[] }) {
  const [state, action, pending] = useActionState(submitManualNotice, initial);
  return <section className="rounded-xl border border-border bg-card p-5">
    <form action={action} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm sm:col-span-2"><span className="font-medium">Registered source</span><select name="sourceId" required className={field} defaultValue=""><option value="" disabled>Select the original source</option>{sources.map(s => <option key={s.id} value={s.id}>{s.name} · {s.approval.toLowerCase()} · {s.method.toLowerCase().replaceAll('_', ' ')}</option>)}</select><span className="block text-xs text-muted-foreground">Notice URL must use the same host as the selected source homepage.</span></label>
        <label className="space-y-2 text-sm sm:col-span-2">Original notice URL (HTTPS)<input name="noticeUrl" type="url" required maxLength={2048} placeholder="https://official-source.example/notices/123" className={field}/></label>
        <label className="space-y-2 text-sm">Buyer / issuing organization<input name="buyer" required maxLength={180} className={field}/></label>
        <label className="space-y-2 text-sm">Notice / project title<input name="title" required maxLength={240} className={field}/></label>
        <label className="space-y-2 text-sm sm:col-span-2">Project requirements<textarea name="description" required minLength={12} maxLength={4000} rows={5} className={field} placeholder="Describe only what the public notice actually requests."/></label>
        <label className="space-y-2 text-sm">Published deadline (if confirmed)<input name="deadline" type="date" className={field}/></label>
        <label className="space-y-2 text-sm">Country (if known)<input name="country" maxLength={100} className={field}/></label>
        <label className="space-y-2 text-sm sm:col-span-2">Eligibility / registration requirements and uncertainties<textarea name="eligibilityNotes" required minLength={10} maxLength={1500} rows={4} className={field} placeholder="For example: supplier registration requirements not yet verified; Rcentz eligibility requires review."/></label>
      </div>
      <div className="flex flex-wrap items-center gap-3"><button type="submit" name="intent" value="preview" disabled={pending || !sources.length} className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50">{pending ? 'Checking…' : 'Review opportunity'}</button>
      <label className="flex items-start gap-2 text-sm text-muted-foreground"><input type="checkbox" name="confirm" className="mt-1"/> I reviewed the original notice and accept that this is not an eligibility decision.</label>
      <button type="submit" name="intent" value="save" disabled={pending || !sources.some(s => s.approval === 'APPROVED')} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">Add to acquisition pipeline</button></div>
      {sources.every(s => s.approval !== 'APPROVED') ? <p className="text-xs text-muted-foreground">No approved sources are available. You can review a draft source, but cannot add an opportunity yet.</p> : null}
    </form>
    {state.message ? <div role="status" className="mt-5 space-y-3 rounded-lg border border-border bg-muted/30 p-4 text-sm"><p className="font-medium">{state.status === 'error' ? 'Opportunity needs attention' : state.status === 'saved' ? 'Added for qualification' : 'Opportunity review'}</p><p>{state.message}</p>
      {state.preview ? <div className="space-y-2 text-muted-foreground"><p>Source: {state.preview.notice.sourceName} · Approval: {state.preview.sourceApproval}</p><p>Buyer: {state.preview.notice.buyer} · Title: {state.preview.notice.title}</p><p className="break-all">Original: {state.preview.notice.noticeUrl}</p>{state.preview.notice.warnings?.length ? <ul className="list-inside list-disc">{state.preview.notice.warnings.map((w,i) => <li key={i}>{w}</li>)}</ul> : null}<p>Human qualification and eligibility checks remain required.</p></div> : null}
      {state.savedId ? <p className="text-muted-foreground">Prospect ID: {state.savedId}</p> : null}</div> : null}
  </section>;
}
