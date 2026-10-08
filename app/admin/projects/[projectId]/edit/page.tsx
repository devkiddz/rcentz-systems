import { notFound } from 'next/navigation';

import { AdminProjectEditor } from '@/features/admin/components/projects/AdminProjectEditor';

import { getAdminProject } from '@/features/admin/server/projects/get-admin-project';

import { getAdminProjectBuilderData } from '@/features/admin/server/projects/get-admin-project-builder-data';

import { requireAdmin } from '@/features/auth/server/require-admin';

type AdminProjectEditRouteProps = {
  params: Promise<{
    projectId: string;
  }>;
};

function toDateInput(value: Date | null) {
  if (!value) {
    return '';
  }

  return value.toISOString().slice(0, 10);
}

export default async function AdminProjectEditRoute({ params }: AdminProjectEditRouteProps) {
  await requireAdmin();

  const { projectId } = await params;

  const [project, builderData] = await Promise.all([
    getAdminProject(projectId),

    getAdminProjectBuilderData()
  ]);

  if (!project) {
    notFound();
  }

  return (
    <AdminProjectEditor
      project={{
        id: project.id,

        name: project.name,
        slug: project.slug,

        clientId: project.client?.id ?? '',

        description: project.description ?? '',

        purpose: project.purpose ?? '',

        vision: project.vision ?? '',

        expectedOutcome: project.expectedOutcome ?? '',

        type: project.type,
        status: project.status,
        visibility: project.visibility,

        progress: project.progress,

        budget: project.budget?.toString() ?? '',

        currency: project.currency,

        startedAt: toDateInput(project.startedAt),

        expectedEndAt: toDateInput(project.expectedEndAt)
      }}
      clients={builderData.clients}
    />
  );
}
