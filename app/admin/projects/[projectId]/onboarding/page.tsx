import { notFound } from 'next/navigation';
import { requireAdmin } from '@/features/auth/server/require-admin';
import { prisma } from '@/lib/prisma';
import { getAdminBrief } from '@/features/admin/server/requests/get-admin-brief';
import { AdminBriefPreview } from '@/features/admin/components/requests/AdminBriefPreview';
export const metadata = { title: 'Project onboarding overview' };
export default async function Page({ params }: { params: Promise<{ projectId: string }> }) {
  await requireAdmin();
  const { projectId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { serviceRequestId: true } });
  if (!project?.serviceRequestId) notFound();
  const item = await getAdminBrief(project.serviceRequestId);
  if (!item) notFound();
  return <AdminBriefPreview item={item} projectId={projectId} />;
}
