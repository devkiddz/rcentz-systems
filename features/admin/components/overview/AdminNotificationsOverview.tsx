'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import { Bell, Circle, ExternalLink, Inbox, MessageSquareText } from 'lucide-react';

import type {
  OverviewNotification,
  OverviewNotifications
} from '@/features/admin/server/overview/get-overview-notifications';

type AdminNotificationsOverviewProps = {
  data: OverviewNotifications;
};

function formatNotificationTime(date: Date) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

function formatNotificationType(type: string) {
  return type
    .toLowerCase()
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function NotificationListItem({
  notification,
  isSelected,
  onSelect
}: {
  notification: OverviewNotification;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isUnread = notification.readAt === null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full cursor-pointer rounded-xl border p-3 text-left transition-colors ${
        isSelected
          ? 'border-theme-accent/30 bg-theme-accent-faint'
          : 'border-transparent hover:bg-surface-raised'
      }`}>
      <div className="flex items-start gap-3">
        <div className="relative mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-muted">
          <Bell className="size-3.5 text-muted" />

          {isUnread ? (
            <span className="absolute right-0 top-0 size-2 rounded-full border-2 border-background bg-theme-accent" />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p
              className={`truncate text-[12px] ${
                isUnread ? 'font-semibold text-foreground' : 'font-medium text-foreground'
              }`}>
              {notification.title}
            </p>

            <span className="shrink-0 text-[9px] text-muted">
              {formatNotificationTime(notification.createdAt)}
            </span>
          </div>

          <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-muted">{notification.message}</p>
        </div>
      </div>
    </button>
  );
}

export function AdminNotificationsOverview({ data }: AdminNotificationsOverviewProps) {
  const isPreview = false;

  const visibleNotifications = data.notifications;

  const [selectedNotificationId, setSelectedNotificationId] = useState(visibleNotifications[0]?.id ?? null);

  const selectedNotification = useMemo(
    () =>
      visibleNotifications.find(notification => notification.id === selectedNotificationId) ??
      visibleNotifications[0] ??
      null,
    [selectedNotificationId, visibleNotifications]
  );

  const unreadCount = visibleNotifications.filter(notification => notification.readAt === null).length;

  if (!selectedNotification) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <Inbox className="size-5 text-theme-accent" />

        <p className="mt-3 text-[13px] font-semibold text-foreground">No notifications</p>

        <p className="mt-1 text-[11px] text-muted">New system activity will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 px-1 pb-4">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-semibold text-foreground">Notification reader</p>

          {isPreview ? (
            <span className="rounded-full border border-border bg-surface-raised px-2 py-0.5 text-[8px] font-medium uppercase tracking-[0.08em] text-muted">
              Preview
            </span>
          ) : null}

          {unreadCount > 0 ? (
            <span className="rounded-full bg-theme-accent-faint px-2 py-0.5 text-[9px] font-semibold text-theme-accent">
              {unreadCount} unread
            </span>
          ) : null}
        </div>

        <p className="mt-1 text-[11px] text-muted">Select an item to inspect its full message.</p>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-[0.9fr_1.1fr]">
        <div className="min-h-0 overflow-y-auto overscroll-contain rounded-2xl border border-border p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="space-y-1">
            {visibleNotifications.map(notification => (
              <NotificationListItem
                key={notification.id}
                notification={notification}
                isSelected={selectedNotification.id === notification.id}
                onSelect={() => setSelectedNotificationId(notification.id)}
              />
            ))}
          </div>
        </div>

        <article className="min-h-0 overflow-y-auto rounded-2xl border border-border bg-surface-raised p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-start justify-between gap-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-theme-accent/20 bg-theme-accent-faint">
              <MessageSquareText className="size-4 text-theme-accent" />
            </div>

            <div className="flex items-center gap-1.5 text-[9px] text-muted">
              <Circle
                className={`size-2 ${
                  selectedNotification.readAt
                    ? 'fill-muted text-muted'
                    : 'fill-theme-accent text-theme-accent'
                }`}
              />

              {selectedNotification.readAt ? 'Read' : 'Unread'}
            </div>
          </div>

          <p className="mt-4 text-[9px] font-medium uppercase tracking-[0.12em] text-theme-accent">
            {formatNotificationType(selectedNotification.type)}
          </p>

          <h3 className="mt-2 text-[14px] font-semibold tracking-[-0.02em] text-foreground">
            {selectedNotification.title}
          </h3>

          <p className="mt-3 text-[11px] leading-5 text-muted">{selectedNotification.message}</p>

          <div className="mt-5 border-t border-border pt-3">
            <p className="text-[10px] text-muted">{formatNotificationTime(selectedNotification.createdAt)}</p>

            {selectedNotification.href && !isPreview ? (
              <Link
                href={selectedNotification.href}
                className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-theme-accent">
                Open related item
                <ExternalLink className="size-3" />
              </Link>
            ) : null}
          </div>
        </article>
      </div>
    </div>
  );
}
