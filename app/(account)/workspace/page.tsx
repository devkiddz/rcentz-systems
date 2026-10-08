import Link from 'next/link';
import { SignOutButton } from '@/features/auth/components/SignOutButton';
import { FileText, Plus } from 'lucide-react';
import { requireAuth } from '@/features/auth/server/require-auth';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Your workspace',
  robots: { index: false, follow: false }
};
export default async function WorkspacePage() {
  const user = await requireAuth('/workspace');
  const { prisma } = await import('@/lib/prisma');
  const requests = await prisma.serviceRequest.findMany({
    where: { userId: user.id },
    select: { id: true, title: true, status: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-8 sm:py-16">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs text-muted-foreground">
            {user.name} · Your workspace
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Your project briefs.
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Follow your requests from the first scope conversation.
          </p>
        </div>
        <Link
          href="/start-project"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background"
        >
          <Plus aria-hidden="true" className="size-4" />
          Start a project
        </Link>
      </div>
      <SignOutButton />
      {requests.length ? (
        <ul className="mt-8 space-y-3">
          {requests.map((request) => (
            <li key={request.id}>
              <Link
                href={`/start-project/requests/${request.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-border p-5 hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <FileText
                    aria-hidden="true"
                    className="size-5 shrink-0 text-muted-foreground"
                  />
                  <span className="truncate text-sm font-medium">
                    {request.title}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-surface-muted px-2.5 py-1 text-[10px] capitalize">
                  {request.status.toLowerCase().replaceAll('_', ' ')}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center">
          <FileText
            aria-hidden="true"
            className="mx-auto size-8 text-muted-foreground"
          />
          <h2 className="mt-4 text-lg font-semibold">
            Your first brief starts here.
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Tell us about the business, what you need and the outcome you want.
            Your submitted brief will appear in this workspace.
          </p>
        </div>
      )}
    </main>
  );
}
