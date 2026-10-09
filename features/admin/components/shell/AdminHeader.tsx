'use client';

import { useEffect } from 'react';

import { Menu } from 'lucide-react';

import { useRouter } from 'next/navigation';

import { SidebarTrigger } from '@/components/ui/sidebar';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import type { AdminHeaderFeed } from '@/features/admin/types/admin-header';

import { AdminAccountMenu } from './AdminAccountMenu';
import { AdminCommandSearch } from './AdminCommandSearch';
import { AdminMessagesMenu } from './AdminMessagesMenu';
import { AdminNotificationsMenu } from './AdminNotificationsMenu';
import { AdminThemeToggle } from './AdminThemeToggle';

type AdminHeaderProps = {
  user: {
    name: string;
    email: string;
    image: string | null;

    role: 'ADMIN' | 'SUPER_ADMIN';
  };

  headerFeed: AdminHeaderFeed;
};

export function AdminHeader({ user, headerFeed }: AdminHeaderProps) {
  const router = useRouter();

  useEffect(() => {
    function refreshHeader() {
      if (document.visibilityState !== 'visible') {
        return;
      }

      router.refresh();
    }

    const interval = window.setInterval(refreshHeader, 20_000);

    window.addEventListener('focus', refreshHeader);

    document.addEventListener('visibilitychange', refreshHeader);

    return () => {
      window.clearInterval(interval);

      window.removeEventListener('focus', refreshHeader);

      document.removeEventListener('visibilitychange', refreshHeader);
    };
  }, [router]);

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur-md">
      <div className="flex h-16 min-w-0 items-center gap-2 px-3 sm:px-4">
        <Tooltip>
          <TooltipTrigger
            render={
              <SidebarTrigger
                aria-label="Open admin navigation"
                className="size-8 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent text-muted shadow-none transition-colors hover:bg-surface-muted hover:text-foreground md:cursor-w-resize"
              />
            }>
            <Menu aria-hidden="true" className="size-4" />
          </TooltipTrigger>

          <TooltipContent>Admin navigation</TooltipContent>
        </Tooltip>

        <div className="h-5 w-px shrink-0 bg-border" />

        <div className="min-w-0">
          <p className="truncate text-xs font-semibold tracking-[-0.02em] text-foreground sm:text-sm">
            Admin
          </p>

          <p className="hidden truncate text-xs text-muted sm:block">Rcentz Systems</p>
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-0.5">
          <AdminCommandSearch />

          <AdminMessagesMenu messages={headerFeed.messages} hasUnread={headerFeed.hasUnreadMessages} />

          <AdminNotificationsMenu
            notifications={headerFeed.notifications}
            unreadCount={headerFeed.unreadNotificationCount}
          />

          <AdminThemeToggle />

          <div className="ml-1">
            <AdminAccountMenu user={user} />
          </div>
        </div>
      </div>
    </header>
  );
}
