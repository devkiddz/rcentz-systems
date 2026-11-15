import Link from 'next/link';
import { requireAdmin } from '@/features/auth/server/require-admin';
import { prisma } from '@/lib/prisma';
import { PROJECT_DELETION_MARKER, formatProjectDeletionStatus } from '@/features/projects/lib/deletion';
import { approveProjectDeletion, rejectProjectDeletion } from '@/features/admin/server/projects/project-deletion-actions';

export const dynamic = 'force-dynamic';

export default async function AdminProjectDeletionRequests() {
  await requireAdmin();
  const entries = await prisma.projectProcess.findMany({
    where: { type: 'OTHER', impact: PROJECT_DELETION_MARKER },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      project: { select: { id: true, name: true, status: true,
        client: { select: { name: true, email: true } } } },
      createdBy: { select: { name: true, email: true } }
    }
  });
  const pending = entries.filter(item => item.status === 'PENDING');
  const history = entries.filter(item => item.status !== 'PENDING');

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <Link href="/admin/projects" className="text-sm text-muted-foreground underline underline-offset-4">Back to projects</Link>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-theme-accent">Governance / Project deletion</p>
        <h1 className="mt-2 text-2xl font-semibold">Customer deletion requests</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Review the customer&apos;s reason before deciding. Approval archives the project from the customer workspace;
          it does not permanently erase invoices, milestones, evidence, files, or audit records.
        </p>
      </div>
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Pending review ({pending.length})</h2>
        {!pending.length ? <p className="rounded-xl border border-border p-5 text-sm text-muted-foreground">There are no pending deletion requests.</p> : null}
        {pending.map(item => (
          <article key={item.id} className="rounded-2xl border border-border bg-background p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link href={`/admin/projects/${item.projectId}`} className="text-base font-semibold underline underline-offset-4">{item.project.name}</Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  Requested by {item.createdBy.name} ({item.createdBy.email}) · {item.createdAt.toLocaleDateString('en-GB')}
                </p>
              </div>
              <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold">Pending review</span>
            </div>
            <div className="mt-4 rounded-xl bg-surface-subtle p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer&apos;s reason</p>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">{item.reason || 'Not provided'}</p>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <form action={approveProjectDeletion} className="space-y-3 rounded-xl border border-border p-4">
                <input type="hidden" name="requestId" value={item.id} />
                <label className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                  <input type="checkbox" name="confirm" value="APPROVE" required className="mt-1" />
                  I understand approval archives this project, and its records will be retained.
                </label>
                <label htmlFor={`approve-note-${item.id}`} className="block text-xs font-semibold">Decision note (optional)</label>
                <textarea id={`approve-note-${item.id}`} name="note" maxLength={1000} rows={2}
                  className="w-full rounded-lg border border-border bg-background p-2 text-sm" />
                <button type="submit" className="min-h-11 rounded-xl bg-foreground px-4 text-sm font-semibold text-background">
                  Approve and archive
                </button>
              </form>
              <form action={rejectProjectDeletion} className="space-y-3 rounded-xl border border-border p-4">
                <input type="hidden" name="requestId" value={item.id} />
                <label htmlFor={`reject-note-${item.id}`} className="block text-xs font-semibold">Reason for declining (required)</label>
                <textarea id={`reject-note-${item.id}`} name="note" required minLength={10} maxLength={1000} rows={3}
                  className="w-full rounded-lg border border-border bg-background p-2 text-sm"
                  placeholder="Explain the decision to the customer..." />
                <button type="submit" className="min-h-11 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-surface-muted">
                  Decline request
                </button>
              </form>
            </div>
          </article>
        ))}
      </section>
      <section className="space-y-3 border-t border-border pt-6">
        <h2 className="text-lg font-semibold">Decision history</h2>
        {!history.length ? <p className="text-sm text-muted-foreground">No previous decisions.</p> : null}
        {history.map(item => (
          <article key={item.id} className="rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">{item.project.name}</p>
              <span className="text-xs text-muted-foreground">{formatProjectDeletionStatus(item.status)}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{item.createdBy.email} · {item.createdAt.toLocaleDateString('en-GB')}</p>
            {item.resolutionNotes ? <p className="mt-2 whitespace-pre-wrap text-sm">Decision: {item.resolutionNotes}</p> : null}
          </article>
        ))}
      </section>
    </main>
  );
}
