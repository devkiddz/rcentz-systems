'use client';
import { DeliveryProgress } from '@/components/ui/DeliveryProgress';

import { useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { CheckCircle2, CircleDot, Pencil, Plus, Save, Trash2, X } from 'lucide-react';

import { Input } from '@/components/ui/input';

import { Textarea } from '@/components/ui/textarea';

import {
  createAdminProjectMilestone,
  deleteAdminProjectMilestone,
  updateAdminProjectMilestone,
  type ProjectMilestoneMutationInput
} from '@/features/admin/server/projects/project-milestone-actions';

import {
  adminProjectMilestonePriorityOptions,
  adminProjectMilestoneStatusOptions,
  adminProjectMilestoneVisibilityOptions
} from '@/features/admin/types/project-milestones';

type MilestoneItem = {
  id: string;

  title: string;
  slug: string;

  description: string | null;
  purpose: string | null;
  expectedOutcome: string | null;

  status: string;
  priority: string;
  visibility: string;

  progress: number;
  sortOrder: number;

  startedAt: string | null;
  dueDate: string | null;
  completedAt: string | null;

  completionNotes: string | null;

  counts: {
    deliverables: number;
    features: number;
    processes: number;
    files: number;
  };
};

type AdminProjectMilestoneManagerProps = {
  projectId: string;
  projectName: string;
  milestones: MilestoneItem[];
};

type EditorState =
  | {
      mode: 'create';
    }
  | {
      mode: 'edit';
      milestone: MilestoneItem;
    }
  | null;

const selectClassName =
  'flex h-9 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground outline-none transition-colors focus:border-foreground/30 focus:ring-2 focus:ring-theme-accent/20';

function humanize(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Not set';
  }

  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value));
}

function getText(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === 'string' ? value : '';
}

function getStatusClass(status: string) {
  switch (status) {
    case 'COMPLETED':
    case 'IN_PROGRESS':
      return 'bg-theme-accent';

    case 'REVIEW':
      return 'bg-[var(--chart-warning)]';

    case 'BLOCKED':
      return 'bg-[var(--chart-danger)]';

    case 'CANCELLED':
      return 'bg-muted';

    default:
      return 'bg-muted/50';
  }
}

