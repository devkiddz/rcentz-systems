import { readProjectRuntimeMetrics } from '@/server/runtime-monitor/read';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Eye, ArrowLeft } from 'lucide-react';
import { requireAdmin } from '@/features/auth/server/require-admin';
import { getAdminProject } from '@/features/admin/server/projects/get-admin-project';
import { getClientProject } from '@/features/client/server/projects/get-client-project';
import { getClientProjectAnalytics } from '@/features/analytics/server/read/get-client-project-analytics';
import { ClientProjectPage } from '@/features/client/components/projects/ClientProjectPage';
import { ReadOnlyCustomerPreview } from '@/features/admin/components/projects/ReadOnlyCustomerPreview';

type Props = { params: Promise<{ projectId: string }> };

export default async function AdminCustomerPreviewRoute({ params }: Props) {
  await requireAdmin();
  const { projectId } = await params;
  const adminProject = await getAdminProject(projectId);
  if (!adminProject) notFound();

  const clientId = adminProject.client?.id;
  if (!clientId) {
    return (
      <main className="rcentz-dashboard-frame mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6">
        <Link href={`/admin/projects/${projectId}`} className="text-xs text-muted hover:text-foreground">← Back to project</Link>
        <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
          <h1 className="text-base font-semibold text-foreground">Customer preview unavailable</h1>
          <p className="mt-2 text-sm text-muted">This project has no assigned customer account yet.</p>
        </div>
      </main>
    );
  }

  const [project, analytics] = await Promise.all([
    getClientProject({ userId: clientId, projectId }),
    getClientProjectAnalytics({ userId: clientId, projectId }),
  ]);
  if (!project || !analytics) notFound();
  const runtimeMetrics = await readProjectRuntimeMetrics(projectId);

  return (
    <main className="rcentz-dashboard-frame mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-raised px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Eye aria-hidden="true" className="size-4 text-theme-accent" />
          Customer view · Read only
        </div>
        <Link href={`/admin/projects/${projectId}`} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-muted">
          <ArrowLeft aria-hidden="true" className="size-3.5" /> Back to admin project
        </Link>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted">This is a preview of the assigned customer's project page. Links, forms, and action buttons inside the preview are disabled; no customer session is created.</p>
      <ReadOnlyCustomerPreview>
        <ClientProjectPage project={project} analytics={analytics} runtimeMetrics={runtimeMetrics} />
      </ReadOnlyCustomerPreview>
    </main>
  );
}
