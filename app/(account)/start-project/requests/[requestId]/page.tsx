import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, FileText } from 'lucide-react';
import { requireAuth } from '@/features/auth/server/require-auth';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Your project brief',
  robots: { index: false, follow: false }
};
export default async function ProjectRequestPage({
  params
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const user = await requireAuth(`/start-project/requests/${requestId}`);
  const { prisma } = await import('@/lib/prisma');
  const brief = await prisma.serviceRequest.findFirst({
    where: { id: requestId, userId: user.id },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      submittedAt: true
    }
  });
  if (!brief) notFound();
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-8 sm:py-16">
      <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs">
        <Check aria-hidden="true" className="size-3.5" />
        Brief received
      </span>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight">
        {brief.title}
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
        Your brief is saved to your account. The next step is a scope
        conversation: requirements, delivery milestones and project costs are
        agreed before work begins.
      </p>
      <dl className="mt-7 grid gap-4 rounded-xl border border-border bg-surface-subtle p-5 sm:grid-cols-3">
        {[
          ['Reference', brief.id],
          ['Status', brief.status.toLowerCase().replaceAll('_', ' ')],
          [
            'Submitted',
            brief.submittedAt?.toLocaleDateString('en-GB', {
              timeZone: 'UTC',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }) || 'Not submitted'
          ]
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-2 break-all text-sm font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      <section className="mt-8 rounded-2xl border border-border p-5 sm:p-7">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <FileText aria-hidden="true" className="size-4" />
          Your submitted brief
        </h2>
        <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">
          {brief.description}
        </p>
      </section>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link href={`/dashboard/onboarding/${requestId}`} className="inline-flex min-h-11 items-center rounded-full border border-border px-5 text-sm font-medium">Review or edit your brief</Link>
        <Link
          href="/dashboard/requests"
          className="inline-flex min-h-11 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background"
        >
          View your workspace
        </Link>
        <a
          href="mailto:contact@rcentz.cc"
          className="inline-flex min-h-11 items-center rounded-full border border-border px-5 text-sm"
        >
          Contact the team
        </a>
      </div>
    </main>
  );
}
