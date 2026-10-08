import { requireAdmin } from '@/features/auth/server/require-admin';

import { NotificationHistoryPage } from '@/features/notifications/components/NotificationHistoryPage';

import { getNotificationHistory } from '@/features/notifications/server/get-notification-history';

type AdminNotificationsPageProps = {
  searchParams: Promise<{
    page?: string | string[];
  }>;
};

function resolvePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;

  const page = Number(raw);

  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return Math.floor(page);
}

export default async function AdminNotificationsPage({ searchParams }: AdminNotificationsPageProps) {
  const admin = await requireAdmin();

  const params = await searchParams;

  const data = await getNotificationHistory({
    userId: admin.id,
    page: resolvePage(params.page),
    pageSize: 20
  });

  return <NotificationHistoryPage mode="admin" data={data} />;
}
