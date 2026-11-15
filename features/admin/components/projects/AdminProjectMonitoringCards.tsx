import type { AdminProject } from '@/features/admin/server/projects/get-admin-project';
import type { ClientProjectAnalytics } from '@/features/analytics/server/read/get-client-project-analytics';
import type { ProjectIntelligence } from '@/server/intelligence/read-project-intelligence';
import type { RuntimeMetrics } from '@/server/runtime-monitor/read';
import { AdminProjectMilestonesCard } from './AdminProjectMilestonesCard';
import { ProjectFeatureAnalyticsCard, ProjectRuntimeChartCard } from './ProjectInsightsCards';

type Props = {
  project: AdminProject;
  analytics?: ClientProjectAnalytics | null;
  intelligence?: ProjectIntelligence | null;
  runtimeMetrics?: RuntimeMetrics;
};

export function AdminProjectMonitoringCards({ project, analytics, intelligence, runtimeMetrics }: Props) {
  const recordedAnalytics = analytics?.available ? {
    summary: {
      sessions: analytics.summary.sessions,
      pageViews: analytics.summary.pageViews,
      clicks: analytics.summary.clicks
    },
    daily: analytics.daily.map(point => ({
      date: point.date, label: point.label, sessions: point.sessions,
      pageViews: point.pageViews, clicks: point.clicks
    }))
  } : null;
  // Do not present migrated delivery phases as built-in software features.
  // This only filters the overview; no stored ProjectFeature records are changed.
  const normalized = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
  const milestoneIds = new Set(project.milestones.flatMap(milestone => [
    normalized(milestone.title), normalized(milestone.slug)
  ]));
  const capabilities = project.features.filter(feature =>
    !milestoneIds.has(normalized(feature.name)) && !milestoneIds.has(normalized(feature.slug))
  );
  const legacyMilestoneMirrors = project.features.length - capabilities.length;
  const featureEvents = intelligence?.groups
    .filter(group => group.kind === 'feature')
    .map(group => ({ featureKey: group.featureKey, name: group.name, count: group.count })) ?? [];

  return (
    <section aria-label="Project delivery and intelligence" className="grid items-stretch gap-4 lg:grid-cols-3">
      <AdminProjectMilestonesCard projectId={project.id} milestones={project.milestones} />
      <ProjectFeatureAnalyticsCard
        projectId={project.id}
        analytics={recordedAnalytics}
        features={capabilities}
        legacyMilestoneMirrors={legacyMilestoneMirrors}
        featureEvents={featureEvents}
        featureWindowHours={intelligence?.hours ?? null}
        telemetryAvailable={intelligence !== null && intelligence !== undefined}
      />
      <ProjectRuntimeChartCard projectId={project.id} metrics={runtimeMetrics} />
    </section>
  );
}