export function AdminProjectMilestoneManager({
  projectId,
  projectName,
  milestones
}: AdminProjectMilestoneManagerProps) {
  const router = useRouter();

  const [editor, setEditor] = useState<EditorState>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [pending, startTransition] = useTransition();

  const completed = milestones.filter(milestone => milestone.status === 'COMPLETED').length;

  function handleDelete(milestone: MilestoneItem) {
    setError(null);

    startTransition(async () => {
      const result = await deleteAdminProjectMilestone(projectId, milestone.id);

      if (!result.success) {
        setError(result.error);

        setDeletingId(null);

        return;
      }

      setDeletingId(null);

      router.refresh();
    });
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface">
      <header className="border-b border-border bg-surface-raised px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CircleDot className="size-4 text-theme-accent" />

              <h2 className="text-sm font-semibold text-foreground">Milestone management</h2>
            </div>

            <p className="mt-1 text-xs leading-4 text-muted">
              {completed} of {milestones.length} completed for {projectName}.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setError(null);

              setEditor({
                mode: 'create'
              });
            }}
            className="inline-flex h-9 w-fit cursor-pointer items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-xs font-semibold text-background transition-opacity hover:opacity-90">
            <Plus className="size-3.5" />
            Add milestone
          </button>
        </div>
      </header>

      {error ? (
        <div className="border-b border-red-500/20 bg-red-500/5 px-5 py-3 text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : null}

      {editor ? (
        <div className="border-b border-border bg-background/50 p-4 sm:p-5">
          <MilestoneForm
            key={editor.mode === 'create' ? 'create' : editor.milestone.id}
            projectId={projectId}
            milestone={editor.mode === 'edit' ? editor.milestone : null}
            pending={pending}
            onCancel={() => {
              setEditor(null);
              setError(null);
            }}
            onSave={input => {
              setError(null);

              startTransition(async () => {
                const result =
                  editor.mode === 'create'
                    ? await createAdminProjectMilestone(input)
                    : await updateAdminProjectMilestone(editor.milestone.id, input);

                if (!result.success) {
                  setError(result.error);

                  return;
                }

                setEditor(null);

                router.refresh();
              });
            }}
          />
        </div>
      ) : null}

      {milestones.length > 0 ? (
        <div className="divide-y divide-border">
          {milestones.map((milestone, index) => {
            const canDelete = milestone.status === 'PLANNED' && milestone.visibility === 'INTERNAL';

            return (
              <article key={milestone.id} className="px-5 py-5 sm:px-6">
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs uppercase tracking-[0.1em] text-muted">
                        M{String(index + 1).padStart(2, '0')}
                      </span>

                      <span
                        aria-hidden="true"
                        className={['size-1.5 rounded-full', getStatusClass(milestone.status)].join(' ')}
                      />

                      <span className="text-xs text-muted">{humanize(milestone.status)}</span>

                      <span className="text-xs text-muted">·</span>

                      <span className="text-xs text-muted">{humanize(milestone.priority)}</span>

                      <span className="text-xs text-muted">·</span>

                      <span className="text-xs text-muted">{humanize(milestone.visibility)}</span>
                    </div>

                    <h3 className="mt-2 text-sm font-semibold tracking-[-0.02em] text-foreground">
                      {milestone.title}
                    </h3>

                    {milestone.description ? (
                      <p className="mt-1.5 line-clamp-2 max-w-2xl text-xs leading-5 text-muted">
                        {milestone.description}
                      </p>
                    ) : null}

                    <DeliveryProgress value={milestone.progress} label="Milestone progress" />
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex flex-wrap gap-5">
                      <MilestoneStat label="Progress" value={`${milestone.progress}%`} />

                      <MilestoneStat label="Target" value={formatDate(milestone.dueDate)} />

                      <MilestoneStat label="Deliverables" value={String(milestone.counts.deliverables)} />

                      <MilestoneStat label="Features" value={String(milestone.counts.features)} />
                    </div>

                    <div className="flex items-center gap-2 lg:border-l lg:border-border lg:pl-4">
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);

                          setEditor({
                            mode: 'edit',
                            milestone
                          });
                        }}
                        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-background text-muted transition-colors hover:text-foreground"
                        aria-label={`Edit ${milestone.title}`}>
                        <Pencil className="size-3.5" />
                      </button>

                      {deletingId === milestone.id ? (
                        <>
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => {
                              handleDelete(milestone);
                            }}
                            className="inline-flex h-8 cursor-pointer items-center justify-center rounded-lg bg-red-600 px-3 text-xs font-semibold text-white disabled:opacity-50">
                            Confirm delete
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeletingId(null);
                            }}
                            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-background text-muted">
                            <X className="size-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          disabled={!canDelete || pending}
                          title={
                            canDelete
                              ? 'Delete this unused internal milestone'
                              : 'Only unused internal planned milestones can be permanently deleted.'
                          }
                          onClick={() => {
                            setDeletingId(milestone.id);
                          }}
                          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-background text-muted transition-colors hover:border-red-500/30 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30">
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="px-6 py-12 text-center">
          <CheckCircle2 className="mx-auto size-6 text-muted" />

          <p className="mt-3 text-sm font-semibold text-foreground">No milestones yet</p>

          <p className="mt-1 text-xs text-muted">Create the first delivery milestone for this project.</p>
        </div>
      )}
    </section>
  );
}

