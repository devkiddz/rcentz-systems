import Link from 'next/link';
import { requireAuth } from '@/features/auth/server/require-auth';
import { prisma } from '@/lib/prisma';
import { ClientPageFrame } from '@/features/client/components/shell/ClientPageFrame';
import { ClientOperationsTabs } from '@/features/client/components/overview/ClientOperationsTabs';
import { getClientOverview } from '@/features/client/server/overview/get-client-overview';
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
      title="Requests & reviews"
      description="Track your submitted briefs, delivery decisions and project support."
    >
      <Link
        href="/dashboard/onboarding"
        className="inline-flex min-h-11 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background"
      >
        Start a project
      </Link>
      <section className="rounded-xl border border-border p-4">
        <h2 className="text-base font-semibold">Your project briefs</h2>
        {requests.length ? (
          <ul className="mt-4 divide-y divide-border">
            {requests.map((request) => (
              <li
                key={request.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <Link
                  href={`/dashboard/onboarding/${request.id}`}
                  className="min-w-0 break-words text-sm font-medium hover:underline"
                >
                  {request.title}
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-xs capitalize text-muted-foreground">
                    {request.status.toLowerCase().replaceAll('_', ' ')}
                  </span>
                  {request.project?.clientId === user.id ? (
                    <Link
                      className="text-xs font-medium hover:underline"
                      href={`/dashboard/projects/${request.project.id}`}
                    >
                      Open project
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Your submitted briefs will appear here. A brief becomes a project
            after scope review and agreement.
          </p>
        )}
      </section>
      <ClientOperationsTabs
        actions={overview.actions}
        records={overview.records}
        support={overview.support}
      />
    </ClientPageFrame>
  );
}
