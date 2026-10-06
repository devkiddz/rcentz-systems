import { requireAuth } from '@/features/auth/server/require-auth';

import { NotificationHistoryPage } from '@/features/notifications/components/NotificationHistoryPage';

import { getNotificationHistory } from '@/features/notifications/server/get-notification-history';

type ClientNotificationsPageProps = {
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

export default async function ClientNotificationsPage({ searchParams }: ClientNotificationsPageProps) {
  const user = await requireAuth('/dashboard/notifications');

  const params = await searchParams;

  const data = await getNotificationHistory({
    userId: user.id,
    page: resolvePage(params.page),
    pageSize: 20
  });

  return <NotificationHistoryPage mode="client" data={data} />;
}
