import { notFound } from 'next/navigation';
import { requireAdmin } from '@/features/auth/server/require-admin';
import { getAdminBrief } from '@/features/admin/server/requests/get-admin-brief';
import { AdminBriefPreview } from '@/features/admin/components/requests/AdminBriefPreview';
import { DeleteBriefForm } from '@/features/admin/components/requests/DeleteBriefForm';
export default async function Page({ params }: { params: Promise<{ requestId: string }> }) {
  await requireAdmin();
  const { requestId } = await params;
  const item = await getAdminBrief(requestId);
  if (!item) notFound();
  return (
    <>
      <AdminBriefPreview item={item} />
      <DeleteBriefForm id={item.id} title={item.title}
        unavailable={Boolean(item.project) || ['QUOTED', 'APPROVED', 'CONVERTED'].includes(item.status)} />
    </>
  );
}
