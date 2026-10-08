'use client';

import { useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  Eye,
  FileText,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  MessageSquareText,
  Plus,
  Settings,
  ShieldCheck,
  UsersRound,
  WalletCards,
} from 'lucide-react';

import { useTranslations } from 'next-intl';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar';

import { RcentzLogo } from '@/ui-shell/brand/RcentzLogo';

type AdminNavigationAction = {
  key: string;
  label: string;
  href: string;
  icon: typeof Eye;
};

type AdminNavigationItem = {
  key: string;
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  actions?: AdminNavigationAction[];
};

const workspaceNavigation = [
  {
    key: 'overview',
    label: 'Overview',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    key: 'requests',
    label: 'Service Requests',
    href: '/admin/requests',
    icon: BriefcaseBusiness
  },
  {
    key: 'projects',
    label: 'Projects',
    href: '/admin/projects',
    icon: FolderKanban,
    actions: [
      {
        key: 'view-projects',
        label: 'View Projects',
        href: '/admin/projects',
        icon: Eye
      },
      {
        key: 'create-project',
        label: 'Create Project',
        href: '/admin/projects/new',
        icon: Plus
      }
    ]
  },
  {
    key: 'tasks',
    label: 'Tasks',
    href: '/admin/tasks',
    icon: ListTodo,
    actions: [
      {
        key: 'view-tasks',
        label: 'View Tasks',
        href: '/admin/tasks',
        icon: Eye
      },
    ]
  },
  {
    key: 'clients',
    label: 'Clients',
    href: '/admin/clients',
    icon: UsersRound
  }
] satisfies AdminNavigationItem[];

const communicationNavigation = [
  {
    key: 'messages',
    label: 'Messages',
    href: '/admin/messages',
    icon: MessageSquareText,
    actions: [
      {
        key: 'view-messages',
        label: 'View Messages',
        href: '/admin/messages',
        icon: Eye
      },
    ]
  },
  {
    key: 'notifications',
    label: 'Notifications',
    href: '/admin/notifications',
    icon: Bell
  },
] satisfies AdminNavigationItem[];

const financeNavigation = [
  {
    key: 'finance',
    label: 'Finance',
    href: '/admin/finance',
    icon: WalletCards
  },
  {
    key: 'invoice',
    label: 'Invoice',
    href: '/admin/invoices',
    icon: FileText,
    actions: [
      {
        key: 'view-invoice',
        label: 'View Invoice',
        href: '/admin/invoices',
        icon: Eye
      },
      {
        key: 'create-invoice',
        label: 'Create Invoice',
        href: '/admin/invoices/new',
        icon: Plus
      }
    ]
  },
] satisfies AdminNavigationItem[];

const managementNavigation = [
  {
    key: 'settings',
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings
  }
] satisfies AdminNavigationItem[];

