import Link from 'next/link';
import { ArrowRight, ClipboardList, Plus } from 'lucide-react';
import { requireAuth } from '@/features/auth/server/require-auth';
import { prisma } from '@/lib/prisma';
import { ClientPageFrame } from '@/features/client/components/shell/ClientPageFrame';
import { ClientOperationsTabs } from '@/features/client/components/overview/ClientOperationsTabs';
import { getClientOverview } from '@/features/client/server/overview/get-client-overview';

function readableStatus(status: string) {
  return status.toLowerCase().replaceAll('_', ' ');
}

function statusExplanation(status: string) {
  switch (status) {
    case 'DRAFT':
      return 'Continue preparing your request before sending it to Rcentz.';
    case 'PENDING':
      return 'Your request has been received and is waiting for our review.';
    case 'REVIEWING':
      return 'Our team is reviewing your requirements and planning the next steps.';
    case 'QUOTED':
      return 'A quotation is being prepared or has been issued for your review.';
    case 'APPROVED':
      return 'Your request has been approved. We will confirm the next steps.';
    case 'CONVERTED':
      return 'This request has been linked to a project workspace.';
    case 'REJECTED':
      return 'This request was not approved. Contact our team for clarification.';
    case 'CANCELLED':
      return 'This request has been cancelled.';
    default:
      return 'Open the request to see its latest details.';
  }
}

export default async function RequestsPage() {
  const user = await requireAuth('/dashboard/requests');
  const [requests, overview] = await Promise.all([
    prisma.serviceRequest.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        project: { select: { id: true, clientId: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    }),
    getClientOverview(user.id)
  ]);

  return (
    <ClientPageFrame
      title="My project requests"
      description="View your submitted briefs, track review updates, and continue requests that are still editable."
    >
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface-subtle p-4 sm:p-5">
        <div>
          <p className="text-sm font-semibold">Have another project in mind?</p>
          <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">
            Share your idea and requirements. Our team will review the details before preparing a proposal.
          </p>
        </div>
        <Link
          href="/dashboard/onboarding"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background"
        >
          <Plus aria-hidden="true" className="size-4" />
          Start a project
        </Link>
      </div>

      <section aria-labelledby="project-requests-title" className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id="project-requests-title" className="flex items-center gap-2 text-base font-semibold">
            <ClipboardList aria-hidden="true" className="size-4 text-theme-accent" />
            Your project briefs
          </h2>
          <span className="text-xs text-muted-foreground">
            {requests.length} {requests.length === 1 ? 'request' : 'requests'}
          </span>
        </div>
        {requests.length ? (
          <ul className="grid gap-3 lg:grid-cols-2">
            {requests.map(request => {
              const editable = ['DRAFT', 'PENDING'].includes(request.status) && !request.project;
              const projectId = request.project?.clientId === user.id ? request.project.id : null;
              return (
                <li key={request.id} className="rounded-2xl border border-border bg-background p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="min-w-0 flex-1 break-words text-base font-semibold">
                      {request.title}
                    </h3>
                    <span className="rounded-full border border-border bg-surface-subtle px-3 py-1 text-[11px] font-medium capitalize">
                      {readableStatus(request.status)}
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-6 text-muted-foreground">
                    {statusExplanation(request.status)}
                  </p>
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    Created{' '}
                    {request.createdAt.toLocaleDateString('en-GB', {
                      timeZone: 'Africa/Lagos',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-border pt-4 text-xs font-medium">
                    <Link
                      href={`/dashboard/requests/${request.id}`}
                      className="inline-flex min-h-9 items-center gap-1 text-theme-accent hover:underline"
                    >
                      View brief <ArrowRight aria-hidden="true" className="size-3.5" />
                    </Link>
                    {editable ? (
                      <Link href={`/dashboard/onboarding/${request.id}`} className="inline-flex min-h-9 items-center hover:underline">
                        Edit brief
                      </Link>
                    ) : null}
                    {projectId ? (
                      <Link href={`/dashboard/projects/${projectId}`} className="inline-flex min-h-9 items-center hover:underline">
                        Open project
                      </Link>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-sm font-medium">No project requests yet</p>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              Start with a project idea. Your briefs will appear here once saved.
            </p>
          </div>
        )}
      </section>

      <details className="group overflow-hidden rounded-2xl border border-border bg-background">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-medium marker:content-none sm:p-5">
          <span>
            <span className="block text-sm">Project actions, records &amp; support</span>
            <span className="mt-1 block text-xs font-normal text-muted-foreground">
              Existing project operations: {overview.actions.length} actions, {overview.records.length} records,
              {' '}{overview.support.length} support items
            </span>
          </span>
          <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
        </summary>
        <div className="border-t border-border p-3 sm:p-4">
          <ClientOperationsTabs
            actions={overview.actions}
            records={overview.records}
            support={overview.support}
          />
        </div>
      </details>
    </ClientPageFrame>
  );
}
