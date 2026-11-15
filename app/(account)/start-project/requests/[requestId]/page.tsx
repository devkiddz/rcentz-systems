import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2, ClipboardList, Pencil } from 'lucide-react';
import { requireAuth } from '@/features/auth/server/require-auth';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Project request received',
  robots: { index: false, follow: false }
};

export default async function ProjectRequestPage({
  params,
  searchParams
}: {
  params: Promise<{ requestId: string }>;
  searchParams: Promise<{ upload?: string }>;
}) {
  const { requestId } = await params;
  const notices = await searchParams;
  const attachmentsNeedAttention = notices.upload === 'failed';
  const user = await requireAuth(`/start-project/requests/${requestId}`);
  const { prisma } = await import('@/lib/prisma');
  const brief = await prisma.serviceRequest.findFirst({
    where: { id: requestId, userId: user.id },
    select: {
      id: true,
      title: true,
      status: true,
      submittedAt: true,
      project: { select: { id: true, clientId: true } }
    }
  });

  if (!brief) notFound();

  const editable = ['DRAFT', 'PENDING'].includes(brief.status) && !brief.project;
  const status = brief.status.toLowerCase().replaceAll('_', ' ');
  const converted = brief.project?.clientId === user.id;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-16">
      <div className="rounded-3xl border border-border bg-background p-6 sm:p-10">
        <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-theme-accent-faint text-theme-accent">
          <CheckCircle2 aria-hidden="true" className="size-7" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-theme-accent">
          Request received
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          Thank you for choosing Rcentz!
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
          Your project brief has been saved successfully. Our team will review your requirements and
          discuss the proposed scope, quotation, and milestones with you before a
          development project begins.
        </p>

        {attachmentsNeedAttention ? (
          <div role="alert" className="mt-6 rounded-2xl border border-amber-500/40 bg-amber-500/5 p-4 text-sm leading-6">
            <p className="font-semibold">Your request was saved, but some attachments need attention.</p>
            <p className="mt-1 text-muted-foreground">
              At least one file did not upload. Any earlier successful uploads remain attached.
              You can reopen your brief and add the missing files while the request is pending.
            </p>
            {editable ? (
              <Link href={`/dashboard/onboarding/${brief.id}`} className="mt-2 inline-flex min-h-10 items-center font-semibold underline underline-offset-4">
                Add missing attachments
              </Link>
            ) : null}
          </div>
        ) : null}
        <section className="mt-7 rounded-2xl border border-border bg-surface-subtle p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Your project request
          </p>
          <h2 className="mt-2 break-words text-lg font-semibold">{brief.title}</h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Status</dt>
              <dd className="mt-1 font-medium capitalize">{status}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Submitted</dt>
              <dd className="mt-1 font-medium">
                {brief.submittedAt?.toLocaleDateString('en-GB', {
                  timeZone: 'Africa/Lagos',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }) || 'Not submitted'}
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-7">
          <h2 className="text-sm font-semibold">What happens next?</h2>
          <ol className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
            <li>1. Rcentz reviews your submitted information and references.</li>
            <li>2. We discuss any clarifications and prepare a quotation and proposed milestones.</li>
            <li>3. You review and approve the proposal before project registration and development.</li>
          </ol>
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/dashboard/requests"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background"
          >
            <ClipboardList aria-hidden="true" className="size-4" />
            View all my briefs
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          {editable ? (
            <Link
              href={`/dashboard/onboarding/${brief.id}`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border px-5 text-sm font-medium hover:bg-surface-subtle"
            >
              <Pencil aria-hidden="true" className="size-4" />
              Edit this brief
            </Link>
          ) : null}
          {converted ? (
            <Link
              href={`/dashboard/projects/${brief.project!.id}`}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-border px-5 text-sm font-medium hover:bg-surface-subtle"
            >
              Open project
            </Link>
          ) : null}
        </div>
        {!editable && !converted ? (
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            This request is being processed. Contact Rcentz if you need to change its scope.
          </p>
        ) : null}
      </div>
    </main>
  );
}