function MilestoneForm({
  projectId,
  milestone,
  pending,
  onCancel,
  onSave
}: {
  projectId: string;
  milestone: MilestoneItem | null;
  pending: boolean;
  onCancel: () => void;
  onSave: (input: ProjectMilestoneMutationInput) => void;
}) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    onSave({
      projectId,

      title: getText(formData, 'title'),

      slug: getText(formData, 'slug'),

      description: getText(formData, 'description'),

      purpose: getText(formData, 'purpose'),

      expectedOutcome: getText(formData, 'expectedOutcome'),

      status: getText(formData, 'status'),

      priority: getText(formData, 'priority'),

      visibility: getText(formData, 'visibility'),

      progress: Number(getText(formData, 'progress')),

      sortOrder: Number(getText(formData, 'sortOrder')),

      startedAt: getText(formData, 'startedAt'),

      dueDate: getText(formData, 'dueDate'),

      completionNotes: getText(formData, 'completionNotes')
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-surface">
      <header className="flex items-center justify-between gap-4 border-b border-border bg-surface-raised px-4 py-4 sm:px-5">
        <div>
          <p className="text-xs font-semibold text-foreground">
            {milestone ? 'Edit milestone' : 'Create milestone'}
          </p>

          <p className="mt-1 text-xs text-muted">
            Delivery state and client visibility are controlled here.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-background text-muted transition-colors hover:text-foreground">
          <X className="size-3.5" />
        </button>
      </header>

      <div className="space-y-5 p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" required>
            <Input
              name="title"
              required
              maxLength={160}
              defaultValue={milestone?.title ?? ''}
              placeholder="Discovery and planning"
            />
          </Field>

          <Field label="Slug">
            <Input
              name="slug"
              maxLength={120}
              defaultValue={milestone?.slug ?? ''}
              placeholder="Generated from title if empty"
            />
          </Field>

          <Field label="Status" required>
            <select
              name="status"
              required
              defaultValue={milestone?.status ?? 'PLANNED'}
              className={selectClassName}>
              {adminProjectMilestoneStatusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Priority" required>
            <select
              name="priority"
              required
              defaultValue={milestone?.priority ?? 'NORMAL'}
              className={selectClassName}>
              {adminProjectMilestonePriorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Visibility" required>
            <select
              name="visibility"
              required
              defaultValue={milestone?.visibility ?? 'CLIENT'}
              className={selectClassName}>
              {adminProjectMilestoneVisibilityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Progress" required>
            <Input
              name="progress"
              type="number"
              min={0}
              max={100}
              step={1}
              required
              defaultValue={milestone?.progress ?? 0}
            />
          </Field>

          <Field label="Sort order">
            <Input
              name="sortOrder"
              type="number"
              min={0}
              max={9999}
              step={1}
              defaultValue={milestone?.sortOrder ?? 0}
            />
          </Field>
        </div>

        <Field label="Description">
          <Textarea
            name="description"
            rows={4}
            maxLength={5000}
            defaultValue={milestone?.description ?? ''}
          />
        </Field>

        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Purpose">
            <Textarea name="purpose" rows={4} maxLength={5000} defaultValue={milestone?.purpose ?? ''} />
          </Field>

          <Field label="Expected outcome">
            <Textarea
              name="expectedOutcome"
              rows={4}
              maxLength={5000}
              defaultValue={milestone?.expectedOutcome ?? ''}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start date">
            <Input name="startedAt" type="date" defaultValue={milestone?.startedAt?.slice(0, 10) ?? ''} />
          </Field>

          <Field label="Due date">
            <Input name="dueDate" type="date" defaultValue={milestone?.dueDate?.slice(0, 10) ?? ''} />
          </Field>
        </div>

        <Field label="Completion notes">
          <Textarea
            name="completionNotes"
            rows={4}
            maxLength={5000}
            defaultValue={milestone?.completionNotes ?? ''}
            placeholder="Final delivery notes, handoff information or completion context..."
          />
        </Field>
      </div>

      <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-surface-muted/40 px-4 py-4 sm:px-5">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-9 cursor-pointer items-center justify-center rounded-xl border border-border bg-background px-4 text-xs font-semibold text-foreground transition-colors hover:bg-surface-muted">
          Cancel
        </button>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-xs font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
          <Save className="size-3.5" />

          {pending ? 'Saving...' : milestone ? 'Save milestone' : 'Create milestone'}
        </button>
      </footer>
    </form>
  );
}

function Field({
  label,
  required = false,
  children
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-muted">
        {label}

        {required ? <span className="ml-1 text-theme-accent">*</span> : null}
      </span>

      {children}
    </label>
  );
}

function MilestoneStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.08em] text-muted">{label}</p>

      <p className="mt-1 text-xs font-semibold text-foreground">{value}</p>
    </div>
  );
}
