import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarDays,
  ClipboardList,
  FileText,
  Layers3,
  ShieldCheck,
  Target,
} from 'lucide-react';
import type { AdminBrief } from '@/features/admin/server/requests/get-admin-brief';
import { BRIEF_KEY, readBriefData } from '@/features/onboarding/server/brief-data';
import { buildOptions } from '@/features/onboarding/lib/project-brief';
import { ServiceSelectionSummary } from '@/features/services/components/selection/ServiceSelectionSummary';
import { reviewBrief, createPlanningProject } from '@/features/admin/server/requests/brief-actions';

const actionClass =
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

function Detail({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? 'min-w-0 sm:col-span-2' : 'min-w-0'}>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
        {children === null || children === undefined || children === ''
          ? 'Not provided'
          : children}
      </dd>
    </div>
  );
}

function ReviewSection({
  index,
  id,
  title,
  detail,
  icon: Icon,
  children,
}: {
  index: number;
  id: string;
  title: string;
  detail: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 px-4 py-5 sm:px-6 sm:py-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-theme-accent-faint text-theme-accent">
          <Icon aria-hidden="true" className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Section {index} of 5
          </p>
          <h2 className="mt-0.5 text-base font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function AdminBriefPreview({
  item,
  projectId,
}: {
  item: AdminBrief;
  projectId?: string;
}) {
  const data = readBriefData(
    item.answers.find((answer) => answer.question.key === BRIEF_KEY)?.metadata,
  );
  const brief = data?.brief;
  const legacy = item.answers.filter((answer) => answer.question.key !== BRIEF_KEY);
  const back = projectId ? `/admin/projects/${projectId}` : '/admin/requests';
  const build = buildOptions.find((option) => option.value === brief?.build)?.title;
  const budget = brief
    ? brief.guidance
      ? 'Guidance requested'
      : brief.budget
        ? `${brief.currency} ${brief.budget}`
        : 'Not provided'
    : item.budget
      ? `${item.currency} ${item.budget.toString()}`
      : 'Not provided';
  const timeline =
    brief?.timeline ||
    (item.preferredDeadlineAt
      ? item.preferredDeadlineAt.toLocaleDateString('en-GB', { timeZone: 'Africa/Lagos' })
      : 'To be discussed');
  const canCreate = ['PENDING', 'REVIEWING', 'QUOTED', 'APPROVED'].includes(item.status);

  return (
    <main className="rcentz-dashboard-frame mx-auto w-full max-w-[96rem] space-y-5 px-3 py-5 sm:px-6 lg:px-8">
      <Link
        href={back}
        className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {projectId ? 'Back to project' : 'All project briefs'}
      </Link>

      <header className="rounded-2xl border border-border bg-background p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-theme-accent">
              Client onboarding / Admin review
            </p>
            <h1 className="mt-2 break-words text-2xl font-semibold tracking-tight sm:text-3xl">
              {item.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {item.service.name} · {item.user.name}
            </p>
          </div>
          <span className="rounded-full border border-border bg-surface-subtle px-3 py-1.5 text-xs font-semibold capitalize">
            {item.status.toLowerCase().replaceAll('_', ' ')}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
          <span><strong className="text-foreground">Budget:</strong> {budget}</span>
          <span><strong className="text-foreground">Timeline:</strong> {timeline}</span>
          <span><strong className="text-foreground">References:</strong> {data?.attachments.length ?? 0} files</span>
        </div>
      </header>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-background divide-y divide-border">
          <ReviewSection
            index={1}
            id="brief-identity"
            title="Project identity"
            detail="What the customer is asking for, and who owns the request."
            icon={Building2}
          >
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <Detail label="Business / organisation">{brief?.company || item.user.name}</Detail>
              <Detail label="Build type">{build || item.service.name}</Detail>
              <Detail label="Project name" wide>{item.title}</Detail>
              <Detail label="Intended users" wide>{brief?.audience}</Detail>
            </dl>
            {data?.serviceSelection ? (
              <details className="mt-5 rounded-xl border border-border bg-surface-subtle p-3">
                <summary className="cursor-pointer text-sm font-medium">
                  View selected catalogue features
                </summary>
                <div className="mt-3">
                  <ServiceSelectionSummary selection={data.serviceSelection} />
                </div>
              </details>
            ) : null}
          </ReviewSection>

          <ReviewSection
            index={2}
            id="brief-direction"
            title="Project direction"
            detail="The problem to solve and the expected result."
            icon={Target}
          >
            <dl className="grid gap-4 sm:grid-cols-2">
              <Detail label="Goals and expected outcome" wide>
                {brief?.goals || item.description}
              </Detail>
            </dl>
          </ReviewSection>

          <ReviewSection
            index={3}
            id="brief-requirements"
            title="Features and requirements"
            detail="The customer's requested scope and current starting point."
            icon={Layers3}
          >
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <Detail label="Starting point">{brief?.startingPoint}</Detail>
              <Detail label="Existing website">
                {brief?.website ? (
                  <a
                    href={brief.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-theme-accent underline underline-offset-4"
                  >
                    {brief.website}
                  </a>
                ) : null}
              </Detail>
              <Detail label="Must-have features" wide>{brief?.features}</Detail>
              {!brief ? legacy.map((answer) => (
                <Detail key={answer.id} label={answer.questionLabel} wide>
                  {answer.textValue ??
                    answer.numberValue?.toString() ??
                    answer.dateValue?.toLocaleDateString('en-GB') ??
                    (answer.booleanValue !== null
                      ? String(answer.booleanValue)
                      : answer.selectedOptions.map((option) => option.option.label).join(', '))}
                </Detail>
              )) : null}
            </dl>
          </ReviewSection>

          <ReviewSection
            index={4}
            id="brief-references"
            title="References and documents"
            detail="Files supplied by the customer for scope review."
            icon={FileText}
          >
            {data?.attachments.length ? (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {data.attachments.map((file) => {
                  const url = `/api/project-briefs/${item.id}/files/${file.id}`;
                  return (
                    <li
                      key={file.id}
                      className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface-subtle"
                    >
                      <a
                        href={`${url}?preview=1`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Preview ${file.name}`}
                        className="flex h-28 items-center justify-center bg-background"
                      >
                        {file.type.startsWith('image/') ? (
                          <Image
                            unoptimized
                            src={`${url}?preview=1`}
                            alt={`Customer reference: ${file.name}`}
                            width={240}
                            height={112}
                            className="h-28 w-full object-contain"
                          />
                        ) : (
                          <FileText aria-hidden="true" className="size-8 text-muted-foreground" />
                        )}
                      </a>
                      <div className="space-y-1.5 p-3">
                        <p className="truncate text-xs font-semibold" title={file.name}>{file.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {Math.ceil(file.size / 1024)} KB
                        </p>
                        <a
                          href={url}
                          className="inline-flex items-center gap-1 text-xs font-medium text-theme-accent underline underline-offset-2"
                        >
                          Download <ArrowUpRight aria-hidden="true" className="size-3" />
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                No reference files were supplied with this brief.
              </p>
            )}
          </ReviewSection>

          <ReviewSection
            index={5}
            id="brief-delivery"
            title="Delivery preferences and notes"
            detail="Budget guidance, timing, support and anything else to discuss."
            icon={CalendarDays}
          >
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <Detail label="Budget">{budget}</Detail>
              <Detail label="Timeline">{timeline}</Detail>
              <Detail label="Ongoing support">
                {brief ? (brief.ongoingSupport ? 'Requested' : 'Not requested') : null}
              </Detail>
              <Detail label="Additional notes" wide>{brief?.notes}</Detail>
            </dl>
          </ReviewSection>
        </div>

        <aside className="min-w-0 space-y-4 xl:sticky xl:top-6">
          <section className="rounded-2xl border border-border bg-background p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck aria-hidden="true" className="size-5 text-theme-accent" />
              <h2 className="text-base font-semibold">Review and actions</h2>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Review each section before making a delivery decision.
            </p>
            <nav aria-label="Brief review sections" className="mt-4 grid grid-cols-2 gap-1.5 xl:grid-cols-1">
              {[
                ['1', 'Identity', '#brief-identity'],
                ['2', 'Direction', '#brief-direction'],
                ['3', 'Requirements', '#brief-requirements'],
                ['4', 'References', '#brief-references'],
                ['5', 'Delivery', '#brief-delivery'],
              ].map(([number, title, href]) => (
                <a
                  key={href}
                  href={href}
                  className="flex min-h-9 items-center gap-2 rounded-lg px-2 text-xs font-medium text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-surface-muted text-[10px]">
                    {number}
                  </span>
                  {title}
                </a>
              ))}
            </nav>
            <div className="mt-4 space-y-2 border-t border-border pt-4">
              {item.status === 'PENDING' ? (
                <form action={reviewBrief}>
                  <input type="hidden" name="requestId" value={item.id} />
                  <button className={actionClass}>Start reviewing</button>
                </form>
              ) : null}
              {item.project ? (
                <Link href={`/admin/projects/${item.project.id}`} className={actionClass}>
                  Open project workspace
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              ) : canCreate ? (
                <form action={createPlanningProject}>
                  <input type="hidden" name="requestId" value={item.id} />
                  <button className={actionClass}>Create planning project</button>
                </form>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-background p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <ClipboardList aria-hidden="true" className="size-4 text-theme-accent" />
              <h2 className="text-sm font-semibold">Request record</h2>
            </div>
            <dl className="mt-4 space-y-3">
              <Detail label="Customer">{item.user.name}</Detail>
              <Detail label="Customer email">{item.user.email}</Detail>
              <Detail label="Updated">
                {item.updatedAt.toLocaleString('en-GB', {
                  timeZone: 'Africa/Lagos',
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })} WAT
              </Detail>
            </dl>
          </section>
        </aside>
      </div>
    </main>
  );
}
