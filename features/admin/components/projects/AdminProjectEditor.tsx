'use client';

import { useActionState, type ReactNode } from 'react';

import Link from 'next/link';

import { ArrowLeft, CalendarDays, FolderKanban, Save, UserRound } from 'lucide-react';

import { Input } from '@/components/ui/input';

import { Textarea } from '@/components/ui/textarea';

import {
  updateAdminProject,
  type UpdateAdminProjectState
} from '@/features/admin/server/projects/update-admin-project';

import {
  adminProjectCurrencyOptions,
  adminProjectStatusOptions,
  adminProjectTypeOptions,
  adminProjectVisibilityOptions
} from '@/features/admin/types/projects';

type ClientOption = {
  id: string;
  name: string;
  email: string;
  companyName: string | null;
};

type EditableProject = {
  id: string;

  name: string;
  slug: string;

  clientId: string;

  description: string;
  purpose: string;
  vision: string;
  expectedOutcome: string;

  type: string;
  status: string;
  visibility: string;

  progress: number;

  budget: string;
  currency: string;

  startedAt: string;
  expectedEndAt: string;
};

type AdminProjectEditorProps = {
  project: EditableProject;
  clients: ClientOption[];
};

const initialState: UpdateAdminProjectState = {
  error: null
};

const selectClassName =
  'flex h-9 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground outline-none transition-colors focus:border-foreground/30 focus:ring-2 focus:ring-theme-accent/20';

export function AdminProjectEditor({ project, clients }: AdminProjectEditorProps) {
  const [state, formAction, pending] = useActionState(updateAdminProject, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="projectId" value={project.id} />

      <main className="rcentz-dashboard-frame px-4 py-6 sm:px-6 lg:px-8">
        <div className="rcentz-dashboard-inner mx-auto w-full max-w-[1200px] space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href={`/admin/projects/${project.id}`}
              className="inline-flex items-center gap-2 text-xs font-medium text-muted transition-colors hover:text-foreground">
              <ArrowLeft className="size-3.5" />
              Back to project
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-1.5 text-xs font-medium text-muted">
              <span className="size-1.5 rounded-full bg-theme-accent" />
              Editing project
            </div>
          </div>

          <section>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-theme-accent">
              Project Management
            </p>

            <h1 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-foreground sm:text-2xl">
              Edit {project.name}
            </h1>

            <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">
              Update the canonical project record shared by Admin and Client project surfaces.
            </p>
          </section>

          {state.error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs font-medium text-red-600 dark:text-red-400">
              {state.error}
            </div>
          ) : null}

          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 space-y-5">
              <ProjectFormSection
                icon={FolderKanban}
                title="Project identity"
                description="Core project ownership and identity.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Project name" required>
                    <Input name="name" defaultValue={project.name} maxLength={160} required />
                  </Field>

                  <Field label="Project slug" required>
                    <Input name="slug" defaultValue={project.slug} maxLength={120} required />
                  </Field>

                  <Field label="Client">
                    <select name="clientId" defaultValue={project.clientId} className={selectClassName}>
                      <option value="">No client assigned</option>

                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.companyName ? `${client.companyName} — ${client.name}` : client.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Project type" required>
                    <select name="type" defaultValue={project.type} required className={selectClassName}>
                      {adminProjectTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </ProjectFormSection>

              <ProjectFormSection
                icon={UserRound}
                title="Project intelligence"
                description="Purpose, vision and expected client outcome.">
                <div className="space-y-4">
                  <Field label="Description">
                    <Textarea
                      name="description"
                      rows={4}
                      maxLength={5000}
                      defaultValue={project.description}
                    />
                  </Field>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <Field label="Purpose">
                      <Textarea name="purpose" rows={5} maxLength={5000} defaultValue={project.purpose} />
                    </Field>

                    <Field label="Vision">
                      <Textarea name="vision" rows={5} maxLength={5000} defaultValue={project.vision} />
                    </Field>
                  </div>

                  <Field label="Expected outcome">
                    <Textarea
                      name="expectedOutcome"
                      rows={4}
                      maxLength={5000}
                      defaultValue={project.expectedOutcome}
                    />
                  </Field>
                </div>
              </ProjectFormSection>

              <ProjectFormSection
                icon={CalendarDays}
                title="Delivery control"
                description="Manage lifecycle, visibility, schedule and financial reference.">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <Field label="Status" required>
                    <select name="status" defaultValue={project.status} required className={selectClassName}>
                      {adminProjectStatusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Visibility" required>
                    <select
                      name="visibility"
                      defaultValue={project.visibility}
                      required
                      className={selectClassName}>
                      {adminProjectVisibilityOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Overall progress (%)" required>
                    <Input
                      name="progress"
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      defaultValue={project.progress}
                      aria-describedby="overall-progress-help"
                      required
                    />
                  </Field>

                  <p id="overall-progress-help" className="text-xs leading-5 text-muted">Set the project total manually from 0 to 100. Milestone changes do not automatically update this value.</p>

                  <Field label="Budget">
                    <Input name="budget" type="number" min={0} step="0.01" defaultValue={project.budget} />
                  </Field>

                  <Field label="Currency" required>
                    <select
                      name="currency"
                      defaultValue={project.currency}
                      required
                      className={selectClassName}>
                      {adminProjectCurrencyOptions.map(currency => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <div />

                  <Field label="Start date">
                    <Input name="startedAt" type="date" defaultValue={project.startedAt} />
                  </Field>

                  <Field label="Expected completion">
                    <Input name="expectedEndAt" type="date" defaultValue={project.expectedEndAt} />
                  </Field>
                </div>
              </ProjectFormSection>
            </div>

            <aside className="space-y-4 xl:sticky xl:top-24">
              <section className="overflow-hidden rounded-2xl border border-border bg-surface">
                <header className="border-b border-border bg-surface-raised px-4 py-4">
                  <p className="text-xs font-semibold text-foreground">Update contract</p>

                  <p className="mt-1 text-xs leading-4 text-muted">
                    Saving updates the same canonical Project record read by the client workspace.
                  </p>
                </header>

                <div className="space-y-4 p-4">
                  <ContractRow label="Project identity" value="Updates immediately" />

                  <ContractRow label="Client assignment" value="Changes project ownership" />

                  <ContractRow label="Status & progress" value="Changes delivery state" />

                  <ContractRow label="Milestones" value="Managed separately" />

                  <ContractRow label="Deliverables" value="Managed separately" />
                </div>
              </section>

              <button
                type="submit"
                disabled={pending}
                className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-xs font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                <Save className="size-3.5" />

                {pending ? 'Saving changes...' : 'Save project'}
              </button>

              <Link
                href={`/admin/projects/${project.id}`}
                className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-border bg-background px-4 text-xs font-semibold text-foreground transition-colors hover:bg-surface-muted">
                Cancel
              </Link>
            </aside>
          </div>
        </div>
      </main>
    </form>
  );
}

function ProjectFormSection({
  icon: Icon,
  title,
  description,
  children
}: {
  icon: typeof FolderKanban;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface">
      <header className="flex items-center gap-3 border-b border-border bg-surface-raised px-4 py-4 sm:px-5">
        <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-background">
          <Icon className="size-4 text-theme-accent" />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>

          <p className="mt-0.5 text-xs text-muted">{description}</p>
        </div>
      </header>

      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  required = false,
  children
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
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

function ContractRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted">{label}</p>

      <p className="mt-1 text-xs leading-4 text-foreground">{value}</p>
    </div>
  );
}
