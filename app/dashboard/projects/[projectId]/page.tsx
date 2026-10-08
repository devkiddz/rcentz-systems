import { notFound } from 'next/navigation';

import { requireAuth } from '@/features/auth/server/require-auth';

import { ClientProjectPage } from '@/features/client/components/projects/ClientProjectPage';

import { getClientProject } from '@/features/client/server/projects/get-client-project';

import { getClientProjectAnalytics } from '@/features/analytics/server/read/get-client-project-analytics';

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

  return <ClientProjectPage project={project} analytics={analytics} />;
}
