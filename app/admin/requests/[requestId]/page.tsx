import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/features/auth/server/require-admin';
import { prisma } from '@/lib/prisma';
import { BRIEF_KEY, readBriefData } from '@/features/onboarding/server/brief-data';
import { reviewBrief, createPlanningProject } from '@/features/admin/server/requests/brief-actions';
export default async function Page({ params }: { params: Promise<{ requestId: string }> }) {
  await requireAdmin();
  const { requestId } = await params;
  const item = await prisma.serviceRequest.findFirst({ where: { id: requestId, status: { not: 'DRAFT' } }, include: { user: { select: { name: true, email: true } }, service: { select: { name: true } }, project: { select: { id: true } }, answers: { include: { question: { select: { key: true } }, selectedOptions: { include: { option: { select: { label: true } } } } } } } });
  if (!item) notFound();
  const data = readBriefData(item.answers.find(a => a.question.key === BRIEF_KEY)?.metadata);
  const fields = data ? [
    ['Company', data.brief.company], ['Goals', data.brief.goals], ['Audience', data.brief.audience],
    ['Starting point', data.brief.startingPoint], ['Existing website', data.brief.website],
    ['Features', data.brief.features], ['Requested budget', data.brief.guidance ? 'Needs guidance' : data.brief.currency + ' ' + data.brief.budget],
    ['Timeline', data.brief.timeline], ['Ongoing support', data.brief.ongoingSupport ? 'Requested' : 'Not requested'], ['Notes', data.brief.notes]
  ] : item.answers.filter(a => a.question.key !== BRIEF_KEY).map(a => [
    a.questionLabel,
    a.textValue ?? a.numberValue?.toString() ?? a.dateValue?.toISOString() ??
      (a.booleanValue !== null ? String(a.booleanValue) : a.selectedOptions.map(o => o.option.label).join(', '))
  ]);
  return <main className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6"><Link href="/admin/requests" className="text-sm text-theme-accent">← All briefs</Link><header><p className="text-xs font-semibold text-theme-accent">{item.status} · {item.service.name}</p><h1 className="mt-2 text-2xl font-semibold">{item.title}</h1><p className="mt-3 text-sm">{item.user.name} · {item.user.email}</p></header><p className="whitespace-pre-wrap text-sm leading-7">{item.description}</p><dl className="grid gap-4 md:grid-cols-2">{fields.map(([label, value]) => <div key={label} className="rounded-xl border border-border p-5"><dt className="text-sm font-semibold">{label}</dt><dd className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">{value || 'Not provided'}</dd></div>)}</dl>{data?.attachments.length ? <section className="rounded-xl border border-border p-5"><h2 className="font-semibold">Reference files</h2><ul className="mt-3 space-y-3">{data.attachments.map(file => <li key={file.id}><a href={'/api/project-briefs/' + item.id + '/files/' + file.id} className="break-all text-sm text-theme-accent underline">{file.name}</a><span className="ml-2 text-xs text-muted-foreground">{Math.ceil(file.size / 1024)} KB</span></li>)}</ul></section> : null}<section className="rounded-xl border border-border p-5"><h2 className="font-semibold">Delivery planning</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">A planning workspace does not confirm an agreed price, payment or completed work.</p><div className="mt-4 flex flex-wrap gap-3">{item.status === 'PENDING' ? <form action={reviewBrief}><input type="hidden" name="requestId" value={item.id} /><button className="min-h-11 rounded-full border border-border px-5 text-sm font-semibold">Start reviewing</button></form> : null}{item.project ? <Link href={'/admin/projects/' + item.project.id} className="inline-flex min-h-11 items-center rounded-full bg-foreground px-5 text-sm font-semibold text-background">Open project</Link> : ['PENDING', 'REVIEWING', 'QUOTED', 'APPROVED'].includes(item.status) ? <form action={createPlanningProject}><input type="hidden" name="requestId" value={item.id} /><button className="min-h-11 rounded-full bg-foreground px-5 text-sm font-semibold text-background">Create planning project</button></form> : null}</div></section></main>;
}
