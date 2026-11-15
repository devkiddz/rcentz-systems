import { readProjectRuntimeMetrics } from '@/server/runtime-monitor/read';
import { notFound } from 'next/navigation';

import { requireAuth } from '@/features/auth/server/require-auth';

import { ClientProjectPage } from '@/features/client/components/projects/ClientProjectPage';

import { getClientProject } from '@/features/client/server/projects/get-client-project';

import { getClientProjectAnalytics } from '@/features/analytics/server/read/get-client-project-analytics';
import { readOwnedProjectActivitySummary } from '@/server/rcentz-api/project-activity-client';
import { prisma } from '@/lib/prisma';
import { PROJECT_DELETION_MARKER } from '@/features/projects/lib/deletion';
import { ProjectDeletionRequestPanel } from '@/features/client/components/projects/ProjectDeletionRequestPanel';

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
  const deletionRequest = await prisma.projectProcess.findFirst({
    where: { projectId, createdById: user.id, type: 'OTHER', impact: PROJECT_DELETION_MARKER },
    orderBy: { createdAt: 'desc' },
    select: { id: true, status: true, reason: true, resolutionNotes: true, createdAt: true }
  });
  const previous = deletionRequest ? {
    ...deletionRequest, createdAt: deletionRequest.createdAt.toISOString()
  } : null;
  return (
    <>
      <ClientProjectPage project={project} analytics={analytics} runtimeMetrics={runtimeMetrics} activity={activity} />
      <ProjectDeletionRequestPanel projectId={projectId} previous={previous} />
    </>
  );
}
