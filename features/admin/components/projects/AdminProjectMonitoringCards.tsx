import Link from 'next/link';
import { Activity, ArrowUpRight, Gauge, Layers3 } from 'lucide-react';
import { ProjectObservabilityCard } from '@/features/projects/components/ProjectObservabilityCard';
import type { AdminProject } from '@/features/admin/server/projects/get-admin-project';
import type { ProjectActivitySummary } from '@/server/rcentz-api/project-activity-client';
import type { ClientProjectAnalytics } from '@/features/analytics/server/read/get-client-project-analytics';
import type { RuntimeMetrics } from '@/server/runtime-monitor/read';

type Props = {
  project: AdminProject;
  activity?: ProjectActivitySummary;
  analytics?: ClientProjectAnalytics | null;
  runtimeMetrics?: RuntimeMetrics;
};

function IntelligencePreview({
  title, description, href, icon: Icon, label
}: {
  title: string;
  description: string;
  href: string;
  icon: typeof Gauge;
  label: string;
}) {
  return (
    <article className="group flex h-[420px] min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-[border-color,box-shadow,transform] duration-200 ease-out hover:border-theme-accent/40 hover:shadow-sm motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none lg:h-[460px]">
      <header className="flex items-center justify-between border-b border-border px-4 py-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon aria-hidden="true" className="size-4 text-theme-accent" />{title}
        </h2>
        <Link href={href} aria-label={`Open ${title.toLowerCase()}`} className="rounded-lg p-1 text-muted transition-colors hover:bg-surface-raised hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-accent">
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </header>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-6 py-8 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl border border-border bg-background text-theme-accent transition-transform duration-200 motion-safe:group-hover:scale-105 motion-reduce:transform-none">
          <Icon aria-hidden="true" className="size-6" />
        </span>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">{label}</h3>
          <p className="max-w-xs text-xs leading-5 text-muted">{description}</p>
        </div>
      </div>
      <Link href={href} className="flex items-center justify-between border-t border-border px-4 py-3 text-xs font-medium text-foreground transition-colors hover:bg-surface-raised">
        Open intelligence <ArrowUpRight aria-hidden="true" className="size-3.5" />
      </Link>
    </article>
  );
}

export function AdminProjectMonitoringCards({ project, activity, runtimeMetrics }: Props) {
  const intelligenceHref = `/admin/projects/${project.id}?tab=analytics`;

  return (
    <section aria-label="Project intelligence and monitoring" className="grid items-stretch gap-4 lg:grid-cols-3">
      <IntelligencePreview
        title="Performance"
        icon={Gauge}
        href={intelligenceHref}
        label="Performance intelligence"
        description="Examine SDK-recorded operations, execution activity and performance measurements. Figures appear as applications report them."
      />
      <IntelligencePreview
        title="Built-in Features"
        icon={Layers3}
        href={intelligenceHref}
        label="Feature intelligence"
        description="Explore actual feature usage and outcomes across the selected project. No synthetic success rates or activity counts."
      />
      <ProjectObservabilityCard
        mode="admin"
        href={intelligenceHref}
        activity={activity}
        metrics={runtimeMetrics}
      />
    </section>
  );
}
