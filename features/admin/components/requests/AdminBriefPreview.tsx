import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowUpRight, Building2, CalendarDays, CircleDollarSign, FileText, Layers3, UsersRound } from 'lucide-react';
import type { AdminBrief } from '@/features/admin/server/requests/get-admin-brief';
import { BRIEF_KEY, readBriefData } from '@/features/onboarding/server/brief-data';
import { reviewBrief, createPlanningProject } from '@/features/admin/server/requests/brief-actions';
import { RcentzSymbol } from '@/ui-shell/brand/RcentzSymbol';

const actionClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
function Detail({ label, children }: { label: string; children: ReactNode }) {
  return <div className="min-w-0"><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-foreground">{children || 'Not provided'}</dd></div>;
}
function Section({ title, icon: Icon, children }: { title: string; icon: typeof FileText; children: ReactNode }) {
  return <section className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm"><header className="flex items-center gap-3 border-b border-border p-5"><span className="flex size-9 items-center justify-center rounded-xl bg-theme-accent-faint text-theme-accent"><Icon aria-hidden="true" className="size-4" /></span><h2 className="text-base font-semibold">{title}</h2></header><div className="p-5 sm:p-6">{children}</div></section>;
}
export function AdminBriefPreview({ item, projectId }: { item: AdminBrief; projectId?: string }) {
  const data = readBriefData(item.answers.find(a => a.question.key === BRIEF_KEY)?.metadata);
  const brief = data?.brief;
  const back = projectId ? '/admin/projects/' + projectId : '/admin/requests';
  const budget = brief ? (brief.guidance ? 'Guidance requested' : brief.budget ? brief.currency + ' ' + brief.budget : 'Not provided') : item.budget ? item.currency + ' ' + item.budget.toString() : 'Not provided';
  const legacy = item.answers.filter(a => a.question.key !== BRIEF_KEY);
  return (
    <main className="rcentz-dashboard-frame mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <Link href={back} className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft aria-hidden="true" className="size-4" />{projectId ? 'Back to project' : 'All project briefs'}</Link>
      <header className="relative overflow-hidden rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-widest text-theme-accent">Project onboarding / Overview</p><h1 className="mt-3 break-words text-2xl font-semibold tracking-tight sm:text-3xl">{item.title}</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">{item.service.name}</p></div>
          <div className="flex shrink-0 items-center gap-3"><span className="rounded-full border border-border bg-surface-subtle px-3 py-1.5 text-xs font-semibold">{item.status.toLowerCase().replaceAll('_', ' ')}</span><RcentzSymbol className="size-8 text-foreground" /></div>
        </div>
        <div className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-3">
          {[
            { icon: UsersRound, label: 'Customer', value: item.user.name },
            { icon: CircleDollarSign, label: 'Requested budget', value: budget },
            { icon: CalendarDays, label: 'Delivery preference', value: brief?.timeline || (item.preferredDeadlineAt?.toLocaleDateString('en-GB', { timeZone: 'Africa/Lagos' }) ?? 'To be discussed') }
          ].map(({ icon: Icon, label, value }) => <div key={label} className="min-w-0 rounded-xl bg-surface-subtle p-4"><Icon aria-hidden="true" className="size-4 text-theme-accent" /><p className="mt-3 text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-semibold">{value}</p></div>)}
        </div>
      </header>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <Section title="What the customer wants to build" icon={Layers3}><dl className="space-y-6"><Detail label="Goals and expected outcome">{brief?.goals || item.description}</Detail>{brief ? <><Detail label="Requested features">{brief.features}</Detail><Detail label="Who will use it">{brief.audience}</Detail><Detail label="Additional notes">{brief.notes}</Detail></> : legacy.map(answer => <Detail key={answer.id} label={answer.questionLabel}>{answer.textValue ?? answer.numberValue?.toString() ?? answer.dateValue?.toLocaleDateString('en-GB') ?? (answer.booleanValue !== null ? String(answer.booleanValue) : answer.selectedOptions.map(o => o.option.label).join(', '))}</Detail>)}</dl></Section>
          <Section title="Reference documents and samples" icon={FileText}>
            {data?.attachments.length ? <ul className="grid gap-4 sm:grid-cols-2">{data.attachments.map(file => {
              const url = '/api/project-briefs/' + item.id + '/files/' + file.id;
              return <li key={file.id} className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface-subtle">{file.type.startsWith('image/') ? <a href={url + '?preview=1'} target="_blank" rel="noreferrer" aria-label={'Preview ' + file.name}><Image unoptimized src={url + '?preview=1'} alt={'Customer reference: ' + file.name} width={480} height={240} className="h-40 w-full object-contain bg-background" /></a> : <div aria-hidden="true" className="flex h-24 items-center justify-center border-b border-border bg-background"><FileText className="size-8 text-muted-foreground" /></div>}<div className="p-4"><p className="break-all text-sm font-semibold">{file.name}</p><p className="mt-1 text-xs text-muted-foreground">{Math.ceil(file.size / 1024)} KB</p><a href={url} className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-theme-accent underline underline-offset-4">Download reference<ArrowUpRight aria-hidden="true" className="size-3.5" /></a></div></li>;
            })}</ul> : <p className="rounded-xl border border-dashed border-border p-6 text-sm leading-6 text-muted-foreground">No reference files were supplied with this brief.</p>}
          </Section>
        </div>
        <aside className="min-w-0 space-y-6">
          <Section title="Business context" icon={Building2}><dl className="space-y-5"><Detail label="Company">{brief?.company}</Detail><Detail label="Customer email">{item.user.email}</Detail><Detail label="Starting point">{brief?.startingPoint}</Detail><Detail label="Existing website">{brief?.website}</Detail><Detail label="Ongoing support">{brief ? (brief.ongoingSupport ? 'Requested' : 'Not requested') : 'Not provided'}</Detail></dl></Section>
          <section className="rounded-2xl border border-border bg-background p-5 shadow-sm"><h2 className="text-base font-semibold">Next step</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Review the scope with the customer before agreeing the delivery plan and price.</p><div className="mt-5 flex flex-col gap-3">
            {item.status === 'PENDING' ? <form action={reviewBrief}><input type="hidden" name="requestId" value={item.id} /><button className={actionClass + ' w-full'}>Start reviewing</button></form> : null}
            {item.project ? <Link href={'/admin/projects/' + item.project.id} className={actionClass}>Open project workspace<ArrowUpRight aria-hidden="true" className="size-4" /></Link> : ['PENDING', 'REVIEWING', 'QUOTED', 'APPROVED'].includes(item.status) ? <form action={createPlanningProject}><input type="hidden" name="requestId" value={item.id} /><button className={actionClass + ' w-full'}>Create planning project</button></form> : null}
          </div><p className="mt-5 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">Updated {item.updatedAt.toLocaleString('en-GB', { timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short' })} WAT</p></section>
        </aside>
      </div>
    </main>
  );
}
