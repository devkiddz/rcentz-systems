// Charts are derived only from reported project measurements, never generated sample values.
type RecordedSeries = {
  name: string;
  values: number[];
  color: string;
};

type Props = {
  series: RecordedSeries[];
  labels?: string[];
  title: string;
  unit?: string;
};

function compact(value: number) {
  return new Intl.NumberFormat('en-NG', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

export function ProjectMetricLineChart({ series, labels = [], title, unit = '' }: Props) {
  const count = Math.max(0, ...series.map(item => item.values.length));
  const validSeries = series.filter(item => item.values.length === count && item.values.every(Number.isFinite));
  const values = validSeries.flatMap(item => item.values);
  if (!validSeries.length || count < 2) {
    return (
      <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-border px-4 text-center text-xs leading-5 text-muted">
        No recorded time-series data for this period.
      </div>
    );
  }

  const maximum = Math.max(1, ...values);
  const left = 39;
  const right = 410;
  const top = 10;
  const bottom = 122;
  const x = (index: number) => left + ((right - left) * index) / (count - 1);
  const y = (value: number) => bottom - (Math.max(0, value) / maximum) * (bottom - top);
  const path = (points: number[]) => points.map((value, index) => `${index ? 'L' : 'M'} ${x(index).toFixed(2)} ${y(value).toFixed(2)}`).join(' ');
  const area = (points: number[]) => `${path(points)} L ${x(count - 1)} ${bottom} L ${left} ${bottom} Z`;
  const lastLabel = labels[count - 1] ?? 'Newest';
  const midLabel = labels[Math.floor((count - 1) / 2)] ?? '';
  const firstLabel = labels[0] ?? 'Oldest';

  return (
    <div className="min-w-0" role="img" aria-label={`${title}. ${validSeries.map(item => `${item.name}: ${item.values.map(compact).join(', ')}`).join('; ')}`}>
      <svg viewBox="0 0 432 158" preserveAspectRatio="none" className="block h-40 w-full" aria-hidden="true">
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
          <g key={ratio}>
            <line x1={left} x2={right} y1={bottom - ratio * (bottom - top)} y2={bottom - ratio * (bottom - top)} stroke="currentColor" strokeOpacity="0.13" strokeDasharray={ratio === 0 ? undefined : '3 4'} />
            <text x={left - 7} y={bottom - ratio * (bottom - top) + 3} textAnchor="end" fill="currentColor" opacity="0.6" fontSize="10">{compact(ratio * maximum)}{unit}</text>
          </g>
        ))}
        {validSeries.length === 1 ? <path d={area(validSeries[0].values)} fill={validSeries[0].color} opacity="0.12" /> : null}
        {validSeries.map(item => (
          <g key={item.name}>
            <path d={path(item.values)} fill="none" stroke={item.color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            <circle cx={x(count - 1)} cy={y(item.values[count - 1])} r="3.2" fill={item.color} stroke="currentColor" strokeWidth="0.5" />
          </g>
        ))}
        <text x={left} y="146" fill="currentColor" opacity="0.7" fontSize="10">{firstLabel}</text>
        <text x={(left + right) / 2} y="146" fill="currentColor" opacity="0.7" fontSize="10" textAnchor="middle">{midLabel}</text>
        <text x={right} y="146" fill="currentColor" opacity="0.7" fontSize="10" textAnchor="end">{lastLabel}</text>
      </svg>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-4 text-[10px] text-muted">
        {validSeries.map(item => <span key={item.name} className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span>)}
      </div>
      {values.every(value => value === 0) ? <p className="mt-1 text-center text-[10px] text-muted">All reported values are zero in this period.</p> : null}
    </div>
  );
}
