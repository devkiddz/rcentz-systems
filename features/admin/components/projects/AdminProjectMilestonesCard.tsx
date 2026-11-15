'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ChevronDown, Circle, CircleDot, Flag, Pencil, Plus, Save, ShieldCheck } from 'lucide-react';
import type { AdminProject } from '@/features/admin/server/projects/get-admin-project';
import { updateAdminProjectMilestone } from '@/features/admin/server/projects/project-milestone-actions';
import { mutateProjectGovernance } from '@/features/admin/server/projects/project-governance-ui-actions';

type Milestone = AdminProject['milestones'][number];
const field = 'min-h-9 w-full rounded-lg border border-border bg-background px-2.5 py-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-theme-accent';
const button = 'inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-50';
function formatDate(value: Date | string | null) {
  return value ? new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) : 'Not set';
}
function status(value: string) { return value.toLowerCase().replaceAll('_', ' '); }
function value(form: FormData, key: string) { const item = form.get(key); return typeof item === 'string' ? item.trim() : ''; }

function MilestoneRow({ milestone, projectId, index }: { milestone: Milestone; projectId: string; index: number }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [criterionEditor, setCriterionEditor] = useState<string | 'new' | null>(null);
  const [evidence, setEvidence] = useState('');
  const [reviewReason, setReviewReason] = useState('');
  const [error, setError] = useState('');
  const [pending, start] = useTransition();
  const completed = milestone.status === 'COMPLETED';
  const revision = milestone.criteria.reduce((highest, item) => Math.max(highest, item.revision), 0);
  const canApprove = revision > 0 && milestone.criteria.some(item => item.required) && milestone.criteria.every(item => !item.required || item.verified);
  const latestReview = milestone.reviews[0];
  const alreadyApproved = latestReview?.decision === 'APPROVED' && latestReview.criteriaRevision === revision;

  function submitMilestone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = value(form, 'title');
    if (title.length < 3) { setError('Milestone title must contain at least three characters.'); return; }
    setError('');
    start(async () => {
      const result = await updateAdminProjectMilestone(milestone.id, {
        projectId,
        title,
        slug: milestone.slug,
        description: value(form, 'description'),
        purpose: value(form, 'purpose'),
        expectedOutcome: value(form, 'expectedOutcome'),
        status: milestone.status,
        priority: value(form, 'priority'),
        visibility: milestone.visibility,
        progress: milestone.progress,
        sortOrder: milestone.sortOrder,
        startedAt: milestone.startedAt ? new Date(milestone.startedAt).toISOString().slice(0, 10) : '',
        dueDate: value(form, 'dueDate'),
        completionNotes: milestone.completionNotes ?? ''
      });
      if (!result.success) { setError(result.error); return; }
      setEditing(false);
      router.refresh();
    });
  }

  function submitCriterion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = value(data, 'title');
    if (title.length < 3) { setError('Criterion title must contain at least three characters.'); return; }
    const match = milestone.criteria.find(item => item.id === criterionEditor);
    setError('');
    start(async () => {
      const payload = { title, description: value(data, 'description') || null, required: data.get('required') === 'on', sortOrder: match?.sortOrder ?? milestone.criteria.length };
      const result = match
        ? await mutateProjectGovernance({ operation: 'criterion:update', projectId, milestoneId: milestone.id, criterionId: match.id, criterion: payload })
        : await mutateProjectGovernance({ operation: 'criterion:create', projectId, milestoneId: milestone.id, criterion: payload });
      if (!result.success) { setError(result.error ?? 'Criterion update rejected.'); return; }
      setCriterionEditor(null);
      router.refresh();
    });
  }

  function verifyCriterion(criterionId: string, verified: boolean) {
    if (!verified && evidence.trim().length < 10) { setError('Enter at least 10 characters of evidence before verification.'); return; }
    setError('');
    start(async () => {
      const result = await mutateProjectGovernance({
        operation: 'criterion:verify', projectId, milestoneId: milestone.id,
        criterionId, verified: !verified,
        evidence: verified ? null : { description: evidence.trim() }
      });
      if (!result.success) { setError(result.error ?? 'Verification rejected.'); return; }
      setEvidence('');
      router.refresh();
    });
  }

  function review(decision: 'APPROVED' | 'REJECTED') {
    setError('');
    if (decision === 'REJECTED' && reviewReason.trim().length < 10) { setError('Provide a reason of at least 10 characters.'); return; }
    start(async () => {
      const result = await mutateProjectGovernance({
        operation: 'milestone:review', projectId, milestoneId: milestone.id,
        decision, expectedRevision: revision, reason: reviewReason.trim()
      });
      if (!result.success) { setError(result.error ?? 'Milestone review rejected.'); return; }
      setReviewReason('');
      router.refresh();
    });
  }

  const tileTone = completed
    ? 'border-emerald-500/35 bg-emerald-500/[0.12] hover:bg-emerald-500/[0.17]'
    : milestone.status === 'IN_PROGRESS'
      ? 'border-blue-500/45 bg-blue-500/[0.12] hover:bg-blue-500/[0.18]'
      : milestone.status === 'REVIEW'
        ? 'border-violet-500/40 bg-violet-500/[0.12] hover:bg-violet-500/[0.18]'
        : milestone.status === 'BLOCKED'
          ? 'border-red-500/40 bg-red-500/[0.11] hover:bg-red-500/[0.16]'
          : 'border-amber-500/30 bg-amber-500/[0.08] hover:bg-amber-500/[0.13]';

  return (
    <details className="group/milestone mx-2 my-2 overflow-hidden rounded-xl border border-border bg-background">
      <summary className={`flex cursor-pointer list-none items-center gap-2.5 rounded-xl border px-3 py-3 text-xs text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-theme-accent [&::-webkit-details-marker]:hidden ${tileTone}`}>

        {completed ? <CheckCircle2 className="size-4 shrink-0 text-emerald-500" aria-hidden="true" /> : milestone.status === 'IN_PROGRESS' ? <CircleDot className="size-4 shrink-0 text-theme-accent" aria-hidden="true" /> : <Circle className="size-4 shrink-0 text-muted" aria-hidden="true" />}
        <span className="min-w-0 flex-1">
          <span className={`block break-words font-medium ${completed ? 'text-muted line-through' : ''}`}>{milestone.title}</span>
          <span className="mt-0.5 block text-[10px] capitalize text-muted">M{String(index + 1).padStart(2, '0')} · {status(milestone.status)} · {milestone.criteria.filter(item => item.verified).length}/{milestone.criteria.length} criteria verified</span>
        </span>
        {milestone.dueDate ? <span className="hidden shrink-0 text-[10px] text-muted sm:block">{formatDate(milestone.dueDate)}</span> : null}
        <ChevronDown className="size-3.5 shrink-0 text-muted transition-transform group-open/milestone:rotate-180" aria-hidden="true" />
      </summary>
      <div className="space-y-3 border-t border-border bg-background px-3 py-3 text-xs">
        {milestone.description ? <p className="whitespace-pre-wrap leading-5 text-muted">{milestone.description}</p> : null}
        {milestone.purpose ? <p><span className="font-semibold">Purpose:</span> <span className="text-muted">{milestone.purpose}</span></p> : null}
        {milestone.expectedOutcome ? <p><span className="font-semibold">Outcome:</span> <span className="text-muted">{milestone.expectedOutcome}</span></p> : null}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted"><span>Target: {formatDate(milestone.dueDate)}</span><span>Priority: {status(milestone.priority)}</span><span>Progress: {milestone.progress}%</span></div>
        <div className="space-y-1.5 border-t border-border pt-3">
          <p className="font-semibold text-foreground">Completion criteria</p>
          {milestone.criteria.length === 0 ? <p className="text-muted">No criteria recorded. Add a criterion before requesting approval.</p> : milestone.criteria.map(item => (
            <div key={item.id} className="rounded-lg border border-border bg-surface p-2">
              <div className="flex items-start gap-2">
                {item.verified ? <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" aria-hidden="true" /> : <Circle className="mt-0.5 size-3.5 shrink-0 text-muted" aria-hidden="true" />}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{item.title}{item.required ? <span className="ml-1 text-muted">(required)</span> : null}</p>
                  {item.description ? <p className="mt-1 whitespace-pre-wrap text-muted">{item.description}</p> : null}
                  <p className="mt-1 text-[10px] text-muted">{item.verified ? 'Verified' : 'Not verified'}</p>
                </div>
                <button type="button" disabled={pending} onClick={() => setCriterionEditor(criterionEditor === item.id ? null : item.id)} className={button}>Edit</button>
                <button type="button" disabled={pending} onClick={() => verifyCriterion(item.id, item.verified)} className={button}>{item.verified ? 'Revoke' : 'Verify'}</button>
              </div>
            </div>
          ))}
          <label className="mt-2 block text-muted">Verification evidence (required before marking a criterion verified)
            <input className={field + ' mt-1'} maxLength={1000} value={evidence} onChange={event => setEvidence(event.target.value)} placeholder="Evidence or acceptance notes, 10+ characters" />
          </label>
          <button type="button" disabled={pending} onClick={() => setCriterionEditor(criterionEditor === 'new' ? null : 'new')} className={button}><Plus className="size-3" />Add criterion</button>
        </div>
        {criterionEditor ? (
          <form onSubmit={submitCriterion} key={criterionEditor} className="space-y-2 rounded-lg border border-border bg-surface p-3">
            <p className="font-semibold">{criterionEditor === 'new' ? 'Add completion criterion' : 'Edit completion criterion'}</p>
            <label className="block">Title<input name="title" className={field + ' mt-1'} maxLength={160} required minLength={3} defaultValue={milestone.criteria.find(item => item.id === criterionEditor)?.title ?? ''} /></label>
            <label className="block">Description<textarea name="description" className={field + ' mt-1'} maxLength={2000} rows={2} defaultValue={milestone.criteria.find(item => item.id === criterionEditor)?.description ?? ''} /></label>
            <label className="inline-flex items-center gap-2"><input name="required" type="checkbox" defaultChecked={milestone.criteria.find(item => item.id === criterionEditor)?.required ?? true} />Required</label>
            <div className="flex gap-2"><button disabled={pending} className={button} type="submit"><Save className="size-3" />Save criterion</button><button className={button} type="button" onClick={() => setCriterionEditor(null)}>Cancel</button></div>
          </form>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <span className="text-muted">Review: {latestReview ? `${status(latestReview.decision)} (revision ${latestReview.criteriaRevision})` : 'Not reviewed'}</span>
          <button className={button} type="button" onClick={() => setEditing(current => !current)} disabled={pending}><Pencil className="size-3" />{editing ? 'Close editor' : 'Edit milestone'}</button>
        </div>
        {editing ? (
          <form onSubmit={submitMilestone} className="grid gap-2 rounded-lg border border-border bg-surface p-3">
            <label>Title<input name="title" className={field + ' mt-1'} defaultValue={milestone.title} maxLength={160} minLength={3} required /></label>
            <label>Description<textarea name="description" className={field + ' mt-1'} rows={2} maxLength={3000} defaultValue={milestone.description ?? ''} /></label>
            <label>Purpose<textarea name="purpose" className={field + ' mt-1'} rows={2} defaultValue={milestone.purpose ?? ''} /></label>
            <label>Expected outcome<textarea name="expectedOutcome" className={field + ' mt-1'} rows={2} defaultValue={milestone.expectedOutcome ?? ''} /></label>
            <label>Due date<input name="dueDate" type="date" className={field + ' mt-1'} defaultValue={milestone.dueDate ? new Date(milestone.dueDate).toISOString().slice(0, 10) : ''} /></label>
            <label>Priority<select name="priority" className={field + ' mt-1'} defaultValue={milestone.priority}><option value="LOW">Low</option><option value="NORMAL">Normal</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select></label>
            <p className="text-muted">Completion status and progress remain governed by verified criteria and authorized reviews.</p>
            <button type="submit" className={button} disabled={pending}><Save className="size-3" />Save changes</button>
          </form>
        ) : null}
        <div className="space-y-2 border-t border-border pt-3">
          <p className="flex items-center gap-2 font-semibold"><ShieldCheck className="size-3.5 text-theme-accent" />Authorized completion review</p>
          <p className="text-muted">Approval requires all required criteria verified and is recorded by Rcentz governance. It cannot be set by a GitHub commit.</p>
          <textarea className={field} rows={2} maxLength={2000} value={reviewReason} onChange={event => setReviewReason(event.target.value)} placeholder="Review note / rejection reason" aria-label="Milestone review note" />
          <div className="flex flex-wrap gap-2"><button type="button" disabled={pending || !canApprove || alreadyApproved} onClick={() => review('APPROVED')} className={button}>Approve completion</button><button type="button" disabled={pending || revision === 0 || reviewReason.trim().length < 10} onClick={() => review('REJECTED')} className={button}>Reject</button></div>
          {milestone.reviews.length ? <p className="text-muted">Recent: {milestone.reviews.map(item => `${status(item.decision)} ${formatDate(item.createdAt)}`).join(' · ')}</p> : null}
        </div>
        {error ? <p role="alert" className="rounded-lg border border-red-500/30 p-2 text-red-500">{error}</p> : null}
        {pending ? <p role="status" className="text-muted">Saving changes…</p> : null}
      </div>
    </details>
  );
}

export function AdminProjectMilestonesCard({ projectId, milestones }: { projectId: string; milestones: Milestone[] }) {
  const visible = milestones.filter(item => item.status !== 'CANCELLED');
  const complete = visible.filter(item => item.status === 'COMPLETED').length;
  return (
    <article id="project-milestones" aria-label="Registered project milestones" className="flex h-[320px] min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface">
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground"><Flag className="size-4 text-theme-accent" aria-hidden="true" /> Milestones</h2>
        <span className="text-[11px] text-muted">{complete} of {visible.length} completed</span>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
        {visible.length ? visible.map((item, index) => <MilestoneRow key={item.id} milestone={item} projectId={projectId} index={index} />) : (
          <p className="p-5 text-xs leading-5 text-muted">No project milestones registered yet. Add a milestone in advanced milestone management below.</p>
        )}
      </div>
      <div className="flex shrink-0 items-center justify-between border-t border-border px-4 py-3 text-xs">
        <span className="text-muted">Database records · Governed completion</span>
        <a href="#advanced-milestone-management" className="font-medium text-foreground hover:underline">Manage milestones</a>
      </div>
    </article>
  );
}
