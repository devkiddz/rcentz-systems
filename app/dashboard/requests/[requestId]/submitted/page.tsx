import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2, ClipboardList, Eye, Pencil, Paperclip } from 'lucide-react';
import { requireAuth } from '@/features/auth/server/require-auth';
import { prisma } from '@/lib/prisma';
import { BRIEF_KEY, readBriefData } from '@/features/onboarding/server/brief-data';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Project request submitted | Rcentz', robots: { index: false, follow: false } };

type Props = {
  params: Promise<{ requestId: string }>;
  searchParams: Promise<{ upload?: string }>;
};

export default async function SubmittedBriefPage({ params, searchParams }: Props) {
  const { requestId } = await params;
  const { upload } = await searchParams;
  const user = await requireAuth(`/dashboard/requests/${requestId}/submitted`);
  const request = await prisma.serviceRequest.findFirst({
    where: { id: requestId, userId: user.id },
    select: {
      id: true, title: true, status: true, submittedAt: true,
      project: { select: { id: true } },
      answers: { where: { question: { key: BRIEF_KEY } }, select: { metadata: true } }
    }
  });
  if (!request) notFound();
  const attachmentCount = readBriefData(request.answers[0]?.metadata)?.attachments.length || 0;
  const editable = ['DRAFT', 'PENDING'].includes(request.status) && !request.project;
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="rounded-3xl border border-border bg-background p-6 shadow-sm sm:p-10">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-theme-accent-faint text-theme-accent">
          <CheckCircle2 aria-hidden="true" className="size-9" />
        </div>
        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-theme-accent">Submission received</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Thank you for choosing Rcentz!</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Your project brief has been submitted successfully. Our team will review it, reach out if
          anything needs clarification, and discuss the proposed scope, quotation, and milestones
          before development starts.
        </p>
        {upload === 'failed' ? (
          <div role="alert" className="mt-6 rounded-2xl border border-amber-500/40 bg-amber-500/5 p-4">
            <p className="text-sm font-semibold">Your request is saved, but some attachments did not upload.</p>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              Any successfully uploaded files remain attached. Open the brief preview to check the
              gallery, and add missing files through Edit while the request is pending.
            </p>
          </div>
        ) : null}
        <section className="mt-7 rounded-2xl border border-border bg-surface-subtle p-5" aria-label="Submitted request summary">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Your project request</p>
          <h2 className="mt-2 break-words text-lg font-semibold">{request.title}</h2>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
            <div><dt className="text-xs text-muted-foreground">Status</dt><dd className="mt-1 font-medium capitalize">{request.status.toLowerCase().replaceAll('_', ' ')}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Documents</dt><dd className="mt-1 flex items-center gap-1 font-medium"><Paperclip aria-hidden="true" className="size-3.5" />{attachmentCount} attached</dd></div>
            <div><dt className="text-xs text-muted-foreground">Submitted</dt><dd className="mt-1 font-medium">{request.submittedAt?.toLocaleDateString('en-GB', { timeZone: 'Africa/Lagos', day: 'numeric', month: 'short', year: 'numeric' }) || 'Saved'}</dd></div>
          </dl>
        </section>
        <section className="mt-7">
          <h2 className="text-sm font-semibold">What happens next?</h2>
          <ol className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
            <li>1. Rcentz reviews the information and references you provided.</li>
            <li>2. We clarify the requirements and prepare the proposal and planned milestones.</li>
            <li>3. You review and approve the proposal before a project is registered.</li>
          </ol>
        </section>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/dashboard/requests" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background">
            <ClipboardList aria-hidden="true" className="size-4" /> View all briefs <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link href={`/dashboard/requests/${request.id}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border px-5 text-sm font-medium hover:bg-surface-subtle">
            <Eye aria-hidden="true" className="size-4" /> Preview this brief
          </Link>
          {editable ? (
            <Link href={`/dashboard/onboarding/${request.id}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border px-5 text-sm font-medium hover:bg-surface-subtle">
              <Pencil aria-hidden="true" className="size-4" /> Edit this brief
            </Link>
          ) : null}
        </div>
      </div>
    </main>
  );
}
