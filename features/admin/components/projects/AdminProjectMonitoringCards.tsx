import type { AdminProject } from '@/features/admin/server/projects/get-admin-project';
import type { ClientProjectAnalytics } from '@/features/analytics/server/read/get-client-project-analytics';
import type { ProjectIntelligence } from '@/server/intelligence/read-project-intelligence';
import type { RuntimeMetrics } from '@/server/runtime-monitor/read';
import type { ProjectActivitySummary } from '@/server/rcentz-api/project-activity-client';
import { ProjectDecisionSummary } from '@/features/client/components/overview/ProjectDecisionSummary';
import { AdminProjectMilestonesCard } from './AdminProjectMilestonesCard';
import { ProjectFeatureAnalyticsCard } from './ProjectInsightsCards';

type Props = {
  project: AdminProject;
  analytics?: ClientProjectAnalytics | null;
  intelligence?: ProjectIntelligence | null;
  runtimeMetrics?: RuntimeMetrics;
  activity?: ProjectActivitySummary;
};

export function AdminProjectMonitoringCards({ project, analytics, intelligence, runtimeMetrics, activity }: Props) {
  // Milestone records and capabilities are different concepts.
  const normalized = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
  const milestoneIds = new Set(project.milestones.flatMap(m => [normalized(m.title), normalized(m.slug)]));
  const capabilities = project.features.filter(feature =>
    !milestoneIds.has(normalized(feature.name)) && !milestoneIds.has(normalized(feature.slug))
  );
  const legacyMilestoneMirrors = project.features.length - capabilities.length;
  const featureEvents = intelligence?.groups
    .filter(group => group.kind === 'feature')
    .map(group => ({ featureKey: group.featureKey, name: group.name, count: group.count })) ?? [];
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

  // The same three-card presentation is used in both workspaces. Only plain
  // JSON-compatible project summary fields cross into the client component.
  return (
    <>
      <ProjectDecisionSummary
        mode="admin"
        project={{
          id: project.id,
          _count: { features: capabilities.length },
          milestones: project.milestones.map(milestone => ({
            id: milestone.id,
            title: milestone.title,
            description: milestone.description,
            purpose: milestone.purpose,
            expectedOutcome: milestone.expectedOutcome,
            status: milestone.status,
            priority: milestone.priority,
            progress: milestone.progress,
            dueDate: milestone.dueDate?.toISOString() ?? null
          }))
        }}
        features={capabilities.map(feature => ({
          id: feature.id, name: feature.name,
          status: feature.status, progress: feature.progress
        }))}
        analytics={analytics ?? undefined}
        runtimeMetrics={runtimeMetrics}
        activity={activity}
      />

      {/* Admin-only governance remains available without changing the KPI layout. */}
      <details className="mt-4 rounded-2xl border border-border bg-surface">
        <summary className="cursor-pointer px-5 py-4 text-xs font-semibold text-foreground">
          Administrative milestone reviews and capability intelligence
        </summary>
        <div className="grid min-w-0 gap-4 border-t border-border p-4 lg:grid-cols-2">
          <AdminProjectMilestonesCard projectId={project.id} milestones={project.milestones} />
          <ProjectFeatureAnalyticsCard
            projectId={project.id}
            analytics={recordedAnalytics}
            features={capabilities}
            legacyMilestoneMirrors={legacyMilestoneMirrors}
            featureEvents={featureEvents}
            featureWindowHours={intelligence?.hours ?? null}
            telemetryAvailable={intelligence != null}
          />
        </div>
      </details>
    </>
  );
}
