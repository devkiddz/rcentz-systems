import Link from 'next/link';
import { Activity, ChevronRight } from 'lucide-react';

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

export function ProjectObservabilityCard({ mode, href, metrics }: Props) {
  const rows = [
    { key: 'requests', label: 'Requests', metric: metrics?.requests },
    { key: 'functions', label: 'Function invocations', metric: metrics?.functions },
    { key: 'errors', label: 'Error rate', metric: metrics?.errors }
  ];
  const hasData = rows.some(row => row.metric?.value !== null && row.metric?.value !== undefined);
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface" aria-label="Project operational observability">
      <header className="flex items-center justify-between border-b border-border px-4 py-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground"><Activity aria-hidden="true" className="size-4 text-theme-accent" /> Observability <span className="text-xs font-normal text-muted">6h</span></h2>
        <Link href={href} aria-label={mode === 'admin' ? 'Open development evidence' : 'Review delivery progress'} className="rounded-md p-1 text-muted hover:text-foreground"><ChevronRight className="size-4" /></Link>
      </header>
      <div className="flex-1 space-y-4 px-4 py-4">
        {rows.map(row => <div key={row.key} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] items-center gap-3">
          <div className="min-w-0"><p className="text-xs text-muted">{row.label}</p><p className="mt-1 text-sm font-semibold tabular-nums text-foreground">{row.metric?.value == null ? '—' : `${row.metric.value.toLocaleString('en-NG')}${row.metric.unit ?? ''}`}</p></div>
          <Trend label={row.label} points={row.metric?.points} />
        </div>)}
        {!hasData ? <p className="border-t border-border pt-3 text-xs leading-5 text-muted">Operational telemetry is not connected for this project. Request and error charts will appear when a trusted hosting source is configured.</p> : null}
      </div>
      <Link href={href} className="flex items-center gap-2 border-t border-border px-4 py-3 text-xs font-medium text-foreground hover:underline">{mode === 'admin' ? 'Open technical evidence' : 'Review delivery updates'} <ChevronRight className="size-3.5" /></Link>
    </article>
  );
}
