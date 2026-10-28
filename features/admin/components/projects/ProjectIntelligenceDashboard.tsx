import { Activity, BarChart3, Gauge, Layers3 } from 'lucide-react';
import type { ProjectIntelligence, IntelligenceGroup } from '@/server/intelligence/read-project-intelligence';
import type { RuntimeMetrics } from '@/server/runtime-monitor/read';

function count(groups: IntelligenceGroup[], kind: string) {
  return groups.filter(group => group.kind === kind).reduce((sum, group) => sum + group.count, 0);
}
function Panel({ title, description, icon: Icon, groups, empty }: {
  title: string; description: string; icon: typeof Gauge; groups: IntelligenceGroup[]; empty: string;
}) {
  return <section className="min-w-0 rounded-2xl border border-border bg-surface p-5">
    <div className="flex items-start gap-3"><Icon className="mt-0.5 size-5 shrink-0 text-theme-accent" />
      <div><h3 className="text-sm font-semibold text-foreground">{title}</h3><p className="mt-1 text-xs text-muted">{description}</p></div>
    </div>
    {groups.length ? <div className="mt-5 space-y-2">{groups.slice(0,12).map(group =>
      <div key={`${group.kind}:${group.featureKey ?? ''}:${group.name}`} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-xs">
        <div className="min-w-0"><p className="truncate font-medium text-foreground">{group.featureKey || group.name}</p>{group.featureKey && group.featureKey !== group.name ? <p className="mt-0.5 truncate text-muted">{group.name}</p> : null}</div>
        <span className="shrink-0 font-semibold tabular-nums text-foreground">{group.count.toLocaleString('en-NG')}</span>
      </div>)}{groups.length > 12 ? <p className="text-xs text-muted">Showing 12 of {groups.length} event groups.</p> : null}</div> : <p className="mt-5 text-xs leading-5 text-muted">{empty}</p>}
  </section>;
}

export function ProjectIntelligenceDashboard({ intelligence, runtimeMetrics }: {intelligence: ProjectIntelligence | null; runtimeMetrics?: RuntimeMetrics}) {
  const groups = intelligence?.groups ?? [];
  const feature = groups.filter(group=>group.kind==='feature');
  const performance = groups.filter(group=>group.kind==='performance');
  const runtime = groups.filter(group=>group.kind==='runtime');
  const analytics = groups.filter(group=>group.kind==='analytics');
  const summary = [
    {title:'SDK events',value:intelligence?.total},
    {title:'Feature events',value:intelligence ? count(groups,'feature') : undefined},
    {title:'Performance events',value:intelligence ? count(groups,'performance') : undefined},
    {title:'Runtime sources',value:runtimeMetrics?.sourceCount}
  ];
  return <div className="space-y-5" aria-label="Project intelligence dashboard">
    <header className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-foreground">Project Intelligence</h2><p className="mt-1 text-xs text-muted">Performance, built-in features and operational observability for this project only.</p></div><span className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted">Last 24 hours · SDK</span></header>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{summary.map(item=><div key={item.title} className="rounded-xl border border-border bg-surface p-4"><p className="text-xs text-muted">{item.title}</p><p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{item.value == null ? '—' : item.value.toLocaleString('en-NG')}</p></div>)}</div>
    {!intelligence ? <p className="rounded-xl border border-border bg-surface p-4 text-xs text-muted">SDK reporting is unavailable or not configured. Existing analytics and observability remain accessible.</p> : intelligence.total === 0 ? <p className="rounded-xl border border-border bg-surface p-4 text-xs text-muted">SDK connected. No intelligence events recorded for this project in the last 24 hours.</p> : null}
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <section className="min-w-0 rounded-2xl border border-border bg-surface p-5"><div className="flex items-start gap-3"><BarChart3 className="mt-0.5 size-5 shrink-0 text-theme-accent"/><div><h3 className="text-sm font-semibold text-foreground">Analytics</h3><p className="mt-1 text-xs text-muted">Privacy-safe project traffic mirrored by the SDK.</p></div></div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-xs">{[
          ['Sessions', intelligence?.analytics.sessions], ['Page views', intelligence?.analytics.pageViews],
          ['Clicks', intelligence?.analytics.clicks], ['Routes', intelligence?.analytics.routes]
        ].map(([label,value])=><div key={String(label)} className="rounded-lg border border-border bg-background p-3"><p className="text-muted">{label}</p><p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{typeof value === 'number' ? value.toLocaleString('en-NG') : '-'}</p></div>)}</div>
        {!analytics.length ? <p className="mt-4 text-xs leading-5 text-muted">No SDK analytics events in this window. Legacy analytics remain available while projects adopt the SDK collector.</p> : null}
      </section>
      <Panel title="Performance" icon={Gauge} description="Recorded operation events; detailed latency percentiles require future aggregate support." groups={performance} empty="No SDK performance events in this window." />
      <Panel title="Built-in Features" icon={Layers3} description="Instrumented feature usage by event and feature key." groups={feature} empty="No instrumented feature events in this window." />
      <section className="min-w-0 rounded-2xl border border-border bg-surface p-5"><div className="flex items-start gap-3"><Activity className="mt-0.5 size-5 shrink-0 text-theme-accent"/><div><h3 className="text-sm font-semibold text-foreground">Observability</h3><p className="mt-1 text-xs text-muted">RM-03 runtime monitoring and SDK runtime events.</p></div></div>
        <div className="mt-5 space-y-3 text-xs"><div className="flex justify-between gap-2"><span className="text-muted">RM-03 status (6h)</span><span className="font-medium text-foreground">{runtimeMetrics?.state?.replaceAll('_',' ').toLowerCase() ?? 'Unavailable'}</span></div>
        <div className="flex justify-between gap-2"><span className="text-muted">Instrumented requests (6h)</span><span className="font-semibold text-foreground">{runtimeMetrics?.requests?.value?.toLocaleString('en-NG') ?? '—'}</span></div>
        <div className="flex justify-between gap-2"><span className="text-muted">Function calls (6h)</span><span className="font-semibold text-foreground">{runtimeMetrics?.functions?.value?.toLocaleString('en-NG') ?? '—'}</span></div>
        <div className="flex justify-between gap-2"><span className="text-muted">Error rate (6h)</span><span className="font-semibold text-foreground">{runtimeMetrics?.errors ? `${runtimeMetrics.errors.value}%` : '—'}</span></div>
        <div className="flex justify-between gap-2"><span className="text-muted">SDK runtime events (24h)</span><span className="font-semibold text-foreground">{intelligence ? count(runtime,'runtime').toLocaleString('en-NG') : '—'}</span></div>
        </div>
        <p className="mt-4 text-xs leading-5 text-muted">RM-03 metrics are retained; SDK runtime event counts are additional and must not be added to RM-03 request totals.</p>
      </section>
    </div>
    <p className="text-xs text-muted">SDK numbers represent received event counts, not unique users, success rates or response-time averages. No sample figures are displayed.</p>
  </div>;
}
