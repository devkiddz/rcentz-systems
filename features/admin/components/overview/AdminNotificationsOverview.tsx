'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  markAdminConversationRead,
  markAllAdminConversationsRead,
  markAdminNotificationRead,
  markAllAdminNotificationsRead
} from '@/features/admin/server/dashboard/admin-header-actions';
import Link from 'next/link';

import {
  ArrowUpRight,
  Check,
  CheckCheck,
  Bell,
  Inbox,
  MessageSquareText
} from 'lucide-react';

import type {
  OverviewNotifications
} from '@/features/admin/server/overview/get-overview-notifications';

import type {
  OverviewMessages
} from '@/features/admin/server/overview/get-overview-messages';

type Props = {
  data: OverviewNotifications;
  messages: OverviewMessages;
};

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Africa/Lagos'
  }).format(new Date(value));
}

function Panel({
  title,
  subtitle,
  count,
  countTone = 'neutral',
  href,
  action,
  headerAction,
  children
}: {
  title: string;
  subtitle: string;
  count: number | string;
  countTone?: 'neutral' | 'message' | 'alert';
  href?: string;
  action?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-[190px] min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-background lg:h-full lg:min-h-0">
      <header className="shrink-0 border-b border-border p-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold">{title}</h4>
          <div className="flex shrink-0 items-center gap-2">
          {headerAction}
          <span
            className={[
              'inline-flex min-h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold tabular-nums',
              Number(count) > 0 && countTone === 'message'
                ? 'bg-emerald-500 text-white'
                : Number(count) > 0 && countTone === 'alert'
                  ? 'bg-rose-500 text-white'
                  : 'bg-surface-muted text-muted'
            ].join(' ')}
          >
            {count}
          </span>
          </div>
        </div>

        <p className="mt-1 text-xs leading-4 text-muted">
          {subtitle}
        </p>
      </header>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-2.5">
        {children}
      </div>

      <footer className="shrink-0 border-t border-border p-2.5">
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-xs font-medium text-theme-accent hover:underline"
          >
            {action || 'View all'}
            <ArrowUpRight className="size-3.5" />
          </Link>
        ) : (
          <span className="text-[11px] text-muted">
            Select a conversation to preview
          </span>
        )}
      </footer>
    </section>
  );
}

