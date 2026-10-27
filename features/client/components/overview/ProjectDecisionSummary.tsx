import type { ReactNode } from 'react';
import Link from 'next/link';
import { Check, Circle, ArrowUpRight, BarChart3 } from 'lucide-react';
import { ProjectObservabilityCard } from '@/features/projects/components/ProjectObservabilityCard';
import type { ClientProject } from '@/features/client/server/projects/get-client-project';
import type { ClientProjectAnalytics } from '@/features/analytics/server/read/get-client-project-analytics';

function Sparkline({ values, label }: { values: number[]; label: string }) {
  const max = Math.max(1, ...values);
  const points = values.map((v, i) => `${4 + i * (192 / Math.max(1, values.length - 1))},${46 - (v / max) * 40}`).join(' ');
  return <svg viewBox="0 0 200 52" role="img" aria-label={label} className="h-14 w-full"><polyline points={points} fill="none" stroke="var(--theme-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Card({ title, badge, children, href }: { title: string; badge?: string; children: ReactNode; href?: string }) {
  return <section className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card">
    <header className="flex min-h-14 items-center justify-between gap-3 border-b border-border px-4">
      <h3 className="text-sm font-semibold">{title}{badge ? <span className="ml-2 rounded-full border border-theme-accent/20 bg-theme-accent-faint px-2 py-1 text-xs font-medium text-theme-accent">{badge}</span> : null}</h3>
      {href ? <Link href={href} aria-label={'Open ' + title.toLowerCase()} className="inline-flex size-10 items-center justify-center rounded-lg hover:bg-surface-muted"><ArrowUpRight aria-hidden="true" className="size-4" /></Link> : null}
    </header>
    <div className="flex-1 p-4">{children}</div>
  </section>;
}

function humanize(value: string) {
  return value.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function ProjectDecisionSummary({ project, analytics }: { project: ClientProject; analytics?: ClientProjectAnalytics }) {
  const a = analytics?.available ? analytics : null;
  // The project reader already limits these records to CLIENT/PUBLIC visibility.
  const milestones = project.milestones.filter(m => m.status !== 'CANCELLED');
  const completed = milestones.filter(m => m.status === 'COMPLETED').length;
  return <div className="grid items-stretch gap-4 lg:grid-cols-3">
    <Card title="Milestone Checklist" badge={`${completed}/${milestones.length}`} href="#milestones">
      <div tabIndex={0} role="region" aria-label="Scrollable milestone checklist" className="max-h-64 space-y-2 overflow-y-auto rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {milestones.length ? milestones.slice(0, 8).map(m => {
          const done = m.status === 'COMPLETED';
          return <a href="#milestones" key={m.id} className={'flex items-start gap-3 rounded-lg border p-3 ' + (done ? 'border-theme-accent/20 bg-theme-accent-faint' : 'border-border bg-surface-muted')}>
            {done ? <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-theme-accent" /> : <Circle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
            <span className="min-w-0 flex-1"><span className={'block break-words text-xs font-medium leading-5 ' + (done ? 'line-through text-theme-accent' : '')}>{m.title}</span><span className="mt-1 block text-[11px] text-muted-foreground">{humanize(m.status)}</span></span>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{m.progress}%</span>
          </a>;
        }) : <p className="py-6 text-sm leading-6 text-muted-foreground">No milestones published for this project yet.</p>}
        {milestones.length > 8 ? <p className="px-2 text-xs text-muted-foreground">+{milestones.length - 8} more milestones</p> : null}
      </div>
      <Link href="#milestones" className="mt-4 inline-flex min-h-11 items-center text-xs font-medium hover:underline">Review milestones →</Link>
    </Card>

    <ProjectObservabilityCard mode="customer" href="#milestones" />

    <Card title="Analytics" badge={a?.collection.sample ? 'Sample data' : a ? '30 days' : undefined} href="#analytics">
      {a ? <>
        <div className="grid grid-cols-2 gap-4"><div><p className="text-xs text-muted-foreground">Sessions</p><p className="mt-2 text-2xl font-semibold">{a.summary.sessions.toLocaleString('en-NG')}</p></div><div><p className="text-xs text-muted-foreground">Page views</p><p className="mt-2 text-2xl font-semibold">{a.summary.pageViews.toLocaleString('en-NG')}</p></div></div>
        <div className="mt-5"><Sparkline values={a.daily.map(d => d.sessions)} label="Daily sessions over the last 30 days" /></div>
        <p className="mt-4 text-xs text-muted-foreground">{a.summary.clicks.toLocaleString('en-NG')} recorded clicks · {a.summary.totalEvents.toLocaleString('en-NG')} events</p>
        <Link href="#analytics" className="mt-5 inline-flex min-h-11 items-center text-xs font-semibold hover:underline">View full analytics →</Link>
      </> : <div className="flex min-h-52 flex-col items-center justify-center text-center"><BarChart3 aria-hidden="true" className="size-8 text-muted-foreground" /><h4 className="mt-4 text-sm font-semibold">Understand your project traffic</h4><p className="mt-2 text-xs leading-6 text-muted-foreground">Recorded sessions, page views and engagement will appear once tracking is enabled by the team.</p><Link href="/dashboard/messages" className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-semibold">Discuss analytics</Link></div>}
    </Card>
  </div>;
}
