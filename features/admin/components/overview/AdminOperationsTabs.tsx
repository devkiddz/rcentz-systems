'use client';

import { useState } from 'react';

import { Bell, CheckSquare2, UsersRound } from 'lucide-react';

import { AdminClientIntelligenceOverview } from './AdminClientIntelligenceOverview';
import { AdminNotificationsOverview } from './AdminNotificationsOverview';
import { AdminTasksOverview } from './AdminTasksOverview';

import type { OverviewClient } from '@/features/admin/server/overview/get-overview-clients';
import type { CommercialPreview } from '@/features/admin/server/overview/get-commercial-preview';
import type { OverviewNotifications } from '@/features/admin/server/overview/get-overview-notifications';
import type { OverviewMessages } from '@/features/admin/server/overview/get-overview-messages';
import type { OverviewTasks } from '@/features/admin/server/overview/get-overview-tasks';

type AdminOperationsTabsProps = {
  tasks: OverviewTasks;
  clients: OverviewClient[];
  commercialPreview: CommercialPreview;
  notifications: OverviewNotifications;
  messages: OverviewMessages;
};

type OperationsTab = 'tasks' | 'clients' | 'notifications';

export function AdminOperationsTabs({ tasks, clients, notifications, commercialPreview, messages }: AdminOperationsTabsProps) {
  const [activeTab, setActiveTab] = useState<OperationsTab>('tasks');

  const taskCount = tasks.tasks.length;
  const clientCount = clients.length;
  const notificationCount = notifications.unreadCount + messages.unreadCount;

  const tabs = [
    {
      id: 'tasks' as const,
      label: 'Tasks',
      count: taskCount,
      icon: CheckSquare2
    },
    {
      id: 'clients' as const,
      label: 'Clients',
      count: clientCount,
      icon: UsersRound
    },
    {
      id: 'notifications' as const,
      label: 'Notifications',
      count: notificationCount,
      icon: Bell
    }
  ];

  return (
    <section className="flex h-[500px] max-h-[500px] min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-background lg:h-[460px] lg:max-h-[460px]">
      <div
        role="tablist"
        aria-label="Admin operations"
        className="flex shrink-0 items-center gap-1 border-b border-border px-3 pt-3">
        {tabs.map(tab => {
          const Icon = tab.icon;

          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex h-11 cursor-pointer items-center gap-2 rounded-t-xl px-3 text-sm font-medium transition-colors ${
                isActive ? 'text-foreground' : 'text-muted hover:text-foreground'
              }`}>
              <Icon aria-hidden="true" className={`size-4 ${isActive ? 'text-theme-accent' : ''}`} />

              <span>{tab.label}</span>

              <span
                className={`flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums ${
                  isActive ? 'bg-theme-accent-faint text-theme-accent' : 'bg-surface-muted text-muted'
                }`}>
                {tab.count}
              </span>

              {isActive ? (
                <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-theme-accent" />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="min-h-0 min-w-0 flex-1 p-3 sm:p-4">
        <div role="tabpanel" className="flex h-full min-h-0 min-w-0 flex-col">
          {activeTab === 'tasks' ? <AdminTasksOverview data={tasks} /> : null}

          {activeTab === 'clients' ? <AdminClientIntelligenceOverview
            clients={clients}
            commercialPreview={commercialPreview}
          /> : null}

          {activeTab === 'notifications' ? <AdminNotificationsOverview data={notifications} messages={messages} /> : null}
        </div>
      </div>
    </section>
  );
}
