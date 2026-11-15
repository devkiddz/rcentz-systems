import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/features/auth/server/require-admin';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Quote & enquiries | Rcentz Systems', robots: { index: false, follow: false } };

const statuses = ['NEW', 'REVIEWING', 'QUOTED', 'CLOSED', 'SPAM'] as const;

async function updateEnquiryStatus(form: FormData) {
  'use server';
  await requireAdmin();
  const id = form.get('id');
  const status = form.get('status');
  if (typeof id !== 'string' || id.length < 12 || id.length > 100 || typeof status !== 'string' || !statuses.some(s => s === status)) return;
  await prisma.publicEnquiry.updateMany({ where: { id }, data: { status } });
  revalidatePath('/admin/enquiries');
}

type Query = { page?: string; purpose?: string };

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<Query> }) {
  await requireAdmin();
  const query = await searchParams;
  const rawPage = Number(query.page);
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? Math.min(rawPage, 1000) : 1;
  const purpose = query.purpose === 'QUOTE' ? 'QUOTE' : undefined;
  const where = purpose ? { purpose } : {};
  const [records, total] = await Promise.all([
    prisma.publicEnquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * 30,
      take: 30,
    }),
    prisma.publicEnquiry.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / 30));
  return (
    <main className="rcentz-dashboard-frame px-4 py-6 sm:px-6 lg:px-8">
      <div className="rcentz-dashboard-inner mx-auto w-full max-w-6xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-theme-accent">Corporate intake / private</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Quote & enquiries</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Public submissions from rcentz.cc are stored here before staff create any formal price quote or service request. These are not issued quotations.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/enquiries" className="rounded-lg border border-border bg-background px-4 py-2 text-sm">All enquiries</Link>
            <Link href="/admin/enquiries?purpose=QUOTE" className="rounded-lg border border-border bg-background px-4 py-2 text-sm">Quote requests</Link>
          </div>
        </header>
        <p className="text-xs text-muted-foreground">{total} matching record{total === 1 ? '' : 's'} · Page {page} of {pages}</p>
        <div className="space-y-4">
          {records.map(row => (
            <article key={row.id} className="rounded-2xl border border-border bg-background p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-border bg-surface-subtle px-3 py-1 font-mono text-[11px]">{row.purpose === 'QUOTE' ? 'QUOTE REQUEST' : 'ENQUIRY'}</span>
                    <span className="rounded-full border border-border px-3 py-1 font-mono text-[11px]">{row.status}</span>
                  </div>
                  <h2 className="mt-3 text-lg font-semibold">{row.name}{row.company ? ` · ${row.company}` : ''}</h2>
                  <p className="mt-2 font-mono text-xs text-theme-accent">{row.reference}</p>
                </div>
                <div className="text-left text-xs leading-6 text-muted-foreground sm:text-right">
                  <p>{row.createdAt.toLocaleString('en-GB', { timeZone: 'Africa/Lagos' })} WAT</p>
                  <p>{row.notifiedAt ? 'Email notification sent' : 'Notification not confirmed'}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
                <div className="space-y-1 text-sm leading-7">
                  <p><span className="text-muted-foreground">Purpose:</span> {row.purpose}</p>
                  <p><span className="text-muted-foreground">Email:</span> <a className="break-all font-medium underline underline-offset-4" href={`mailto:${row.email}?subject=${encodeURIComponent(`Re: Rcentz enquiry ${row.reference}`)}`}>{row.email}</a></p>
                  {row.phone ? <p><span className="text-muted-foreground">Phone:</span> {row.phone}</p> : null}
                </div>
                <div className="space-y-1 text-sm leading-7">
                  {row.projectType ? <p><span className="text-muted-foreground">Project:</span> {row.projectType}</p> : null}
                  {row.budgetNote ? <p><span className="text-muted-foreground">Budget guidance:</span> {row.budgetNote}</p> : null}
                  {row.timeline ? <p><span className="text-muted-foreground">Timeline:</span> {row.timeline}</p> : null}
                </div>
              </div>
              <p className="mt-4 whitespace-pre-wrap break-words rounded-xl border border-border bg-surface-subtle p-4 text-sm leading-7">{row.message}</p>
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                <span className="mr-2 text-xs text-muted-foreground">Update status:</span>
                {statuses.filter(status => status !== row.status).map(status => (
                  <form key={status} action={updateEnquiryStatus}>
                    <input type="hidden" name="id" value={row.id} />
                    <input type="hidden" name="status" value={status} />
                    <button className="min-h-9 rounded-lg border border-border bg-background px-3 text-xs font-medium hover:bg-surface-muted" type="submit">{status.toLowerCase().replace(/^./, c => c.toUpperCase())}</button>
                  </form>
                ))}
              </div>
            </article>
          ))}
          {!records.length ? <div className="rounded-xl border border-border bg-background p-8 text-center text-sm text-muted-foreground">No enquiries recorded in this view yet.</div> : null}
        </div>
        <nav aria-label="Enquiry pagination" className="flex items-center justify-between gap-4 text-sm">
          <span>Page {page} / {pages}</span>
          <div className="flex gap-3">
            {page > 1 ? <Link className="rounded-lg border border-border px-4 py-2" href={`/admin/enquiries?page=${page - 1}${purpose ? '&purpose=QUOTE' : ''}`}>Previous</Link> : null}
            {page < pages ? <Link className="rounded-lg border border-border px-4 py-2" href={`/admin/enquiries?page=${page + 1}${purpose ? '&purpose=QUOTE' : ''}`}>Next</Link> : null}
          </div>
        </nav>
      </div>
    </main>
  );
}
