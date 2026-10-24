'use client';

import { useTransition } from 'react';

import { useRouter } from 'next/navigation';

import {
  ArrowRight,
  Check,
  CheckCheck,
  Activity,
  BriefcaseBusiness,
  CircleDollarSign,
  FolderKanban,
  Headphones,
  MessageSquareText,
  Package,
  ReceiptText,
  Sparkles
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import {
  markAdminNotificationRead,
  markAllAdminNotificationsRead
} from '@/features/admin/server/dashboard/admin-header-actions';

import type { AdminHeaderNotification } from '@/features/admin/types/admin-header';

function NotificationIcon({ type }: { type: string }) {
  const className = 'size-4';

  switch (type) {
    case 'INVOICE':
      return <ReceiptText aria-hidden="true" className={className} />;

    case 'PAYMENT':
      return <CircleDollarSign aria-hidden="true" className={className} />;

    case 'PROJECT':
    case 'PROJECT_UPDATE':
      return <FolderKanban aria-hidden="true" className={className} />;

    case 'MESSAGE':
      return <MessageSquareText aria-hidden="true" className={className} />;

    case 'TICKET':
    case 'SUPPORT':
    case 'ASSISTANCE':
      return <Headphones aria-hidden="true" className={className} />;

    case 'ORDER':
    case 'COMMERCE':
      return <Package aria-hidden="true" className={className} />;

    case 'SERVICE':
    case 'SERVICE_REQUEST':
      return <BriefcaseBusiness aria-hidden="true" className={className} />;

    default:
      return <Sparkles aria-hidden="true" className={className} />;
  }
}

export function AdminNotificationsMenu({
  notifications,
  unreadCount
}: {
  notifications: AdminHeaderNotification[];
  unreadCount: number;
}) {
  const router = useRouter();

  const [pending, startTransition] = useTransition();

  function handleNotification(notification: AdminHeaderNotification) {
    startTransition(async () => {
      if (notification.unread) {
        await markAdminNotificationRead(notification.id);
      }

      if (notification.href) {
        router.push(notification.href);
      }

      router.refresh();
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllAdminNotificationsRead();

      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  aria-label={unreadCount > 0 ? `System activity, ${unreadCount} unread` : 'System activity'}
                  className="relative flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/40"
                />
              }
            />
          }>
          <Activity aria-hidden="true" className="size-4" />

          {unreadCount > 0 ? (
            <>
              <span
                aria-hidden="true"
                className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-background"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
              <span className="sr-only">
                {unreadCount} unread system notifications
              </span>
            </>
          ) : null}
        </TooltipTrigger>

        <TooltipContent>System Activity</TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" sideOffset={8} className="w-[370px] overflow-hidden p-0">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-4 py-3.5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">System Activity</p>

                <p className="mt-0.5 text-xs font-normal text-muted">Operational events and system alerts</p>
              </div>

              {unreadCount > 0 ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={event => {
                    event.preventDefault();
                    event.stopPropagation();

                    handleMarkAllRead();
                  }}
                  className="shrink-0 text-xs font-semibold text-theme-accent transition-opacity hover:opacity-75 disabled:opacity-40">
                  Mark all read
                </button>
              ) : null}
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="mx-auto flex size-10 items-center justify-center rounded-xl border border-border bg-surface-muted">
              <Activity className="size-4 text-muted" />
            </div>

            <p className="mt-3 text-sm font-semibold text-foreground">No notifications</p>

            <p className="mt-1 text-xs leading-5 text-muted">
              New system events and operational alerts will appear here.
            </p>
          </div>
        ) : (
          <div className="max-h-[390px] overflow-y-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {notifications.map(notification => {
              return (
                <div key={notification.id} className="border-b border-border/60 bg-surface-raised/40 last:border-b-0">
                <DropdownMenuItem
                  disabled={pending}
                  onClick={() => {
                    handleNotification(notification);
                  }}
                  className="cursor-pointer items-start gap-3 rounded-none px-4 pb-1 pt-3.5">
                  <div
                    className={[
                      'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl',
                      notification.unread
                        ? 'bg-theme-accent-faint text-theme-accent'
                        : 'bg-surface-muted text-muted'
                    ].join(' ')}>
                    <NotificationIcon type={notification.type} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p
                        className={[
                          'line-clamp-1 text-sm',
                          notification.unread
                            ? 'font-semibold text-foreground'
                            : 'font-medium text-foreground'
                        ].join(' ')}>
                        {notification.title}
                      </p>

                      <span className="shrink-0 text-xs text-muted">{notification.timeLabel}</span>
                    </div>

                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
                      {notification.message}
                    </p>
                  </div>

                  {notification.unread ? (
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-theme-accent"
                    />
                  ) : null}
                </DropdownMenuItem>
                {notification.unread ? (
                  <DropdownMenuItem
                    disabled={pending}
                    onClick={() => {
                      startTransition(async () => {
                        await markAdminNotificationRead(notification.id);
                        router.refresh();
                      });
                    }}
                    className="cursor-pointer justify-start rounded-none pb-3 pl-16 pr-4 pt-1 text-xs font-medium text-theme-accent"
                  >
                    <Check aria-hidden="true" className="mr-1 inline size-3.5 align-[-2px]" />
                    Mark as read
                  </DropdownMenuItem>
                ) : (
                  <div className="flex items-center pl-16 pr-4 pb-3 pt-1 text-xs font-medium text-muted" aria-label="Notification read">
                    <CheckCheck aria-hidden="true" className="mr-1 inline size-3.5 align-[-2px]" />
                    Read
                  </div>
                )}
                </div>
              );
            })}
          </div>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            router.push('/admin/notifications');
          }}
          className="cursor-pointer justify-between rounded-none px-4 py-3">
          <span className="text-sm font-medium">View system activity</span>

          <ArrowRight className="size-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
