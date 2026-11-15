'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import {
  Activity, ArrowUpRight, BarChart3, ChevronDown, CircleDot,
  Layers3, Server, ShieldCheck
} from 'lucide-react';
import { ProjectMetricLineChart } from './ProjectMetricLineChart';
import type { RuntimeMetrics } from '@/server/runtime-monitor/read';

type DailyPoint = {
  date: string; label: string; sessions: number; pageViews: number; clicks: number;
};
type AnalyticsData = {
  summary: { sessions: number; pageViews: number; clicks: number };
  daily: DailyPoint[];
} | null;

type Feature = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  expectedOutcome: string | null;
  status: string;
  progress: number;
};
type FeatureEvent = { featureKey: string | null; name: string; count: number };

type Props = {
  projectId: string;
  analytics: AnalyticsData;
  features: Feature[];
  legacyMilestoneMirrors: number;
  featureEvents: FeatureEvent[];
  featureWindowHours: number | null;
  telemetryAvailable: boolean;
  metrics?: RuntimeMetrics;
};

const number = (value: number | null | undefined) => value == null ? '—' : value.toLocaleString('en-NG');
const readable = (value: string) => value.toLowerCase().replaceAll('_', ' ');
const clamp = (value: number) => Math.max(0, Math.min(100, value));
const identity = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

