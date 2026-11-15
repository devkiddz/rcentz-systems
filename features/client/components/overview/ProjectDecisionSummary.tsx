'use client';

import { useId, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import {
  Activity, ArrowUpRight, BarChart3, CheckCircle2, ChevronDown,
  Circle, Layers3
} from 'lucide-react';
import type { RuntimeMetrics } from '@/server/runtime-monitor/read';
import type { ProjectActivitySummary } from '@/server/rcentz-api/project-activity-client';
import type { ClientProjectAnalytics } from '@/features/analytics/server/read/get-client-project-analytics';

type ChartDay = { label: string; sessions: number; pageViews: number };
type CompactAnalytics = {
  summary: { sessions: number; pageViews: number; clicks: number; totalEvents?: number };
  daily: ChartDay[];
  sample?: boolean;
  featureActions?: number;
};

type Props = {
  mode?: 'admin' | 'customer';
  analyticsData?: CompactAnalytics | null;
  features?: Array<{ id: string; name: string; status: string; progress: number }>;
  project: {
    id: string;
    _count: { features: number };
    milestones: Array<{
      id: string;
      title: string;
      description: string | null;
      purpose: string | null;
      expectedOutcome: string | null;
      status: string;
      priority: string;
      progress: number;
      dueDate: string | null;
    }>;
  };
  analytics?: ClientProjectAnalytics;
  runtimeMetrics?: RuntimeMetrics;
  activity?: ProjectActivitySummary;
};

type View = 'observability' | 'features';
const fmt = (value: number | null | undefined) =>
  value == null ? '—' : value.toLocaleString('en-NG');
const readable = (value: string) =>
  value.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase());

