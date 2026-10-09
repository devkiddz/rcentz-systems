import Link from 'next/link';

import { AdminMetricIcon, type AdminMetricIconName, type AdminMetricMotion } from './AdminMetricIcon';

type AdminOverviewMetric = {
  label: string;
  value: number;
  href: string;
  note?: string;
  iconName: AdminMetricIconName;
  motionType: AdminMetricMotion;
};

type AdminOverviewMetricsProps = {
  metrics: AdminOverviewMetric[];
};

export function AdminOverviewMetrics({ metrics }: AdminOverviewMetricsProps) {
  return (
    <section
      aria-label="Overview metrics"
      className="overflow-hidden rounded-2xl border border-border bg-border">
      <div className="flex snap-x snap-mandatory gap-px overflow-x-auto xl:grid xl:grid-cols-5 xl:overflow-visible">
        {metrics.map(metric => (
          <Link
            key={metric.label}
            href={metric.href}
            className="group min-w-[72%] shrink-0 snap-start bg-background px-4 py-4 transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-theme-accent/40 sm:min-w-[44%] xl:min-w-0 xl:px-5">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-xs font-medium text-muted transition-colors group-hover:text-foreground">
                {metric.label}
              </p>

              <AdminMetricIcon iconName={metric.iconName} motionType={metric.motionType} />
            </div>

            <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">{metric.value}</p>

            <p className="mt-1 line-clamp-2 text-xs leading-4 text-muted">
              {metric.note ?? 'No activity yet'}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