function isActiveRoute(pathname: string, href: string) {
  if (href === '/admin') {
    return pathname === '/admin';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function isActionActive(pathname: string, action: AdminNavigationAction) {
  return pathname === action.href;
}

type AdminNavigationGroupProps = {
  label: string;
  items: AdminNavigationItem[];
  pathname: string;
  onNavigate: () => void;
};

function AdminNavigationGroup({ label, items, pathname, onNavigate }: AdminNavigationGroupProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  function isExpanded(item: AdminNavigationItem) {
    const override = expandedItems[item.key];

    if (override !== undefined) {
      return override;
    }

    return isActiveRoute(pathname, item.href);
  }

  function toggleItem(item: AdminNavigationItem) {
    const currentlyExpanded = isExpanded(item);

    setExpandedItems(current => {
      return {
        ...current,
        [item.key]: !currentlyExpanded
      };
    });
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sidebar-foreground/60">{label}</SidebarGroupLabel>

      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(item => {
            const Icon = item.icon;
            const hasActions = Boolean(item.actions?.length);
            const active = isActiveRoute(pathname, item.href);
            const expanded = hasActions && isExpanded(item);

            return (
              <SidebarMenuItem key={item.key}>
                {hasActions ? (
                  <SidebarMenuButton
                    type="button"
                    isActive={active}
                    tooltip={item.label}
                    aria-expanded={expanded}
                    onClick={() => toggleItem(item)}
                    className={[
                      'group/admin-nav relative cursor-pointer transition-colors duration-150',
                      active
                        ? [
                            'bg-theme-accent-faint',
                            'text-theme-accent',
                            'hover:bg-theme-accent-soft',
                            'hover:text-theme-accent'
                          ].join(' ')
                        : [
                            'text-sidebar-foreground/72',
                            'hover:bg-sidebar-accent',
                            'hover:text-sidebar-foreground'
                          ].join(' ')
                    ].join(' ')}>
                    {active ? (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-theme-accent"
                      />
                    ) : null}

                    <Icon
                      aria-hidden="true"
                      className={
                        active
                          ? 'text-theme-accent'
                          : 'text-sidebar-foreground/55 transition-colors group-hover/admin-nav:text-sidebar-foreground'
                      }
                    />

                    <span className={active ? 'font-semibold text-theme-accent' : 'font-medium'}>
                      {item.label}
                    </span>

                    <ChevronDown
                      aria-hidden="true"
                      className={[
                        'ml-auto size-3.5 shrink-0 transition-transform duration-150',
                        active ? 'text-theme-accent' : 'text-sidebar-foreground/45',
                        expanded ? 'rotate-0' : '-rotate-90'
                      ].join(' ')}
                    />
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton
                    isActive={active}
                    tooltip={item.label}
                    render={
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? 'page' : undefined}
                      />
                    }
                    className={[
                      'group/admin-nav relative transition-colors duration-150',
                      active
                        ? [
                            'bg-theme-accent-faint',
                            'text-theme-accent',
                            'hover:bg-theme-accent-soft',
                            'hover:text-theme-accent'
                          ].join(' ')
                        : [
                            'text-sidebar-foreground/72',
                            'hover:bg-sidebar-accent',
                            'hover:text-sidebar-foreground'
                          ].join(' ')
                    ].join(' ')}>
                    {active ? (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-theme-accent"
                      />
                    ) : null}

                    <Icon
                      aria-hidden="true"
                      className={
                        active
                          ? 'text-theme-accent'
                          : 'text-sidebar-foreground/55 transition-colors group-hover/admin-nav:text-sidebar-foreground'
                      }
                    />

                    <span className={active ? 'font-semibold text-theme-accent' : 'font-medium'}>
                      {item.label}
                    </span>
                  </SidebarMenuButton>
                )}

                {hasActions && expanded ? (
                  <SidebarMenuSub>
                    {item.actions?.map(action => {
                      const ActionIcon = action.icon;
                      const actionActive = isActionActive(pathname, action);

                      return (
                        <SidebarMenuSubItem key={action.key}>
                          <SidebarMenuSubButton
                            isActive={actionActive}
                            render={
                              <Link
                                href={action.href}
                                onClick={onNavigate}
                                aria-current={actionActive ? 'page' : undefined}
                              />
                            }
                            className={[
                              'group/admin-sub-nav transition-colors duration-150',
                              actionActive
                                ? 'bg-sidebar-accent font-semibold text-theme-accent'
                                : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                            ].join(' ')}>
                            <ActionIcon
                              aria-hidden="true"
                              className={
                                actionActive
                                  ? 'text-theme-accent'
                                  : 'text-sidebar-foreground/45 transition-colors group-hover/admin-sub-nav:text-sidebar-foreground'
                              }
                            />

                            <span>{action.label}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const t = useTranslations('AdminNavigation');

  function handleNavigate() {
    if (isMobile) {
      setOpenMobile(false);
    }
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border bg-sidebar">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip={t('workspace')}
              render={<Link href="/admin" onClick={handleNavigate} />}
              className="transition-colors duration-150 hover:bg-sidebar-accent">
              <div className="flex size-8 shrink-0 items-center justify-center">
                <RcentzLogo />
              </div>

              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold tracking-[-0.02em] text-sidebar-foreground">
                  Rcentz Systems
                </span>

                <span className="truncate text-[10px] text-sidebar-foreground/55">Admin workspace</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="bg-sidebar">
        <AdminNavigationGroup
          label="Workspace"
          items={workspaceNavigation}
          pathname={pathname}
          onNavigate={handleNavigate}
        />

        <AdminNavigationGroup
          label="Communication"
          items={communicationNavigation}
          pathname={pathname}
          onNavigate={handleNavigate}
        />

        <AdminNavigationGroup
          label="Finance"
          items={financeNavigation}
          pathname={pathname}
          onNavigate={handleNavigate}
        />

        <AdminNavigationGroup
          label="Management"
          items={managementNavigation}
          pathname={pathname}
          onNavigate={handleNavigate}
        />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border bg-sidebar">
        <div className="mx-2 mb-1 rounded-xl border border-sidebar-border bg-sidebar-accent px-3 py-3 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck aria-hidden="true" className="size-3.5 shrink-0 text-theme-accent" />

            <p className="text-[10px] font-semibold text-sidebar-foreground">Protected administration</p>
          </div>

          <p className="mt-1.5 text-[9px] leading-4 text-sidebar-foreground/55">{t('protected')}</p>
        </div>

        <SidebarRail />
      </SidebarFooter>
    </Sidebar>
  );
}