function EventBars({ events }: { events: FeatureEvent[] }) {
  const sorted = [...events].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const max = Math.max(1, ...sorted.map(event => event.count));
  return (
    <div className="space-y-2" aria-label="Recorded SDK event counts">
      {sorted.map(event => (
        <div key={`${event.featureKey ?? 'unregistered'}:${event.name}`} className="space-y-1">
          <div className="flex justify-between gap-2 text-[11px]">
            <span className="min-w-0 break-words text-muted">{event.name.replaceAll('_', ' ')}</span>
            <span className="shrink-0 font-medium tabular-nums text-foreground">{number(event.count)} events</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-theme-accent/10">
            <div className="h-full rounded-full bg-theme-accent" style={{ width: `${(event.count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** A built-in feature is a capability (for example contact.form), NOT a delivery milestone. */
function CapabilityRow({ feature, events, telemetryAvailable, hours }: {
  feature: Feature;
  events: FeatureEvent[];
  telemetryAvailable: boolean;
  hours: number | null;
}) {
  const built = feature.status === 'COMPLETED';
  const active = ['IN_PROGRESS', 'TESTING', 'REVIEW'].includes(feature.status);
  const tone = built
    ? 'border-emerald-500/35 bg-emerald-500/[0.09]'
    : active ? 'border-blue-500/35 bg-blue-500/[0.08]' : 'border-border bg-surface-raised/40';
  const total = events.reduce((sum, event) => sum + event.count, 0);

  return (
    <details className="group/capability overflow-hidden rounded-xl border border-border bg-background">
      <summary className={`flex cursor-pointer list-none items-center gap-2.5 rounded-xl border px-3 py-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-theme-accent [&::-webkit-details-marker]:hidden ${tone}`}>
        <Layers3 className="size-4 shrink-0 text-theme-accent" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block break-words font-semibold">{feature.name}</span>
          <span className="mt-0.5 block text-[10px] capitalize text-muted">
            {built ? 'Built' : readable(feature.status)} · {events.length > 0 ? `${number(total)} SDK events` : 'Usage not measured'}
          </span>
        </span>
        <ChevronDown className="size-3.5 shrink-0 text-muted transition-transform group-open/capability:rotate-180" aria-hidden="true" />
      </summary>
      <div className="space-y-3 border-t border-border bg-background px-3 py-3 text-xs">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground">Why this feature exists</p>
          <p className="mt-1 whitespace-pre-wrap break-words leading-5 text-muted">
            {feature.description || 'Purpose has not been recorded for this capability.'}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground">Intended outcome</p>
          <p className="mt-1 whitespace-pre-wrap break-words leading-5 text-muted">
            {feature.expectedOutcome || 'No expected outcome recorded. SDK events alone cannot establish business success.'}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="font-medium text-foreground">Implementation status</span>
          <span className="capitalize text-muted">{readable(feature.status)} · {clamp(feature.progress)}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-theme-accent/10" role="progressbar"
          aria-label={`${feature.name} implementation progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={clamp(feature.progress)}>
          <div className="h-full rounded-full bg-theme-accent" style={{ width: `${clamp(feature.progress)}%` }} />
        </div>
        <div className="space-y-2 border-t border-border pt-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-foreground">Measured usage</span>
            <span className="text-[10px] text-muted">{hours ? `Last ${hours}h` : 'SDK telemetry'}</span>
          </div>
          {events.length ? (
            <>
              <p className="text-[11px] text-muted">{number(total)} recorded events. Event counts are not unique users or confirmed outcomes.</p>
              <EventBars events={events} />
            </>
          ) : (
            <p className="text-[11px] leading-5 text-muted">
              {telemetryAvailable
                ? 'No instrumented events recorded for this feature in the reporting window.'
                : 'Feature telemetry is not available. Instrument this capability in the project SDK to measure its usage.'}
            </p>
          )}
        </div>
      </div>
    </details>
  );
}

/** Telemetry may contain capabilities that have not yet been registered as ProjectFeature rows. */
function ObservedCapability({ featureKey, events, hours }: { featureKey: string; events: FeatureEvent[]; hours: number | null }) {
  const total = events.reduce((sum, event) => sum + event.count, 0);
  return (
    <details className="group/observed overflow-hidden rounded-xl border border-border bg-background">
      <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-xl px-3 py-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent [&::-webkit-details-marker]:hidden">
        <CircleDot className="size-4 shrink-0 text-theme-accent" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block break-all font-semibold text-foreground">{featureKey}</span>
          <span className="mt-0.5 block text-[10px] text-muted">Observed in SDK · Not in project feature registry</span>
        </span>
        <span className="shrink-0 text-[11px] tabular-nums text-foreground">{number(total)} events</span>
        <ChevronDown className="size-3.5 text-muted transition-transform group-open/observed:rotate-180" aria-hidden="true" />
      </summary>
      <div className="space-y-2 border-t border-border px-3 py-3 text-xs">
        <p className="text-muted">Events from the last {hours ?? 'available'} reporting hours. Register this capability to supply its purpose and expected outcome.</p>
        <EventBars events={events} />
      </div>
    </details>
  );
}

export function ProjectFeatureAnalyticsCard({
  projectId, analytics, features, legacyMilestoneMirrors,
  featureEvents, featureWindowHours, telemetryAvailable
}: Omit<Props, 'metrics'>) {
  const [active, setActive] = useState<'analytics' | 'features'>('analytics');
  const tabId = useId();
  const points = analytics?.daily.slice(-14) ?? [];
  const namedEvents = featureEvents.filter(event => Boolean(event.featureKey));
  const unmatched = namedEvents.filter(event =>
    !features.some(feature => identity(feature.slug) === identity(event.featureKey ?? ''))
  );
  const observedKeys = [...new Set(unmatched.map(event => event.featureKey).filter((key): key is string => Boolean(key)))];

  return (
    <article className="flex h-[320px] min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface" aria-label="Project analytics and built-in features">
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 sm:px-4">
        <div className="flex min-w-0 gap-1" role="tablist" aria-label="Project metrics">
          {(['analytics', 'features'] as const).map(tab => (
            <button key={tab} type="button" role="tab" aria-selected={active === tab}
              aria-controls={`${tabId}-${tab}`} id={`${tabId}-${tab}-tab`}
              onClick={() => setActive(tab)}
              className={`inline-flex min-h-12 items-center gap-1.5 border-b-2 px-2 text-xs font-semibold transition-colors ${active === tab ? 'border-theme-accent text-theme-accent' : 'border-transparent text-muted hover:text-foreground'}`}>
              {tab === 'analytics' ? <BarChart3 className="size-3.5" aria-hidden="true" /> : <Layers3 className="size-3.5" aria-hidden="true" />}
              {tab === 'analytics' ? 'Analytics' : 'Features'}
            </button>
          ))}
        </div>
        <Link href={`/admin/projects/${projectId}?tab=analytics`} aria-label="Open complete project intelligence" className="rounded-md p-1 text-muted hover:text-foreground"><ArrowUpRight className="size-4" aria-hidden="true" /></Link>
      </header>
      <div id={`${tabId}-analytics`} role="tabpanel" aria-labelledby={`${tabId}-analytics-tab`} hidden={active !== 'analytics'} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-3 [scrollbar-width:thin] sm:p-4">
        {analytics ? (
          <>
            <p className="text-[10px] text-muted">Last 14 days · Recorded daily page views and sessions</p>
            <ProjectMetricLineChart
              title="Daily project page views and sessions"
              labels={points.map(item => item.label)}
              series={[
                { name: 'Page views', values: points.map(item => item.pageViews), color: '#168aff' },
                { name: 'Sessions', values: points.map(item => item.sessions), color: '#a78bfa' }
              ]}
            />
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2" aria-label="Recorded project KPIs">
              {[
                { name: 'Page views', count: analytics.summary.pageViews },
                { name: 'Sessions', count: analytics.summary.sessions },
                { name: 'Clicks', count: analytics.summary.clicks }
              ].map(item => <div key={item.name} className="rounded-lg border border-border bg-background p-2"><p className="truncate text-[10px] text-muted" title={item.name}>{item.name}</p><p className="mt-1 text-sm font-semibold tabular-nums text-foreground">{number(item.count)}</p></div>)}
            </div>
            <p className="text-[10px] text-muted">KPI counters cover all recorded time; the graph shows the last 14 days.</p>
          </>
        ) : <div className="flex min-h-44 items-center justify-center rounded-xl border border-dashed border-border p-4 text-center text-xs leading-5 text-muted">Project analytics are not configured or are unavailable. No illustrative measurements are shown.</div>}
      </div>
      <div id={`${tabId}-features`} role="tabpanel" aria-labelledby={`${tabId}-features-tab`} hidden={active !== 'features'} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-3 [scrollbar-width:thin] sm:p-4">
        <p className="text-[11px] font-semibold text-foreground">Built-in project capabilities <span className="font-normal text-muted">({features.length} registered)</span></p>
        {features.length ? (
          <div className="space-y-2">
            {features.map(feature => <CapabilityRow key={feature.id} feature={feature}
              events={featureEvents.filter(event => Boolean(event.featureKey) && identity(event.featureKey ?? '') === identity(feature.slug))}
              telemetryAvailable={telemetryAvailable} hours={featureWindowHours} />)}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border p-3 text-xs leading-5 text-muted">
            No separately registered built-in features. Register real capabilities—such as a contact form or live chat—and instrument their SDK events to measure usage.
          </p>
        )}
        {legacyMilestoneMirrors > 0 ? (
          <p className="text-[10px] leading-4 text-muted">
            {legacyMilestoneMirrors} legacy feature record(s) repeat milestone names and are excluded from this capability view. No records were deleted.
          </p>
        ) : null}
        {observedKeys.length > 0 ? (
          <div className="space-y-2 border-t border-border pt-3">
            <p className="text-[11px] font-semibold text-foreground">SDK-observed capabilities ({observedKeys.length})</p>
            {observedKeys.map(key => (
              <ObservedCapability key={key} featureKey={key} hours={featureWindowHours}
                events={unmatched.filter(event => event.featureKey === key)} />
            ))}
          </div>
        ) : null}
        {features.length > 0 && !telemetryAvailable ? (
          <p className="text-[10px] leading-4 text-muted">The SDK feature-event reader is unavailable. Implementation progress does not measure actual feature usage.</p>
        ) : null}
      </div>
      <Link href={`/admin/projects/${projectId}?tab=analytics`} className="flex shrink-0 items-center justify-between border-t border-border px-4 py-2.5 text-xs font-medium text-foreground hover:bg-surface-raised">Open full intelligence <ArrowUpRight className="size-3.5" aria-hidden="true" /></Link>
    </article>
  );
}

export function ProjectRuntimeChartCard({ projectId, metrics }: { projectId: string; metrics?: RuntimeMetrics }) {
  const [selection, setSelection] = useState<'requests' | 'functions' | 'errors'>('requests');
  const rows = [
    { key: 'requests' as const, label: 'Requests', fullLabel: 'Instrumented requests', value: metrics?.requests?.value, unit: '', points: metrics?.requests?.points },
    { key: 'functions' as const, label: 'Functions', fullLabel: 'Instrumented functions', value: metrics?.functions?.value, unit: '', points: metrics?.functions?.points },
    { key: 'errors' as const, label: 'Error rate', fullLabel: 'Instrumented error rate', value: metrics?.errors?.value, unit: '%', points: metrics?.errors?.points }
  ];
  const current = rows.find(row => row.key === selection) ?? rows[0];
  const state = !metrics ? 'Unavailable' : metrics.state === 'ACTIVE' ? 'Receiving measurements' : metrics.state === 'AWAITING_DATA' ? 'Awaiting data' : 'Not instrumented';

  return (
    <article className="flex h-[320px] min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface" aria-label="Project runtime observability">
      <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3.5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground"><Activity className="size-4 text-theme-accent" aria-hidden="true" /> Observability <span className="text-[11px] font-normal text-muted">6h</span></h2>
        <Link href={`/admin/projects/${projectId}?tab=analytics`} aria-label="Open technical intelligence" className="text-muted hover:text-foreground"><ArrowUpRight className="size-4" aria-hidden="true" /></Link>
      </header>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-3 [scrollbar-width:thin] sm:p-4">
        <div className="flex items-center justify-between gap-2 text-[11px]"><span className="inline-flex items-center gap-1.5 text-foreground"><Server className="size-3.5 text-theme-accent" aria-hidden="true" /> Runtime collection</span><span className="text-right text-muted">{state}</span></div>
        <div className="grid grid-cols-3 gap-1.5">
          {rows.map(row => <button key={row.key} type="button" aria-pressed={selection === row.key} onClick={() => setSelection(row.key)}
            className={`min-w-0 rounded-lg border p-2 text-left transition-colors ${selection === row.key ? 'border-theme-accent/50 bg-theme-accent/[0.08]' : 'border-border bg-background hover:bg-surface-raised'}`}>
            <span className="block truncate text-[10px] text-muted" title={row.fullLabel}>{row.label}</span>
            <span className="mt-1 block text-sm font-semibold tabular-nums text-foreground">{number(row.value)}{row.value == null ? '' : row.unit}</span>
          </button>)}
        </div>
        <ProjectMetricLineChart title={`${current.fullLabel}, ordered six-hour reporting buckets`} series={current.points ? [{ name: current.label, values: current.points, color: '#168aff' }] : []} unit={current.unit} />
        <details className="rounded-lg border border-border bg-background px-3 py-2 text-xs">
          <summary className="flex cursor-pointer items-center gap-2 font-semibold text-foreground"><ShieldCheck className="size-3.5 text-theme-accent" aria-hidden="true" /> Collection details</summary>
          <div className="mt-2 space-y-1.5 border-t border-border pt-2 text-muted"><p>Connected sources: {metrics ? number(metrics.sourceCount) : 'Unavailable'}</p><p>Last measurement: {metrics?.lastRecordedAt ? new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(metrics.lastRecordedAt)) : 'Not recorded'}</p><p>These are instrumented measurements, not a verification of website uptime.</p></div>
        </details>
      </div>
      <Link href={`/admin/projects/${projectId}?tab=analytics`} className="flex shrink-0 items-center justify-between border-t border-border px-4 py-2.5 text-xs font-medium text-foreground hover:bg-surface-raised">Open technical intelligence <ArrowUpRight className="size-3.5" aria-hidden="true" /></Link>
    </article>
  );
}
