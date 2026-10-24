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
      <div className="gap-px flex min-w-0 overflow-x-auto overscroll-x-contain snap-x snap-mandatory scroll-smooth pb-2 lg:grid lg:grid-cols-5 lg:overflow-visible lg:snap-none lg:pb-0 flex-nowrap [&>*]:!w-[220px] [&>*]:!min-w-[220px] [&>*]:!max-w-none [&>*]:!flex-none [&>*]:snap-start lg:[&>*]:!w-auto lg:[&>*]:!min-w-0 lg:[&>*]:!max-w-none lg:[&>*]:!flex-auto">
        {metrics.map(metric => (
          <Link
            key={metric.label}
            href={metric.href}
            className="group min-w-0 bg-background px-4 py-4 transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-theme-accent/40 sm:min-w-[44%] xl:min-w-0 xl:px-5">
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
