'use client';

import { useActionState, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, CalendarDays, ClipboardCheck, FolderKanban,
  ListChecks, Plus, Save, Trash2, UserRound
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createAdminProject, type CreateAdminProjectState } from '@/features/admin/server/projects/create-admin-project';
import {
  adminProjectCurrencyOptions,
  adminProjectTypeOptions,
  adminProjectVisibilityOptions
} from '@/features/admin/types/projects';

type ClientOption = { id: string; name: string; email: string; companyName: string | null };
type Props = { clients: ClientOption[] };
type ProjectDraft = {
  name: string; slug: string; clientId: string; type: string;
  description: string; purpose: string; vision: string; expectedOutcome: string;
  visibility: string; budget: string; currency: string; startedAt: string; expectedEndAt: string;
};
type MilestoneDraft = {
  key: number; title: string; description: string; purpose: string; expectedOutcome: string;
  priority: string; visibility: string; dueDate: string; criteriaText: string;
};
const steps = ['Project identity', 'Project definition', 'Milestone plan', 'Review & create'] as const;
const initialDraft: ProjectDraft = {
  name: '', slug: '', clientId: '', type: 'WEB_APP', description: '', purpose: '', vision: '',
  expectedOutcome: '', visibility: 'PRIVATE', budget: '', currency: 'NGN', startedAt: '', expectedEndAt: ''
};
const selectClass = 'h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-theme-accent/20';
const buttonClass = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold hover:bg-surface-muted disabled:opacity-50';
const nextClass = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-foreground px-5 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50';