function Trend({ values, label }: { values?: number[]; label: string }) {
  if (!values?.length) {
    return <p className="text-right text-[10px] text-muted">No recorded trend</p>;
  }
  const min = Math.min(...values);
  const range = Math.max(1, Math.max(...values) - min);
  const points = values.map((value, i) =>
    `${4 + (i * 192) / Math.max(1, values.length - 1)},${44 - ((value - min) / range) * 36}`
  ).join(' ');
  return (
    <svg viewBox="0 0 200 52" role="img" aria-label={label}
      preserveAspectRatio="none" className="h-10 w-full min-w-0">
      <polyline points={points} fill="none" stroke="var(--theme-accent)"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type AnalyticsPoint = { label: string; sessions: number; pageViews: number };

function AnalyticsTrend({ points }: { points: AnalyticsPoint[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const values = points.slice(-30);
  const lastIndex = values.length - 1;
  const selected = hovered !== null ? values[hovered] : null;
  const max = Math.max(1, ...values.flatMap(point => [point.sessions, point.pageViews]));
  const position = (index: number) =>
    8 + (index * 284) / Math.max(1, lastIndex);
  const y = (value: number) => 83 - (value / max) * 72;
  const path = (key: 'sessions' | 'pageViews') =>
    values.map((point, index) =>
      `${index === 0 ? 'M' : 'L'}${position(index).toFixed(2)},${y(point[key]).toFixed(2)}`
    ).join(' ');

  function inspect(event: MouseEvent<SVGSVGElement>) {
    if (!values.length) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width) return;
    const ratio = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
    setHovered(Math.min(lastIndex, Math.round(ratio * lastIndex)));
  }

  return (
    <div className="rounded-xl border border-border bg-background p-3">
      {values.length ? (
        <>
          <svg
            role="img"
            aria-label="Daily sessions and page views. Hover to inspect individual dates."
            viewBox="0 0 300 92"
            preserveAspectRatio="none"
            className="block h-[124px] w-full cursor-crosshair touch-pan-y"
            onMouseMove={inspect}
            onMouseLeave={() => setHovered(null)}>
            <line x1="8" x2="292" y1="83" y2="83" stroke="currentColor" strokeOpacity="0.2" />
            <path d={path('pageViews')} fill="none" stroke="#a78bfa" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
            <path d={path('sessions')} fill="none" stroke="#006DFD" strokeWidth="2.4" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
            {hovered !== null && selected ? (
              <>
                <line x1={position(hovered)} x2={position(hovered)} y1="5" y2="83" stroke="currentColor" strokeOpacity="0.35" strokeDasharray="3 3" />
                <circle cx={position(hovered)} cy={y(selected.sessions)} r="4" fill="#006DFD" stroke="currentColor" strokeWidth="0.8" />
                <circle cx={position(hovered)} cy={y(selected.pageViews)} r="4" fill="#a78bfa" stroke="currentColor" strokeWidth="0.8" />
              </>
            ) : null}
          </svg>
          <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-muted">
            <span>{values[0]?.label}</span>
            <span>Last {values.length} recorded days</span>
            <span>{values[lastIndex]?.label}</span>
          </div>
          <div className="mt-2 min-h-6 text-[11px]">
            {selected ? (
              <p className="flex flex-wrap gap-x-3 gap-y-0.5">
                <span className="font-medium text-foreground">{selected.label}</span>
                <span className="text-muted">Sessions <strong className="tabular-nums text-foreground">{fmt(selected.sessions)}</strong></span>
                <span className="text-muted">Views <strong className="tabular-nums text-foreground">{fmt(selected.pageViews)}</strong></span>
              </p>
            ) : <p className="text-muted">Hover over the chart to inspect daily values.</p>}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted">
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#006DFD]" /> Sessions</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-violet-400" /> Page views</span>
          </div>
        </>
      ) : (
        <div className="flex h-24 items-center justify-center text-xs text-muted">No daily traffic measurements recorded.</div>
      )}
    </div>
  );
}

export function ProjectDecisionSummary({ mode = 'customer', project, analytics, analyticsData, features, runtimeMetrics, activity }: Props) {
  const [tab, setTab] = useState<View>('observability');
  const tabId = useId();
  const milestones = project.milestones.filter(item => item.status !== 'CANCELLED');
  const completed = milestones.filter(item => item.status === 'COMPLETED').length;
  const customerAnalytics = analytics?.available ? analytics : null;
  const a: CompactAnalytics | null = analyticsData ?? (customerAnalytics ? {
    summary: {
      sessions: customerAnalytics.summary.sessions,
      pageViews: customerAnalytics.summary.pageViews,
      clicks: customerAnalytics.summary.clicks,
      totalEvents: customerAnalytics.summary.totalEvents
    },
    daily: customerAnalytics.daily.map(day => ({
      label: day.label, sessions: day.sessions, pageViews: day.pageViews
    })),
    sample: customerAnalytics.collection.sample,
    featureActions: customerAnalytics.summary.productViews + customerAnalytics.summary.serviceViews +
      customerAnalytics.summary.addToCarts + customerAnalytics.summary.removeFromCarts +
      customerAnalytics.summary.checkoutStarted + customerAnalytics.summary.purchases +
      customerAnalytics.summary.serviceRequests + customerAnalytics.summary.signUps + customerAnalytics.summary.logins
  } : null);
  const featureActions = a?.featureActions ?? null;
  const metrics = [
    { key: 'requests', label: 'IFR', full: 'Instrumented requests', metric: runtimeMetrics?.requests },
    { key: 'functions', label: 'IFN', full: 'Instrumented functions', metric: runtimeMetrics?.functions },
    { key: 'errors', label: 'IFER', full: 'Instrumented error rate', metric: runtimeMetrics?.errors }
  ];
  const state = runtimeMetrics?.state === 'ACTIVE' ? 'Active'
    : runtimeMetrics?.state === 'AWAITING_DATA' ? 'Awaiting measurements'
    : runtimeMetrics?.state === 'NOT_INSTRUMENTED' ? 'Not instrumented' : 'Unavailable';
  const basePath = mode === 'admin' ? `/admin/projects/${project.id}` : `/dashboard/projects/${project.id}`;
  const analyticsHref = `${basePath}?tab=analytics`;
  const milestonesHref = mode === 'admin' ? '#advanced-milestone-management' : `${basePath}?tab=milestones`;
  const activityHref = mode === 'admin' ? `${basePath}?tab=logs` : `${basePath}?tab=activity`;

  return (
    <section aria-label="Project delivery and intelligence"
      className="grid min-w-0 items-stretch gap-4 lg:grid-cols-3">
      <article className="flex h-[320px] min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface"
        aria-label="Milestone checklist">
        <header className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-border px-4">
          <h3 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground">
            <span>Milestone Checklist</span>
            <span className="shrink-0 rounded-full border border-theme-accent/20 bg-theme-accent-faint px-2 py-1 text-xs font-medium text-theme-accent">
              {completed}/{milestones.length}
            </span>
          </h3>
          <Link href={milestonesHref} aria-label="Open milestone roadmap"
            className="shrink-0 rounded-md p-2 text-foreground hover:bg-surface-muted">
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </header>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-3 [scrollbar-width:thin] sm:p-4">
          {milestones.length ? milestones.map(milestone => {
            const done = milestone.status === 'COMPLETED';
            return (
              <details key={milestone.id} className={`group/milestone overflow-hidden rounded-xl border ${done ? 'border-theme-accent/40 bg-theme-accent/[0.09]' : 'border-red-500/40 bg-red-500/[0.10]'}`}>
                <summary className="flex cursor-pointer list-none items-start gap-3 px-3 py-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-theme-accent [&::-webkit-details-marker]:hidden">
                  {done ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-theme-accent" aria-hidden="true" />
                    : <Circle className="mt-0.5 size-4 shrink-0 text-red-400" aria-hidden="true" />}
                  <span className="min-w-0 flex-1">
                    <span className={`block break-words font-semibold leading-5 ${done ? 'text-theme-accent line-through' : 'text-red-400'}`}>
                      {milestone.title}
                    </span>
                    <span className={`mt-1 block text-[11px] ${done ? 'text-theme-accent' : 'text-red-400'}`}>{readable(milestone.status)}</span>
                  </span>
                  <span className={`shrink-0 tabular-nums ${done ? 'text-theme-accent' : 'text-red-400'}`}>{milestone.progress}%</span>
                  <ChevronDown className="mt-0.5 size-4 shrink-0 text-muted transition-transform group-open/milestone:rotate-180" aria-hidden="true" />
                </summary>
                <div className="space-y-2 border-t border-border px-3 py-3 text-[11px] leading-5">
                  {milestone.description ? <p className="whitespace-pre-wrap text-muted">{milestone.description}</p> : null}
                  {milestone.purpose ? <p><strong className="text-foreground">Purpose:</strong> <span className="text-muted">{milestone.purpose}</span></p> : null}
                  {milestone.expectedOutcome ? <p><strong className="text-foreground">Expected outcome:</strong> <span className="text-muted">{milestone.expectedOutcome}</span></p> : null}
                  <p className="text-muted">Progress: {milestone.progress}% · Priority: {readable(milestone.priority)}</p>
                  <p className="text-muted">Target: {milestone.dueDate
                    ? new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(new Date(milestone.dueDate))
                    : 'Not set'}</p>
                  <Link href={milestonesHref} className="inline-flex font-medium text-theme-accent hover:underline">
                    View full delivery record <ArrowUpRight className="ml-1 size-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </details>
            );
          }) : <p className="py-6 text-xs text-muted">No milestones published for this project yet.</p>}
        </div>
        <Link href={milestonesHref}
          className="flex min-h-11 shrink-0 items-center gap-2 border-t border-border px-4 text-xs font-medium text-foreground hover:bg-surface-muted">
          Review milestones <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </article>

      <article className="flex h-[320px] min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface"
        aria-label="Project observability, features and analytics">
        <header className="flex min-h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-3 sm:px-4">
          <div role="tablist" aria-label="Project intelligence" className="flex min-w-0 gap-1">
            {(['observability', 'features'] as const).map(view => (
              <button type="button" role="tab" key={view}
                id={`${tabId}-${view}-tab`} aria-controls={`${tabId}-${view}`}
                aria-selected={tab === view} onClick={() => setTab(view)}
                className={`inline-flex min-h-14 items-center gap-1.5 border-b-2 px-2 text-xs font-semibold transition-colors ${tab === view
                  ? 'border-theme-accent text-theme-accent' : 'border-transparent text-muted hover:text-foreground'}`}>
                {view === 'observability' ? <Activity className="size-3.5" aria-hidden="true" />
                  : <Layers3 className="size-3.5" aria-hidden="true" />}
                {view === 'observability' ? 'Observability' : 'Features'}
              </button>
            ))}
          </div>
          <span className="shrink-0 text-[11px] text-muted">{tab === 'observability' ? '6h' : 'Capabilities'}</span>
        </header>
        <div role="tabpanel" id={`${tabId}-observability`} aria-labelledby={`${tabId}-observability-tab`}
          hidden={tab !== 'observability'}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-3 [scrollbar-width:thin] sm:p-4">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-muted">Runtime collection</span>
            <span className="font-medium text-foreground">{state}</span>
          </div>
          {metrics.map(row => (
            <div key={row.key} className="grid min-w-0 grid-cols-[minmax(0,100px)_minmax(0,1fr)] items-center gap-2 border-b border-border/60 py-1.5 last:border-b-0">
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-baseline gap-2 whitespace-nowrap">
                  <span className="text-xs font-medium text-muted" title={row.full}>{row.label}</span>
                  <strong className="text-sm font-semibold tabular-nums text-foreground">{fmt(row.metric?.value)}{row.metric?.value == null || row.key !== 'errors' ? '' : '%'}</strong>
                </div>
                <p className="text-[10px] leading-4 text-muted">{row.key === 'requests' ? 'Requests' : row.key === 'functions' ? 'Functions' : 'Error rate'}</p>
              </div>
              <Trend values={row.metric?.points} label={row.full} />
            </div>
          ))}
          <div className="space-y-1 border-t border-border pt-3 text-[11px] text-muted">
            <p>Source: {activity?.state ? readable(activity.state) : 'Unavailable'}</p>
            {activity?.latestCommit ? <p className="break-words">Latest recorded commit: {activity.latestCommit.message}</p> : null}
            <p>Runtime measurements are not proof of website uptime or milestone approval.</p>
          </div>
        </div>
        <div role="tabpanel" id={`${tabId}-features`} aria-labelledby={`${tabId}-features-tab`}
          hidden={tab !== 'features'}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-3 [scrollbar-width:thin] sm:p-4">
          <div className="rounded-xl border border-border bg-background px-3 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <Layers3 className="size-4 text-theme-accent" aria-hidden="true" /> Registered capabilities
              </div>
              <strong className="text-lg font-semibold tabular-nums text-foreground">{fmt(project._count.features)}</strong>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-muted">
              Features registered for this project. This count does not include milestone completion.
            </p>
          </div>
          {featureActions === null ? (
            <p className="rounded-lg border border-dashed border-border p-3 text-[11px] leading-5 text-muted">
              Feature usage has not been measured for this project.
            </p>
          ) : (
            <div className="rounded-xl border border-border bg-background p-3">
              <p className="text-[11px] text-muted">Recorded feature actions</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{fmt(featureActions)}</p>
              <p className="mt-2 text-[10px] leading-4 text-muted">Actions are telemetry events, not unique users or verified outcomes.</p>
            </div>
          )}
          {features?.length ? (
            <div className="space-y-2" aria-label="Registered capabilities">
              {features.map(feature => (
                <div key={feature.id} className="rounded-lg border border-border bg-background px-3 py-2 text-xs">
                  <p className="font-medium text-foreground">{feature.name}</p>
                  <p className="mt-1 text-muted">{readable(feature.status)} · {feature.progress}% implementation</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] leading-4 text-muted">Milestone names are not built-in features. Capability details appear when registered.</p>
          )}
        </div>
        <Link href={tab === 'observability' ? activityHref : analyticsHref}
          className="flex min-h-11 shrink-0 items-center justify-between gap-2 border-t border-border px-4 text-xs font-medium text-foreground hover:bg-surface-muted">
          {tab === 'observability' ? 'Review delivery updates' : 'Review project intelligence'}
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </article>

      <article className="flex h-[320px] min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface"
        aria-label="Project analytics">
        <header className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-border px-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <BarChart3 className="size-4 text-theme-accent" aria-hidden="true" /> Analytics
          </h3>
          <Link href={analyticsHref} aria-label="Open project analytics"
            className="shrink-0 rounded-md p-2 text-foreground hover:bg-surface-muted">
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </header>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-3 [scrollbar-width:thin] sm:p-4">
          {a ? (
            <>
              <AnalyticsTrend points={a.daily} />
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Sessions', value: a.summary.sessions },
                  { label: 'Page views', value: a.summary.pageViews },
                  { label: 'Clicks', value: a.summary.clicks },
                  { label: 'Events', value: a.summary.totalEvents ?? null }
                ].map(item => (
                  <div key={item.label} className="min-w-0 rounded-lg border border-border bg-background p-3">
                    <p className="truncate text-[11px] text-muted" title={item.label}>{item.label}</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{fmt(item.value)}</p>
                  </div>
                ))}
              </div>
              {a.sample ? <p className="text-[11px] text-muted">Sample analytics data</p> : null}
            </>
          ) : (
            <div className="flex min-h-44 flex-col items-center justify-center gap-2 text-center">
              <BarChart3 className="size-7 text-muted" aria-hidden="true" />
              <h4 className="text-sm font-semibold text-foreground">Understand your project traffic</h4>
              <p className="text-xs leading-5 text-muted">Recorded sessions, page views and engagement will appear when tracking is enabled.</p>
              <Link href="/dashboard/messages" className="mt-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground">Discuss analytics</Link>
            </div>
          )}
        </div>
        <Link href={analyticsHref}
          className="flex min-h-11 shrink-0 items-center justify-between gap-2 border-t border-border px-4 text-xs font-medium text-foreground hover:bg-surface-muted">
          Open full analytics <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </article>
    </section>
  );
}
