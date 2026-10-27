import type { RuntimeMetrics } from '@/server/runtime-monitor/read';
import Link from 'next/link';
import { ArrowUpRight, BarChart3, Check, ChevronRight, Circle } from 'lucide-react';
import { ProjectObservabilityCard } from '@/features/projects/components/ProjectObservabilityCard';
import type { AdminProject } from '@/features/admin/server/projects/get-admin-project';
import type { ProjectActivitySummary } from '@/server/rcentz-api/project-activity-client';
import type { ClientProjectAnalytics } from '@/features/analytics/server/read/get-client-project-analytics';

type Props = {
  project: AdminProject;
  activity?: ProjectActivitySummary;
  analytics?: ClientProjectAnalytics | null;
  runtimeMetrics?: RuntimeMetrics;
};

function formatCount(value: number) {
  return value.toLocaleString('en-NG');
}

export function AdminProjectMonitoringCards({ project, activity, analytics, runtimeMetrics }: Props) {
  const milestones = project.milestones.filter(m => m.status !== 'CANCELLED');
  const completed = milestones.filter(m => m.status === 'COMPLETED').length;
  const metrics = analytics?.available ? analytics : null;
  const analyticsLabel = metrics
    ? `${metrics.collection.sample ? 'Sample · ' : ''}${metrics.collection.status.toLowerCase()}`
    : analytics?.reason === 'NOT_CONFIGURED' ? 'Not configured'
    : analytics?.reason === 'CLIENT_HIDDEN' ? 'Not available'
    : 'Unavailable';

  return (
    <section aria-label="Project monitoring" className="grid items-stretch gap-4 lg:grid-cols-3">
      <article className="flex h-[420px] min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface lg:h-[460px]">
        <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-4">
          <h2 className="text-sm font-semibold text-foreground">Milestone Checklist <span className="ml-2 rounded-full bg-surface-muted px-2 py-1 text-xs text-muted">{completed}/{milestones.length}</span></h2>
          <a href="#project-milestones" aria-label="Manage milestones"><ArrowUpRight className="size-4 text-muted" /></a>
        </header>
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-4 [scrollbar-width:thin] [scrollbar-color:transparent_transparent] hover:[scrollbar-color:var(--border)_transparent] focus-within:[scrollbar-color:var(--border)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-border focus-within:[&::-webkit-scrollbar-thumb]:bg-border [mask-image:linear-gradient(to_bottom,transparent,black_12px,black_95%,transparent)]">
          {milestones.length ? milestones.map(m => (
            <a href="#project-milestones" key={m.id} className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs ${m.status === 'COMPLETED' ? 'bg-theme-accent-faint text-theme-accent' : 'bg-background text-foreground'}`}>
              {m.status === 'COMPLETED' ? <Check className="size-4 shrink-0" /> : <Circle className="size-4 shrink-0 text-muted" />}
              <span className={`min-w-0 flex-1 truncate ${m.status === 'COMPLETED' ? 'line-through' : ''}`}>{m.title}</span>
              <span className="tabular-nums">{m.progress}%</span>
            </a>
          )) : <p className="px-3 py-5 text-xs text-muted">No milestones recorded.</p>}
        </div>
        <a href="#project-milestones" className="flex shrink-0 items-center gap-2 border-t border-border px-4 py-3 text-xs font-medium text-foreground hover:underline">Review and edit milestones <ChevronRight className="size-3.5" /></a>
      </article>

      <ProjectObservabilityCard mode="admin" href="#project-development" activity={activity}  metrics={runtimeMetrics} />

      <article className="flex h-[420px] min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface lg:h-[460px]">
        <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground"><BarChart3 className="size-4 text-theme-accent" /> Analytics</h2>
          <Link href={`/admin/projects/${project.id}?tab=analytics`} aria-label="Open analytics"><ChevronRight className="size-4 text-muted" /></Link>
        </header>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5 [scrollbar-width:thin] [scrollbar-color:transparent_transparent] hover:[scrollbar-color:var(--border)_transparent] focus-within:[scrollbar-color:var(--border)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-border focus-within:[&::-webkit-scrollbar-thumb]:bg-border [mask-image:linear-gradient(to_bottom,transparent,black_12px,black_95%,transparent)]">
          <div className="flex items-center justify-between gap-3 border-b border-border pb-3 text-xs"><span className="text-muted">Collection status</span><span className="font-medium capitalize text-foreground">{analyticsLabel}</span></div>
          {metrics ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-background p-3"><p className="text-[11px] text-muted">Sessions</p><p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{formatCount(metrics.summary.sessions)}</p></div>
                <div className="rounded-xl border border-border bg-background p-3"><p className="text-[11px] text-muted">Page views</p><p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{formatCount(metrics.summary.pageViews)}</p></div>
              </div>
              <div className="flex items-center justify-between gap-3 text-xs"><span className="text-muted">Conversions</span><span className="font-semibold tabular-nums text-foreground">{formatCount(metrics.summary.conversions)}</span></div>
              <p className="text-[11px] leading-5 text-muted">{metrics.summary.totalEvents === 0 ? 'No recorded events yet. Verify tracking and ingestion for this project.' : 'Recorded project analytics. Daily trends are available in the Analytics tab.'}</p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-5 text-center">
              <BarChart3 className="size-6 text-muted" />
              <p className="text-xs leading-5 text-muted">{analytics?.reason === 'NOT_CONFIGURED' ? 'Analytics has not been configured for this project.' : 'Analytics measurements are not available for this project.'}</p>
            </div>
          )}
        </div>
        <Link href={`/admin/projects/${project.id}?tab=analytics`} className="flex shrink-0 items-center gap-2 border-t border-border px-4 py-3 text-xs font-medium text-foreground hover:underline">View analytics <ChevronRight className="size-3.5" /></Link>
      </article>
    </section>
  );
}
