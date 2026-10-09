import type { ReactNode } from 'react';
import { isFinderOwner } from '@/server/opportunities/access';

import { AdminShell } from '@/features/admin/components/shell/AdminShell';

import { getAdminHeaderFeed } from '@/features/admin/server/dashboard/get-admin-header-feed';

import { requireAdmin } from '@/features/auth/server/require-admin';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin workspace', robots: { index: false, follow: false } };

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await requireAdmin();

  const headerFeed = await getAdminHeaderFeed(user.id);

  return (
    <AdminShell
      showOpportunities={isFinderOwner(user.id)}
      user={{
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role
      }}
      headerFeed={headerFeed}>
      {children}
    </AdminShell>
  );
}
