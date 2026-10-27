import { readProjectRuntimeMetrics } from '@/server/runtime-monitor/read';
import { notFound } from 'next/navigation';

import { requireAuth } from '@/features/auth/server/require-auth';

import { ClientProjectPage } from '@/features/client/components/projects/ClientProjectPage';

import { getClientProject } from '@/features/client/server/projects/get-client-project';

import { getClientProjectAnalytics } from '@/features/analytics/server/read/get-client-project-analytics';
import { readOwnedProjectActivitySummary } from '@/server/rcentz-api/project-activity-client';

type DashboardProjectPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function DashboardProjectPage({
  params
}: DashboardProjectPageProps) {
  const user = await requireAuth('/dashboard/projects');

  const { projectId } = await params;

  const [project, analytics] = await Promise.all([
    getClientProject({
      userId: user.id,
      projectId
    }),

    getClientProjectAnalytics({
      userId: user.id,
      projectId
    })
  ]);

  if (!project || !analytics) {
    notFound();
  }

  const [runtimeMetrics, activity] = await Promise.all([
    readProjectRuntimeMetrics(projectId),
    readOwnedProjectActivitySummary({ projectId, userId: user.id })
  ]);
  return <ClientProjectPage project={project} analytics={analytics} runtimeMetrics={runtimeMetrics} activity={activity} />;
}
