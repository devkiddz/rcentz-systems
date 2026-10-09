import { notFound } from 'next/navigation';
import { requireAdmin } from '@/features/auth/server/require-admin';
import { getAdminBrief } from '@/features/admin/server/requests/get-admin-brief';
import { AdminBriefPreview } from '@/features/admin/components/requests/AdminBriefPreview';
export default async function Page({ params }: { params: Promise<{ requestId: string }> }) {
  await requireAdmin();
  const { requestId } = await params;
  const item = await getAdminBrief(requestId);
  if (!item) notFound();
  return <AdminBriefPreview item={item} />;
}
