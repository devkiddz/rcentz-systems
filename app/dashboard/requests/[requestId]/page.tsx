import Link from 'next/link';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarDays,
  ClipboardList,
  FileText,
  Layers3,
  Pencil,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { requireAuth } from '@/features/auth/server/require-auth';
import { prisma } from '@/lib/prisma';
import {
  BRIEF_KEY,
  readBriefData,
  legacyBrief,
} from '@/features/onboarding/server/brief-data';
import { buildOptions } from '@/features/onboarding/lib/project-brief';
import { ServiceSelectionSummary } from '@/features/services/components/selection/ServiceSelectionSummary';
import { BriefAttachmentGallery } from '@/features/onboarding/components/BriefAttachmentGallery';
import { ClientBriefDeletionPanel } from '@/features/onboarding/components/ClientBriefDeletionPanel';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Preview project brief | Rcentz',
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ requestId: string }>;
  searchParams: Promise<{ saved?: string; upload?: string }>;
};

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
          <h2 className="mt-0.5 text-base font-semibold tracking-tight">
            {title}
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {detail}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default async function BriefPreviewPage({ params, searchParams }: Props) {
  const { requestId } = await params;
  const notices = await searchParams;
  const user = await requireAuth(`/dashboard/requests/${requestId}`);
  const request = await prisma.serviceRequest.findFirst({
    where: { id: requestId, userId: user.id },
    include: {
      service: { select: { slug: true, name: true } },
      project: { select: { id: true, clientId: true } },
      answers: {
        where: { question: { key: BRIEF_KEY } },
        select: { metadata: true },
      },
    },
  });

  if (!request) notFound();

  const data = readBriefData(request.answers[0]?.metadata);
  const brief = data?.brief || legacyBrief(request);
  const editable = ['DRAFT', 'PENDING'].includes(request.status) && !request.project;
  const removable =
    ['DRAFT', 'PENDING', 'REJECTED', 'CANCELLED'].includes(request.status) &&
    !request.project;
  const projectId = request.project?.clientId === user.id ? request.project.id : null;
  const uploaded =
    data?.attachments.map((file) => ({
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
    })) || [];
  const build = buildOptions.find((option) => option.value === brief.build)?.title;
  const budget = brief.guidance
    ? 'Rcentz guidance requested'
    : brief.budget
      ? `${brief.currency} ${brief.budget}`
      : 'Not provided';
  const status = request.status.toLowerCase().replaceAll('_', ' ');
  const submittedAt = request.submittedAt
    ? request.submittedAt.toLocaleDateString('en-GB', {
        timeZone: 'Africa/Lagos',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Not yet submitted';

  return (
    <main className="mx-auto w-full max-w-[96rem] space-y-5 px-3 py-5 sm:px-6 lg:px-8">
      <Link
        href="/dashboard/requests"
        className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        All my briefs
      </Link>

      {notices.saved === '1' ? (
        <p role="status" className="rounded-xl border border-border bg-surface-subtle p-4 text-sm">
          Your changes have been saved.
        </p>
      ) : null}
      {notices.upload === 'failed' ? (
        <p role="alert" className="rounded-xl border border-amber-500/40 p-4 text-sm">
          Your brief was saved, but one or more attachments could not upload.
          Check the gallery before trying again.
        </p>
      ) : null}

      <header className="rounded-2xl border border-border bg-background p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-theme-accent">
              Project onboarding / Your brief
            </p>
            <h1 className="mt-2 break-words text-2xl font-semibold tracking-tight sm:text-3xl">
              {request.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {request.service.name} · {brief.company}
            </p>
          </div>
          <span className="rounded-full border border-border bg-surface-subtle px-3 py-1.5 text-xs font-semibold capitalize">
            {status}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
          <span><strong className="text-foreground">Budget:</strong> {budget}</span>
          <span><strong className="text-foreground">Timeline:</strong> {brief.timeline}</span>
          <span><strong className="text-foreground">References:</strong> {uploaded.length} files</span>
        </div>
      </header>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-background divide-y divide-border">
          <ReviewSection
            index={1}
            id="client-brief-identity"
            title="Project identity"
            detail="The business, the solution you want and who it will serve."
            icon={Building2}
          >
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <Detail label="Business / organisation">{brief.company}</Detail>
              <Detail label="Build type">{build || request.service.name}</Detail>
              <Detail label="Project name" wide>{request.title}</Detail>
              <Detail label="Intended users" wide>{brief.audience}</Detail>
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
            id="client-brief-direction"
            title="Project direction"
            detail="The problem you want solved and the outcome you expect."
            icon={Target}
          >
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <Detail label="Goals and expected outcome" wide>{brief.goals}</Detail>
            </dl>
          </ReviewSection>

          <ReviewSection
            index={3}
            id="client-brief-requirements"
            title="Features and requirements"
            detail="Your requested scope and current starting point, before formal approval."
            icon={Layers3}
          >
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <Detail label="Starting point">{brief.startingPoint}</Detail>
              <Detail label="Existing website">
                {brief.website ? (
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
              <Detail label="Must-have features" wide>{brief.features}</Detail>
            </dl>
          </ReviewSection>

          <ReviewSection
            index={4}
            id="client-brief-references"
            title="References and documents"
            detail="Your private image and PDF references. Preview, download, replace or remove files while editing is available."
            icon={FileText}
          >
            <BriefAttachmentGallery
              requestId={request.id}
              initialFiles={uploaded}
              editable={editable}
            />
          </ReviewSection>

          <ReviewSection
            index={5}
            id="client-brief-delivery"
            title="Delivery preferences and notes"
            detail="Budget guidance, timing, ongoing support and other information."
            icon={CalendarDays}
          >
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <Detail label="Budget preference">{budget}</Detail>
              <Detail label="Preferred timeline">{brief.timeline}</Detail>
              <Detail label="Ongoing support">
                {brief.ongoingSupport ? 'Requested' : 'Not requested yet'}
              </Detail>
              <Detail label="Additional notes" wide>{brief.notes}</Detail>
            </dl>
          </ReviewSection>
        </div>

        <aside className="min-w-0 space-y-4 xl:sticky xl:top-6">
          <section className="rounded-2xl border border-border bg-background p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <ClipboardList aria-hidden="true" className="size-5 text-theme-accent" />
              <h2 className="text-base font-semibold">Your brief</h2>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Review each section. You can update your answers only while this brief is editable.
            </p>
            <nav aria-label="Brief preview sections" className="mt-4 grid grid-cols-2 gap-1.5 xl:grid-cols-1">
              {[
                ['1', 'Identity', '#client-brief-identity'],
                ['2', 'Direction', '#client-brief-direction'],
                ['3', 'Requirements', '#client-brief-requirements'],
                ['4', 'References', '#client-brief-references'],
                ['5', 'Delivery', '#client-brief-delivery'],
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
              {editable ? (
                <Link
                  href={`/dashboard/onboarding/${request.id}`}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-semibold text-background"
                >
                  <Pencil aria-hidden="true" className="size-4" />
                  Edit brief
                </Link>
              ) : null}
              {projectId ? (
                <Link href={`/dashboard/projects/${projectId}`} className={actionClass}>
                  Open project
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              ) : null}
              <Link href="/dashboard/requests" className={actionClass}>
                All my briefs
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-background p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck aria-hidden="true" className="size-4 text-theme-accent" />
              <h2 className="text-sm font-semibold">Request status</h2>
            </div>
            <dl className="mt-4 space-y-3">
              <Detail label="Current status">{status}</Detail>
              <Detail label="Submitted">{submittedAt}</Detail>
            </dl>
            <p className="mt-4 border-t border-border pt-4 text-xs leading-6 text-muted-foreground">
              Rcentz will review your information, clarify the scope and discuss a quotation
              and proposed milestones before development begins.
            </p>
          </section>
        </aside>
      </div>

      <ClientBriefDeletionPanel
        requestId={request.id}
        title={request.title}
        removable={removable}
      />
    </main>
  );
}