export function AdminNotificationsOverview({
  data,
  messages
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function applyRead(action: () => Promise<unknown>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  const conversations = messages.conversations;

  const [selectedId, setSelectedId] = useState<string | null>(
    conversations[0]?.id ?? null
  );

  const selected = conversations.find(
    conversation => conversation.id === selectedId
  ) ?? conversations[0] ?? null;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
      <header className="shrink-0">
        <h3 className="text-sm font-semibold">
          Communications & Notifications
        </h3>

        <p className="mt-1 text-xs text-muted">
          Customer conversations and system alerts requiring attention.
        </p>
      </header>

      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 gap-3 overflow-y-auto lg:grid-cols-3 lg:overflow-hidden [&>*]:min-w-0">
        <Panel
          title="Customer Messages"
          subtitle="Assigned customer and project conversations."
          count={messages.unreadCount}
          countTone="message"
          headerAction={messages.unreadCount > 0 ? (
            <button type="button" disabled={pending}
              onClick={() => applyRead(markAllAdminConversationsRead)}
              className="text-[11px] font-semibold text-emerald-600 hover:underline disabled:opacity-40">
              Mark all read
            </button>
          ) : null}
          href="/admin/messages"
          action="Open messages"
        >
          {conversations.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-3">
              <MessageSquareText className="size-4 text-muted" />
              <p className="mt-2 text-xs leading-5 text-muted">
                No conversations assigned to this administrator.
              </p>
            </div>
          ) : (
            conversations.map(conversation => (
              <div key={conversation.id} className="overflow-hidden rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setSelectedId(conversation.id)}
                className={
                  'w-full p-3 text-left transition-colors ' +
                  (conversation.id === selected?.id
                    ? 'bg-theme-accent-faint'
                    : 'hover:bg-surface-raised')
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 truncate text-xs font-semibold">
                    {conversation.title}
                  </p>

                  {conversation.unread > 0 ? (
                    <span className="inline-flex min-h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-semibold text-white">
                      {conversation.unread}
                    </span>
                  ) : null}
                </div>

                <p className="mt-1 truncate text-[11px] text-muted">
                  {conversation.people || 'Project conversation'}
                </p>

                <p className="mt-2 line-clamp-2 text-xs leading-4 text-muted">
                  {conversation.lastMessage}
                </p>

                <p className="mt-2 text-[11px] text-muted">
                  {formatDate(conversation.updatedAt)}
                </p>
              </button>
              {conversation.unread > 0 ? (
                <button type="button" disabled={pending}
                  onClick={() => applyRead(() => markAdminConversationRead(conversation.id))}
                  className="block w-full px-3 pb-3 pt-0 text-left text-[11px] font-medium text-emerald-600 hover:underline disabled:opacity-40">
                  <Check aria-hidden="true" className="mr-1 inline size-3.5 align-[-2px]" />
                  Mark as read
                </button>
              ) : (
                <span className="block px-3 pb-3 pt-0 text-[11px] font-medium text-muted"><CheckCheck aria-hidden="true" className="mr-1 inline size-3.5 align-[-2px]" />Read</span>
              )}
              </div>
            ))
          )}
        </Panel>

        <Panel
          title="System Alerts"
          subtitle="Notification records for this administrator."
          count={data.unreadCount}
          countTone="alert"
          headerAction={data.unreadCount > 0 ? (
            <button type="button" disabled={pending}
              onClick={() => applyRead(markAllAdminNotificationsRead)}
              className="text-[11px] font-semibold text-theme-accent hover:underline disabled:opacity-40">
              Mark all read
            </button>
          ) : null}
        >
          {data.notifications.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-3">
              <Bell className="size-4 text-muted" />
              <p className="mt-2 text-xs leading-5 text-muted">
                No system notifications recorded.
              </p>
            </div>
          ) : (
            data.notifications.map(notification => (
              <div
                key={notification.id}
                className="rounded-lg border border-border p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 text-xs font-semibold">
                    {notification.title}
                  </p>

                  {!notification.readAt ? (
                    <span className="size-2 shrink-0 rounded-full bg-theme-accent" />
                  ) : null}
                </div>

                <p className="mt-1 line-clamp-3 text-xs leading-5 text-muted">
                  {notification.message}
                </p>

                <p className="mt-2 text-[11px] text-muted">
                  {formatDate(notification.createdAt)}
                </p>

                {!notification.readAt ? (
                  <button type="button" disabled={pending}
                    onClick={() => applyRead(() => markAdminNotificationRead(notification.id))}
                    className="mt-2 block text-xs font-medium text-theme-accent hover:underline disabled:opacity-40">
                    <Check aria-hidden="true" className="mr-1 inline size-3.5 align-[-2px]" />
                    Mark as read
                  </button>
                ) : (
                  <span className="mt-2 block text-xs font-medium text-muted"><CheckCheck aria-hidden="true" className="mr-1 inline size-3.5 align-[-2px]" />Read</span>
                )}

                {notification.href ? (
                  <Link
                    href={notification.href}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-theme-accent hover:underline"
                  >
                    Related item
                    <ArrowUpRight className="size-3" />
                  </Link>
                ) : null}
              </div>
            ))
          )}
        </Panel>

        <Panel
          title="Message Details"
          subtitle="Preview and open the selected conversation."
          count={selected ? 1 : 0}
          href={selected
            ? `/admin/messages?conversation=${encodeURIComponent(selected.id)}`
            : '/admin/messages'}
          action={selected ? 'Open conversation' : 'Open messages'}
        >
          {selected ? (
            <article className="min-w-0 space-y-3 p-1">
              <div className="flex items-center gap-2">
                <MessageSquareText className="size-4 shrink-0 text-theme-accent" />

                <span className="text-xs text-muted">
                  {selected.unread > 0
                    ? `${selected.unread} unread`
                    : 'No unread messages'}
                </span>
              </div>

              <h4 className="break-words text-sm font-semibold">
                {selected.title}
              </h4>

              <p className="text-xs text-muted">
                {selected.people || 'Project conversation'}
              </p>

              <div className="rounded-lg border border-border p-3">
                <p className="whitespace-pre-wrap break-words text-xs leading-5">
                  {selected.lastMessage}
                </p>
              </div>

              <p className="text-[11px] text-muted">
                Last activity: {formatDate(selected.updatedAt)}
              </p>

              {selected.unread > 0 ? (
                <button type="button" disabled={pending}
                  onClick={() => applyRead(() => markAdminConversationRead(selected.id))}
                  className="block text-xs font-medium text-emerald-600 hover:underline disabled:opacity-40">
                  <Check aria-hidden="true" className="mr-1 inline size-3.5 align-[-2px]" />
                  Mark as read
                </button>
              ) : (
                <span className="block text-xs font-medium text-muted"><CheckCheck aria-hidden="true" className="mr-1 inline size-3.5 align-[-2px]" />Read</span>
              )}

              <Link
                href={`/admin/messages?conversation=${encodeURIComponent(selected.id)}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-theme-accent hover:underline"
              >
                Read or reply
                <ArrowUpRight className="size-3.5" />
              </Link>
            </article>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-3">
              <Inbox className="size-4 text-muted" />

              <p className="mt-2 text-xs leading-5 text-muted">
                Select a customer conversation to see its latest message.
              </p>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
