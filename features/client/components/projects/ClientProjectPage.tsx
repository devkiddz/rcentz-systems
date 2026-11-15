import type { RuntimeMetrics } from '@/server/runtime-monitor/read';
import type { ProjectActivitySummary } from '@/server/rcentz-api/project-activity-client';
import Link from 'next/link';
import type { ClientProjectAnalytics } from '@/features/analytics/server/read/get-client-project-analytics';
import { ProjectDetailsSection } from '@/features/client/components/overview/ProjectDetailsSection';
import { ProjectObservabilityCard } from '@/features/projects/components/ProjectObservabilityCard';
import type { ClientProject } from '@/features/client/server/projects/get-client-project';
import { ClientProjectMilestonesSection } from './ClientProjectMilestonesSection';
import { ClientProjectAnalyticsSection } from './ClientProjectAnalyticsSection';
import { ClientProjectFinanceSection } from './ClientProjectFinanceSection';

export type CustomerProjectTab = 'overview' | 'milestones' | 'activity' | 'finances' | 'analytics';

type ClientProjectPageProps = {
  project: ClientProject;
  analytics: ClientProjectAnalytics;
  runtimeMetrics?: RuntimeMetrics;
  activity?: ProjectActivitySummary;
  tab?: CustomerProjectTab;
};

const tabs: ReadonlyArray<{ key: CustomerProjectTab; label: string }> = [
  { key: 'overview', label: 'Project Overview' },
  { key: 'milestones', label: 'Milestones' },
  { key: 'activity', label: 'Activity' },
  { key: 'finances', label: 'Finances' },
  { key: 'analytics', label: 'Analytics' }
];

export function ClientProjectPage({
  project,
  analytics,
  runtimeMetrics,
  activity,
  tab = 'overview'
}: ClientProjectPageProps) {
  const basePath = `/dashboard/projects/${project.id}`;

  return (
    <main className="min-w-0 py-6 sm:py-8">
      <div className="min-w-0 space-y-6">
        <nav
          aria-label="Customer project workspace tabs"
          className="flex min-w-0 gap-1 overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map(item => {
            const active = tab === item.key;
            return (
              <Link
                key={item.key}
                href={item.key === 'overview' ? basePath : `${basePath}?tab=${item.key}`}
                aria-current={active ? 'page' : undefined}
                className={[
                  'shrink-0 border-b-2 px-3 py-3 text-xs font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent',
                  active
                    ? 'border-theme-accent text-foreground'
                    : 'border-transparent text-muted hover:text-foreground'
                ].join(' ')}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {tab === 'overview' ? (
          <ProjectDetailsSection
            project={project}
            analytics={analytics}
            runtimeMetrics={runtimeMetrics}
            activity={activity}
          />
        ) : tab === 'milestones' ? (
          <section aria-label="Customer milestones" className="min-w-0 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Project milestones</h2>
              <p className="mt-1 text-xs text-muted">Review published milestones and delivery progress.</p>
            </div>
            <ClientProjectMilestonesSection project={project} />
          </section>
        ) : tab === 'activity' ? (
          <section aria-label="Customer project activity" className="min-w-0 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Project activity</h2>
              <p className="mt-1 text-xs text-muted">
                Customer-visible development updates and operational observability. GitHub evidence does not approve milestones.
              </p>
            </div>
            <div className="max-w-xl">
              <ProjectObservabilityCard
                mode="customer"
                href={`${basePath}?tab=milestones`}
                metrics={runtimeMetrics}
                activity={activity}
              />
            </div>
          </section>
        ) : tab === 'finances' ? (
          <section aria-label="Project finances" className="min-w-0 space-y-4">
            {project.slug === 'demo-dennis-portfolio-complete-v1' ? (
              <p className="rounded-xl border border-border bg-surface-muted px-5 py-3 text-xs leading-6 text-muted">
                Demonstration only: the quoted budget, invoices, payment confirmations,
                reviews and analytics are simulated. No funds were charged or received.
              </p>
            ) : null}
            <ClientProjectFinanceSection project={project} />
          </section>
        ) : (
          <section aria-label="Project analytics" className="min-w-0">
            <ClientProjectAnalyticsSection project={project} analytics={analytics} />
          </section>
        )}

        {tab === 'overview' && project.slug === 'demo-dennis-portfolio-complete-v1' ? (
          <p className="rounded-xl border border-border bg-surface-muted px-5 py-3 text-xs leading-6 text-muted">
            Demonstration only: the quoted budget, invoices, payment confirmations,
            reviews and analytics are simulated. No funds were charged or received.
          </p>
        ) : null}
      </div>
    </main>
  );
}
