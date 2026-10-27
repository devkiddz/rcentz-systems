import Link from 'next/link';
import { Activity, ChevronRight } from 'lucide-react';
import type { ProjectActivitySummary } from '@/server/rcentz-api/project-activity-client';

type Metric = {
  label: string;
  value: number | null;
  unit?: string;
  points?: number[];
};

type Props = {
  mode: 'admin' | 'customer';
  href: string;
  metrics?: { requests?: Metric; functions?: Metric; errors?: Metric };
  activity?: ProjectActivitySummary;
};

function Trend({ points, label }: { points?: number[]; label: string }) {
  if (!points?.length) {
    return <div className="flex h-12 items-center justify-center rounded-md border border-dashed border-border text-[10px] text-muted">No recorded trend</div>;
  }
  const low = Math.min(...points);
  const high = Math.max(...points);
  const range = Math.max(1, high - low);
  const d = points.map((value, index) => {
    const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
    const y = 32 - ((value - low) / range) * 26;
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
  return <svg role="img" aria-label={`${label} recorded trend`} viewBox="0 0 100 40" preserveAspectRatio="none" className="h-12 w-full"><path d={d} fill="none" stroke="var(--theme-accent)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" /></svg>;
}

export function ProjectObservabilityCard({ mode, href, metrics, activity }: Props) {
  const rows = [
    { key: 'requests', label: 'Instrumented requests', metric: metrics?.requests },
    { key: 'functions', label: 'Instrumented functions', metric: metrics?.functions },
    { key: 'errors', label: 'Instrumented error rate', metric: metrics?.errors }
  ];
  const hasData = rows.some(row => row.metric?.value !== null && row.metric?.value !== undefined);
  return (
    <article className="flex h-[420px] min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface lg:h-[460px]" aria-label="Project operational observability">
      <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground"><Activity aria-hidden="true" className="size-4 text-theme-accent" /> Observability <span className="text-xs font-normal text-muted">6h</span></h2>
        <Link href={href} aria-label={mode === 'admin' ? 'Open development evidence' : 'Review delivery progress'} className="rounded-md p-1 text-muted hover:text-foreground"><ChevronRight className="size-4" /></Link>
      </header>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5 [scrollbar-width:thin] [scrollbar-color:transparent_transparent] hover:[scrollbar-color:var(--border)_transparent] focus-within:[scrollbar-color:var(--border)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-border focus-within:[&::-webkit-scrollbar-thumb]:bg-border [mask-image:linear-gradient(to_bottom,transparent,black_12px,black_95%,transparent)]">
        {rows.map(row => <div key={row.key} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] items-center gap-3">
          <div className="min-w-0"><p className="text-xs text-muted">{row.label}</p><p className="mt-1 text-sm font-semibold tabular-nums text-foreground">{row.metric?.value == null ? '—' : `${row.metric.value.toLocaleString('en-NG')}${row.metric.unit ?? ''}`}</p></div>
          <Trend label={row.label} points={row.metric?.points} />
        </div>)}
        {!hasData ? <p className="border-t border-border pt-3 text-xs leading-5 text-muted">No instrumented request measurements have been received for this project yet.</p> : null}
        {mode === 'admin' && activity ? (
          <div className="space-y-2 border-t border-border pt-3 text-xs">
            <p className="font-semibold text-foreground">GitHub delivery activity</p>
            <div className="flex items-center justify-between gap-2"><span className="text-muted">Source status</span><span className="font-medium text-foreground">{activity.state.replaceAll('_', ' ').toLowerCase()}</span></div>
            {activity.latestCommit ? <>
              <p className="break-words text-foreground">{activity.latestCommit.message}</p>
              <p className="text-muted">{activity.latestCommit.repository} · {activity.latestCommit.branch} · {activity.latestCommit.sha.slice(0, 7)}</p>
            </> : <p className="text-muted">No recorded commit available for this project.</p>}
            <p className="text-muted">Activity verification: {activity.verification === 'NOT_EVALUATED' ? 'not evaluated' : activity.verification}</p>
          </div>
        ) : null}

      </div>
      <Link href={href} className="flex shrink-0 items-center gap-2 border-t border-border px-4 py-3 text-xs font-medium text-foreground hover:underline">{mode === 'admin' ? 'Open technical evidence' : 'Review delivery updates'} <ChevronRight className="size-3.5" /></Link>
    </article>
  );
}
