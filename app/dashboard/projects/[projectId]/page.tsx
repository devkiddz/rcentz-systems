import { readProjectRuntimeMetrics } from '@/server/runtime-monitor/read';
import { notFound } from 'next/navigation';

import { requireAuth } from '@/features/auth/server/require-auth';
import {
  ClientProjectPage,
  type CustomerProjectTab
} from '@/features/client/components/projects/ClientProjectPage';

import { ClientProjectHeaderPicker } from '@/features/client/components/projects/ClientProjectHeaderPicker';
import { getClientProject } from '@/features/client/server/projects/get-client-project';
import { getClientProjectAnalytics } from '@/features/analytics/server/read/get-client-project-analytics';
import { readOwnedProjectActivitySummary } from '@/server/rcentz-api/project-activity-client';
import { prisma } from '@/lib/prisma';
import { PROJECT_DELETION_MARKER } from '@/features/projects/lib/deletion';
import { ProjectDeletionRequestPanel } from '@/features/client/components/projects/ProjectDeletionRequestPanel';

type DashboardProjectPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
};

const supportedTabs: readonly CustomerProjectTab[] = [
  'overview', 'milestones', 'activity', 'finances', 'analytics'
];

export default async function DashboardProjectPage({
  params,
  searchParams
}: DashboardProjectPageProps) {
  const user = await requireAuth('/dashboard/projects');
  const [{ projectId }, query] = await Promise.all([params, searchParams]);
  const requestedTab = typeof query.tab === 'string' ? query.tab : 'overview';
  const tab: CustomerProjectTab = supportedTabs.includes(requestedTab as CustomerProjectTab)
    ? (requestedTab as CustomerProjectTab)
    : 'overview';

  const [project, analytics] = await Promise.all([
    getClientProject({ userId: user.id, projectId }),
    getClientProjectAnalytics({ userId: user.id, projectId })
  ]);

  if (!project || !analytics) notFound();

  const selectorProjects = await prisma.project.findMany({
    where: {
      clientId: user.id,
      processes: { none: { type: 'OTHER', impact: PROJECT_DELETION_MARKER, status: 'RESOLVED' } }
    },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, name: true }
  });
  const [runtimeMetrics, activity] = await Promise.all([
    readProjectRuntimeMetrics(projectId),
    readOwnedProjectActivitySummary({ projectId, userId: user.id })
  ]);

  const deletionRequest = await prisma.projectProcess.findFirst({
    where: { projectId, createdById: user.id, type: 'OTHER', impact: PROJECT_DELETION_MARKER },
    orderBy: { createdAt: 'desc' },
    select: { id: true, status: true, reason: true, resolutionNotes: true, createdAt: true }
  });
  const previous = deletionRequest
    ? { ...deletionRequest, createdAt: deletionRequest.createdAt.toISOString() }
    : null;

  return (
    <>
      <ClientProjectHeaderPicker currentProjectId={projectId} projects={selectorProjects} />
      <ClientProjectPage
        project={project}
        analytics={analytics}
        runtimeMetrics={runtimeMetrics}
        activity={activity}
        tab={tab}
      />
      <ProjectDeletionRequestPanel projectId={projectId} previous={previous} />
    </>
  );
}