function toSlug(value: string) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120);
}
function newMilestone(key: number): MilestoneDraft {
  return { key, title: '', description: '', purpose: '', expectedOutcome: '', priority: 'NORMAL',
    visibility: 'CLIENT', dueDate: '', criteriaText: '' };
}
function criteriaLines(value: string) {
  return value.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
}
function Field({ label, note, children, required = false }: {
  label: string; note?: string; children: ReactNode; required?: boolean;
}) {
  return <label className="block min-w-0 space-y-2">
    <span className="block text-xs font-semibold text-foreground">{label} {required ? <span className="text-theme-accent">*</span> : null}</span>
    {children}
    {note ? <span className="block text-xs leading-5 text-muted">{note}</span> : null}
  </label>;
}
function Group({ icon: Icon, title, hint, children }: {
  icon: typeof FolderKanban; title: string; hint: string; children: ReactNode;
}) {
  return <section className="overflow-hidden rounded-2xl border border-border bg-surface">
    <header className="flex items-start gap-3 border-b border-border bg-surface-raised px-5 py-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background">
        <Icon className="size-4 text-theme-accent" aria-hidden="true" />
      </span>
      <div><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-xs leading-5 text-muted">{hint}</p></div>
    </header>
    <div className="space-y-5 p-5">{children}</div>
  </section>;
}
function Summary({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><dt className="text-xs font-medium text-muted">{label}</dt>
    <dd className="mt-1 whitespace-pre-wrap break-words text-sm font-medium">{value || 'Not specified'}</dd></div>;
}

export function AdminProjectBuilder({ clients }: Props) {
  const [state, action, pending] = useActionState<CreateAdminProjectState, FormData>(
    createAdminProject, { error: null }
  );
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ProjectDraft>(initialDraft);
  const [slugTouched, setSlugTouched] = useState(false);
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([newMilestone(1)]);
  const nextKey = useRef(2);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  function setField<K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]) {
    setDraft(current => ({ ...current, [key]: value }));
    setError('');
  }
  function nameChange(value: string) {
    setDraft(current => ({ ...current, name: value, slug: slugTouched ? current.slug : toSlug(value) }));
    setError('');
  }
  function updateMilestone(key: number, patch: Partial<MilestoneDraft>) {
    setMilestones(items => items.map(item => item.key === key ? { ...item, ...patch } : item));
    setError('');
  }
  function addMilestone() {
    if (milestones.length >= 6) return;
    const key = nextKey.current++;
    setMilestones(items => [...items, newMilestone(key)]);
    setError('');
  }
  function validateStep(index: number): string | null {
    if (index === 0) {
      if (draft.name.trim().length < 2 || draft.name.trim().length > 160 || toSlug(draft.slug).length < 2) {
        return 'Enter a valid project name and slug before continuing.';
      }
    }
    if (index === 1) {
      if (draft.description.trim().length < 20) return 'Describe the agreed scope in at least 20 characters.';
      if ([draft.description, draft.purpose, draft.vision, draft.expectedOutcome].some(s => s.length > 5000)) {
        return 'Project descriptions must be 5,000 characters or less.';
      }
      if (draft.budget && !/^\d{1,12}(\.\d{1,2})?$/.test(draft.budget)) {
        return 'Enter a valid agreed budget, or leave it blank.';
      }
      if (draft.startedAt && draft.expectedEndAt && draft.expectedEndAt < draft.startedAt) {
        return 'The expected completion date must not precede the start date.';
      }
    }
    if (index === 2) {
      if (milestones.length < 1 || milestones.length > 6) return 'Add 1–6 initial milestones.';
      const titles = new Set<string>();
      for (let i = 0; i < milestones.length; i += 1) {
        const m = milestones[i];
        const slug = toSlug(m.title);
        if (m.title.trim().length < 3 || slug.length < 2 || titles.has(slug)) {
          return `Milestone ${i + 1} needs a unique, descriptive title.`;
        }
        titles.add(slug);
        const criteria = criteriaLines(m.criteriaText);
        if (criteria.length < 1 || criteria.length > 6 || criteria.some(c => c.length < 3 || c.length > 160)) {
          return `Milestone ${i + 1} needs 1–6 completion criteria, one per line.`;
        }
        if (new Set(criteria.map(c => c.toLowerCase())).size !== criteria.length) {
          return `Milestone ${i + 1} has duplicate criteria.`;
        }
      }
    }
    return null;
  }
  function nextStep() {
    const problem = validateStep(step);
    if (problem) { setError(problem); return; }
    setError('');
    setStep(current => Math.min(3, current + 1));
  }
  const milestonesJson = JSON.stringify(milestones.map(milestone => ({
    title: milestone.title, description: milestone.description, purpose: milestone.purpose,
    expectedOutcome: milestone.expectedOutcome, priority: milestone.priority,
    visibility: milestone.visibility, dueDate: milestone.dueDate,
    criteria: criteriaLines(milestone.criteriaText)
  })));
  const selectedClient = clients.find(client => client.id === draft.clientId);

  return <form action={action}>
    <main className="rcentz-dashboard-frame px-3 py-6 sm:px-5 lg:px-6">
      <div className="rcentz-dashboard-inner mx-auto w-full max-w-[1600px] space-y-6">
        <Link href="/admin/projects" className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to projects
        </Link>
        <header className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-theme-accent">Project Management / Registration</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Register a new project</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted">
            Define the agreed project scope and its initial milestones. Customer onboarding remains a request,
            while this registration establishes the official delivery workspace.
          </p>
        </header>

        <nav aria-label="Project registration steps" className="grid gap-2 sm:grid-cols-4">
          {steps.map((label, index) => <button key={label} type="button"
            disabled={index > step} onClick={() => { setStep(index); setError(''); }}
            aria-current={step === index ? 'step' : undefined}
            className={`rounded-xl border px-3 py-3 text-left text-xs font-semibold transition-colors ${
              index === step ? 'border-theme-accent bg-theme-accent-faint text-foreground' :
                'border-border bg-surface text-muted hover:text-foreground'} disabled:cursor-not-allowed disabled:opacity-60`}>
            <span className="mr-2 font-mono">{String(index + 1).padStart(2, '0')}</span>{label}
          </button>)}
        </nav>

        {(error || state.error) ? <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error || state.error}
        </p> : null}

        {/* Data is submitted only on the final step; hidden values preserve all previous steps. */}
        {(Object.keys(draft) as (keyof ProjectDraft)[]).map(key => <input key={key} type="hidden" name={key} value={draft[key]} />)}
        <input type="hidden" name="milestonesJson" value={milestonesJson} />

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-5">
            {step === 0 ? <Group icon={FolderKanban} title="Step 1 — Project identity"
              hint="Give the project its official identity and assign the right customer.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Project name" required><Input value={draft.name} onChange={e => nameChange(e.target.value)} maxLength={160} placeholder="Courier Tracking Portal" /></Field>
                <Field label="Project slug" required note="A unique technical URL identifier."><Input value={draft.slug} onChange={e => { setSlugTouched(true); setField('slug', toSlug(e.target.value)); }} maxLength={120} /></Field>
                <Field label="Client"><select className={selectClass} value={draft.clientId} onChange={e => setField('clientId', e.target.value)}>
                  <option value="">Internal project / No client assigned</option>
                  {clients.map(client => <option value={client.id} key={client.id}>{client.companyName ? `${client.companyName} — ${client.name}` : client.name}</option>)}
                </select></Field>
                <Field label="Project type" required><select className={selectClass} value={draft.type} onChange={e => setField('type', e.target.value)}>
                  {adminProjectTypeOptions.map(option => <option value={option.value} key={option.value}>{option.label}</option>)}
                </select></Field>
              </div>
            </Group> : null}

            {step === 1 ? <><Group icon={UserRound} title="Step 2 — Project definition"
              hint="Document the agreed scope and what successful delivery means.">
              <Field label="Agreed scope / Project description" required
                note="Be precise about the work Rcentz has agreed to deliver, not just the customer's initial request.">
                <Textarea value={draft.description} onChange={e => setField('description', e.target.value)} rows={6} maxLength={5000} placeholder="Build a web portal with unique parcel tracking, manual location updates and customer tracking history..." />
              </Field>
              <div className="grid gap-4 lg:grid-cols-2">
                <Field label="Purpose"><Textarea value={draft.purpose} onChange={e => setField('purpose', e.target.value)} rows={4} maxLength={5000} placeholder="Why the project exists" /></Field>
                <Field label="Vision"><Textarea value={draft.vision} onChange={e => setField('vision', e.target.value)} rows={4} maxLength={5000} placeholder="What the solution should become" /></Field>
              </div>
              <Field label="Expected outcome"><Textarea value={draft.expectedOutcome} onChange={e => setField('expectedOutcome', e.target.value)} rows={4} maxLength={5000} placeholder="What users and the business should achieve" /></Field>
            </Group>
            <Group icon={CalendarDays} title="Delivery terms" hint="Use agreed values. Dates and budget can remain unset until confirmed.">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Agreed budget"><Input type="number" min={0} step="0.01" value={draft.budget} onChange={e => setField('budget', e.target.value)} placeholder="Leave blank if unagreed" /></Field>
                <Field label="Currency"><select className={selectClass} value={draft.currency} onChange={e => setField('currency', e.target.value)}>
                  {adminProjectCurrencyOptions.map(currency => <option key={currency} value={currency}>{currency}</option>)}
                </select></Field>
                <Field label="Visibility"><select className={selectClass} value={draft.visibility} onChange={e => setField('visibility', e.target.value)}>
                  {adminProjectVisibilityOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select></Field>
                <Field label="Start date"><Input type="date" value={draft.startedAt} onChange={e => setField('startedAt', e.target.value)} /></Field>
                <Field label="Expected completion"><Input type="date" value={draft.expectedEndAt} onChange={e => setField('expectedEndAt', e.target.value)} /></Field>
              </div>
              <p className="text-xs leading-5 text-muted">New projects start in Planning with 0% progress. Completion is governed by milestone criteria, not GitHub commits.</p>
            </Group></> : null}

            {step === 2 ? <Group icon={ListChecks} title="Step 3 — Initial milestones"
              hint="Prepare 1–6 milestones and measurable completion criteria. All start as Planned at 0%.">
              <div className="space-y-5">
                {milestones.map((milestone, index) => <section key={milestone.key} className="space-y-4 rounded-xl border border-border bg-background p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">Milestone {String(index + 1).padStart(2, '0')}</h3>
                    {milestones.length > 1 ? <button type="button" className={buttonClass} onClick={() => setMilestones(items => items.filter(item => item.key !== milestone.key))}>
                      <Trash2 className="size-4" aria-hidden="true" /> Remove
                    </button> : null}
                  </div>
                  <Field label="Milestone title" required><Input value={milestone.title} maxLength={160} placeholder="Secure accounts and permissions"
                    onChange={e => updateMilestone(milestone.key, { title: e.target.value })} /></Field>
                  <Field label="Description / Work scope"><Textarea rows={3} maxLength={2000} value={milestone.description} onChange={e => updateMilestone(milestone.key, { description: e.target.value })} /></Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Purpose"><Textarea rows={3} maxLength={2000} value={milestone.purpose} onChange={e => updateMilestone(milestone.key, { purpose: e.target.value })} /></Field>
                    <Field label="Expected outcome"><Textarea rows={3} maxLength={2000} value={milestone.expectedOutcome} onChange={e => updateMilestone(milestone.key, { expectedOutcome: e.target.value })} /></Field>
                  </div>
                  <Field label="Completion criteria — one per line" required
                    note="Each criterion must be independently verifiable. 1–6 criteria per milestone.">
                    <Textarea rows={5} maxLength={1200} value={milestone.criteriaText} onChange={e => updateMilestone(milestone.key, { criteriaText: e.target.value })}
                      placeholder={'Customer login tested\nPermissions tested for each role\nPassword recovery confirmed'} />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Priority"><select value={milestone.priority} onChange={e => updateMilestone(milestone.key, { priority: e.target.value })} className={selectClass}>
                      {['LOW', 'NORMAL', 'HIGH', 'CRITICAL'].map(value => <option key={value} value={value}>{value.toLowerCase()}</option>)}
                    </select></Field>
                    <Field label="Visibility"><select value={milestone.visibility} onChange={e => updateMilestone(milestone.key, { visibility: e.target.value })} className={selectClass}>
                      {['INTERNAL', 'CLIENT', 'PUBLIC'].map(value => <option key={value} value={value}>{value.toLowerCase()}</option>)}
                    </select></Field>
                    <Field label="Target date"><Input type="date" value={milestone.dueDate} onChange={e => updateMilestone(milestone.key, { dueDate: e.target.value })} /></Field>
                  </div>
                </section>)}
              </div>
              <button type="button" onClick={addMilestone} disabled={milestones.length >= 6} className={buttonClass}>
                <Plus className="size-4" aria-hidden="true" /> Add another milestone ({milestones.length}/6)
              </button>
            </Group> : null}

            {step === 3 ? <><Group icon={ClipboardCheck} title="Step 4 — Review registration"
              hint="Check the agreed scope, customer, delivery terms, milestones and completion criteria.">
              <dl className="grid gap-5 sm:grid-cols-2">
                <Summary label="Project" value={draft.name} />
                <Summary label="Project type" value={draft.type} />
                <Summary label="Client" value={selectedClient ? `${selectedClient.name} (${selectedClient.email})` : 'Internal / Unassigned'} />
                <Summary label="Slug" value={draft.slug} />
                <Summary label="Budget" value={draft.budget ? `${draft.currency} ${draft.budget}` : 'Not agreed'} />
                <Summary label="Schedule" value={`${draft.startedAt || 'Not set'} → ${draft.expectedEndAt || 'Not set'}`} />
              </dl>
              <div className="border-t border-border pt-4"><Summary label="Agreed scope" value={draft.description} /></div>
              <dl className="grid gap-4 border-t border-border pt-4 lg:grid-cols-3">
                <Summary label="Purpose" value={draft.purpose} />
                <Summary label="Vision" value={draft.vision} />
                <Summary label="Expected outcome" value={draft.expectedOutcome} />
              </dl>
            </Group>
            <Group icon={ListChecks} title={`${milestones.length} initial milestone${milestones.length === 1 ? '' : 's'}`}
              hint="All begin Planned at 0%. GitHub activity is independent evidence, not official progress.">
              {milestones.map((milestone, index) => <div key={milestone.key} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-semibold">{index + 1}. {milestone.title}</h3>
                  <span className="text-xs text-muted">Planned · {milestone.visibility.toLowerCase()}</span></div>
                {milestone.expectedOutcome ? <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-muted">{milestone.expectedOutcome}</p> : null}
                <p className="mt-3 text-xs font-semibold">Completion criteria</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-xs leading-5 text-muted">
                  {criteriaLines(milestone.criteriaText).map(criterion => <li key={criterion}>{criterion}</li>)}
                </ul>
              </div>)}
            </Group>
            <label className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 text-sm leading-6">
              <input type="checkbox" className="mt-1 size-4" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />
              I have checked the project scope and milestones. Registration will create the delivery workspace and notify the assigned client.
            </label></> : null}

            <footer className="flex items-center justify-between gap-3 border-t border-border pt-5">
              <button type="button" disabled={step === 0 || pending} onClick={() => { setStep(s => Math.max(0, s - 1)); setError(''); }} className={buttonClass}>
                <ArrowLeft className="size-4" aria-hidden="true" /> Back
              </button>
              {step < 3 ? <button type="button" onClick={nextStep} className={nextClass}>Continue <ArrowRight className="size-4" aria-hidden="true" /></button>
                : <button type="submit" className={nextClass} disabled={!confirmed || pending}>
                  <Save className="size-4" aria-hidden="true" /> {pending ? 'Registering...' : 'Register project and milestones'}
                </button>}
            </footer>
          </div>

          <aside className="min-w-0 space-y-4 xl:sticky xl:top-24">
            <section className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-theme-accent">Registration progress</p>
              <p className="mt-2 text-lg font-semibold">Step {step + 1} of {steps.length}</p>
              <p className="mt-1 text-xs leading-5 text-muted">{steps[step]}</p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-muted"><div className="h-full bg-theme-accent transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
              <div className="mt-5 space-y-3 border-t border-border pt-4 text-xs">
                <Summary label="Project" value={draft.name || 'Not named yet'} />
                <Summary label="Client" value={selectedClient?.name || 'Internal / Unassigned'} />
                <Summary label="Initial milestones" value={String(milestones.length)} />
                <Summary label="Total completion criteria" value={String(milestones.reduce((total, m) => total + criteriaLines(m.criteriaText).length, 0))} />
              </div>
            </section>
            <section className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="text-sm font-semibold">Project registration rules</h2>
              <p className="mt-3 text-xs leading-6 text-muted">
                Projects start in Planning with 0% progress. Milestones and their required criteria are saved together with the project. A new project is not linked to GitHub automatically.
              </p>
              <p className="mt-3 border-t border-border pt-3 text-xs leading-6 text-muted">
                Later, the milestone governance engine will control verification and completion. GitHub remains an independent activity source.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  </form>;
}
