import type { ReactNode } from 'react';

import { requireAuth } from '@/features/auth/server/require-auth';

import { ClientDashboardIdentityRail } from '@/features/client/components/shell/ClientDashboardIdentityRail';
import { ClientShell } from '@/features/client/components/shell/ClientShell';

import { getClientDashboardIdentity } from '@/features/client/server/dashboard/get-client-dashboard-identity';
import { getClientHeaderFeed } from '@/features/client/server/dashboard/get-client-header-feed';

import { NotificationLiveRefresh } from '@/features/notifications/components/NotificationLiveRefresh';

import { DashboardCanvas } from '@/ui-shell/dashboard/DashboardCanvas';
import { RcentzMobileNavigationPill } from '@/ui-shell/navigation/RcentzMobileNavigationPill';

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = await requireAuth('/dashboard');

  const [dashboardIdentity, headerFeed] = await Promise.all([
    getClientDashboardIdentity(user.id),

    getClientHeaderFeed(user.id)
  ]);

  return (
    <ClientShell
      user={{
        name: user.name,
        email: user.email,
        image: user.image
      }}
      headerFeed={headerFeed}>
      <NotificationLiveRefresh />

      <DashboardCanvas>
        <div className="pb-24 md:pb-0">
          <ClientDashboardIdentityRail summary={dashboardIdentity} />

          {children}
        </div>
      </DashboardCanvas>

      <RcentzMobileNavigationPill />
    </ClientShell>
  );
}
