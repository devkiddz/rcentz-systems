'use client';

import type { ReactNode } from 'react';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import {
  Bell,
  ChevronDown,
  CircleUserRound,
  ClipboardList,
  ExternalLink,
  FileStack,
  FolderKanban,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  MessageSquareText,
  Package,
  ReceiptText,
  Settings,
  Sparkles
} from 'lucide-react';

import { usePathname, useRouter } from 'next/navigation';

import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger
} from '@/components/ui/sidebar';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { ClientCommandSearch } from '@/features/client/components/shell/ClientCommandSearch';
import { ClientMessagesMenu } from '@/features/client/components/shell/ClientMessagesMenu';
import { ClientNotificationsMenu } from '@/features/client/components/shell/ClientNotificationsMenu';
import { ClientWorkspaceHeader } from '@/features/client/components/shell/ClientWorkspaceHeader';

import type { ClientHeaderFeed } from '@/features/client/types/client-header';

import { authClient } from '@/lib/auth-client';

import { RcentzBrandLogo } from '@/ui-shell/brand/RcentzBrandLogo';
import { RcentzThemeControl } from '@/ui-shell/theme/RcentzThemeControl';

type ClientShellProps = {
  children: ReactNode;

  user: {
    name: string;
    email: string;
    image: string | null;
  };

  headerFeed: ClientHeaderFeed;
};

type ClientNavigationItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
};

type ClientHeaderIdentity = {
  title: string;
  description: string;
};

const projectNavigation = [
  {
    label: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    label: 'Projects',
    href: '/dashboard/projects',
    icon: FolderKanban
  },
  {
    label: 'Products',
    href: '/dashboard/products',
    icon: Package
  },
  {
    label: 'Billing',
    href: '/dashboard/billing',
    icon: ReceiptText
  },
  {
    label: 'Requests',
    href: '/dashboard/requests',
    icon: ClipboardList
  }
] satisfies ClientNavigationItem[];

const workspaceNavigation = [
  {
    label: 'Messages',
    href: '/dashboard/messages',
    icon: MessageSquareText
  },
  {
    label: 'Files',
    href: '/dashboard/files',
    icon: FileStack
  },
  {
    label: 'Notifications',
    href: '/dashboard/notifications',
    icon: Bell
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings
  }
] satisfies ClientNavigationItem[];

const dashboardHeaderRoutes: Array<{
  path: string;
  exact?: boolean;
  identity: ClientHeaderIdentity;
}> = [
  {
    path: '/dashboard',
    exact: true,
    identity: {
      title: 'Overview',
      description: 'Account command overview'
    }
  },
  {
    path: '/dashboard/projects',
    identity: {
      title: 'Projects',
      description: 'Your Rcentz projects'
    }
  },
  {
    path: '/dashboard/products',
    identity: {
      title: 'Products',
      description: 'Rcentz product collection'
    }
  },
  {
    path: '/dashboard/billing',
    identity: {
      title: 'Billing',
      description: 'Invoices and payments'
    }
  },
  {
    path: '/dashboard/requests',
    identity: {
      title: 'Requests',
      description: 'Actions and service requests'
    }
  },
  {
    path: '/dashboard/messages',
    identity: {
      title: 'Messages',
      description: 'Client communication'
    }
  },
  {
    path: '/dashboard/files',
    identity: {
      title: 'Files',
      description: 'Documents and project resources'
    }
  },
  {
    path: '/dashboard/notifications',
    identity: {
      title: 'Notifications',
      description: 'Workspace alerts'
    }
  },
  {
    path: '/dashboard/profile',
    identity: {
      title: 'Profile',
      description: 'Client account'
    }
  },
  {
    path: '/dashboard/settings',
    identity: {
      title: 'Settings',
      description: 'Workspace preferences'
    }
  }
];

function isActiveRoute(pathname: string, href: string) {
  if (href === '/dashboard') {
    return pathname === '/dashboard';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getHeaderIdentity(pathname: string): ClientHeaderIdentity {
  const matchedRoute = dashboardHeaderRoutes.find(route => {
    if (route.exact) {
      return pathname === route.path;
    }

    return pathname === route.path || pathname.startsWith(`${route.path}/`);
  });

  return (
    matchedRoute?.identity ?? {
      title: 'Dashboard',
      description: 'Client workspace'
    }
  );
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(namePart => namePart.charAt(0).toUpperCase())
    .join('');

  return initials || 'R';
}

export function ClientShell({ children, user, headerFeed }: ClientShellProps) {
  return (
    <SidebarProvider className="bg-background">
      <ClientSidebar />

      <SidebarInset className="min-w-0 bg-background">
        <ClientHeader user={user} headerFeed={headerFeed} />

        <ClientWorkspaceHeader user={user} />

        <div className="min-w-0 flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function ClientSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border bg-sidebar">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Rcentz workspace"
              render={<Link href="/dashboard" />}
              className="transition-colors duration-150 hover:bg-sidebar-accent">
              <div className="flex shrink-0 items-center justify-center group-data-[collapsible=icon]:hidden">
                <RcentzBrandLogo className="w-20" />
              </div>

              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold tracking-[-0.02em] text-sidebar-foreground">
                  Workspace
                </span>

                <span className="truncate text-[10px] text-sidebar-foreground/55">Client workspace</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="bg-sidebar">
        <ClientNavigationGroup label="Project" items={projectNavigation} pathname={pathname} />

        <ClientNavigationGroup label="Workspace" items={workspaceNavigation} pathname={pathname} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border bg-sidebar">
        <div className="mx-2 mb-1 rounded-xl border border-sidebar-border bg-sidebar-accent px-3 py-3 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2">
            <Sparkles aria-hidden="true" className="size-3.5 shrink-0 text-theme-accent" />

            <p className="text-[10px] font-medium text-sidebar-foreground">Rcentz Client</p>
          </div>

          <p className="mt-1.5 text-[9px] leading-4 text-sidebar-foreground/55">
            Your workspace reflects the latest Rcentz account state.
          </p>
        </div>

        <SidebarRail />
      </SidebarFooter>
    </Sidebar>
  );
}

function ClientNavigationGroup({
  label,
  items,
  pathname
}: {
  label: string;
  items: ClientNavigationItem[];
  pathname: string;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sidebar-foreground/60">{label}</SidebarGroupLabel>

      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(item => {
            const Icon = item.icon;

            const active = isActiveRoute(pathname, item.href);

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={active}
                  tooltip={item.label}
                  render={<Link href={item.href} aria-current={active ? 'page' : undefined} />}
                  className={[
                    'group/client-nav',
                    'relative',
                    'transition-colors',
                    'duration-150',

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
                        : 'text-sidebar-foreground/55 transition-colors group-hover/client-nav:text-sidebar-foreground'
                    }
                  />

                  <span className={active ? 'font-semibold text-theme-accent' : 'font-medium'}>
                    {item.label}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function ClientHeader({
  user,
  headerFeed
}: {
  user: ClientShellProps['user'];
  headerFeed: ClientHeaderFeed;
}) {
  const pathname = usePathname();

  const headerIdentity = getHeaderIdentity(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="flex min-h-14 min-w-0 items-center gap-3 px-3 sm:px-4">
        <Tooltip>
          <TooltipTrigger
            render={
              <SidebarTrigger
                aria-label="Toggle sidebar"
                className="size-8 shrink-0 cursor-w-resize rounded-lg border-0 bg-transparent text-muted shadow-none transition-colors hover:bg-surface-muted hover:text-foreground"
              />
            }>
            <Menu aria-hidden="true" className="size-4" />
          </TooltipTrigger>

          <TooltipContent>Toggle sidebar</TooltipContent>
        </Tooltip>

        <div className="h-5 w-px shrink-0 bg-border" />

        <div className="min-w-0">
          <p className="truncate text-[12px] font-semibold tracking-[-0.02em] text-foreground">
            {headerIdentity.title}
          </p>

          <p className="hidden truncate text-[9px] text-muted sm:block">{headerIdentity.description}</p>
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-0.5">
          <ClientCommandSearch />

          <ClientMessagesMenu messages={headerFeed.messages} hasUnread={headerFeed.hasUnreadMessages} />

          <ClientNotificationsMenu
            notifications={headerFeed.notifications}
            unreadCount={headerFeed.unreadNotificationCount}
          />

          <RcentzThemeControl />

          <div className="ml-1">
            <ClientAccountMenu user={user} />
          </div>
        </div>
      </div>
    </header>
  );
}

function ClientAccountMenu({ user }: { user: ClientShellProps['user'] }) {
  const router = useRouter();

  const [isSigningOut, setIsSigningOut] = useState(false);

  const initials = useMemo(() => getInitials(user.name), [user.name]);

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await authClient.signOut();

      router.push('/login');

      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }

  function handleProfile() {
    router.push('/dashboard/profile');
  }

  function handleSettings() {
    router.push('/dashboard/settings');
  }

  function handleViewSite() {
    router.push('/');
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Open account menu"
            className="group flex min-w-0 cursor-pointer items-center gap-2 rounded-xl px-1.5 py-1 text-left transition-colors duration-150 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/40 sm:px-2">
            <Avatar
              size="sm"
              className="shrink-0 ring-1 ring-border transition-all duration-150 group-hover:ring-theme-accent/40">
              {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}

              <AvatarFallback className="bg-surface-muted text-[9px] font-semibold text-foreground">
                {initials}
              </AvatarFallback>

              <AvatarBadge aria-label="Active" className="border-2 border-surface bg-theme-accent" />
            </Avatar>

            <div className="hidden min-w-0 sm:block">
              <p className="max-w-32 truncate text-[11px] font-semibold text-foreground">{user.name}</p>

              <p className="max-w-32 truncate text-[9px] text-muted">Client</p>
            </div>

            <ChevronDown
              aria-hidden="true"
              className="hidden size-3.5 shrink-0 text-muted transition-transform duration-150 group-data-[popup-open]:rotate-180 sm:block"
            />
          </button>
        }
      />

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-72 overflow-hidden rounded-2xl border border-border bg-surface p-1 text-foreground shadow-xl">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="rounded-xl px-3 py-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-10 shrink-0 ring-1 ring-border">
                {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}

                <AvatarFallback className="bg-surface-muted text-[10px] font-semibold text-foreground">
                  {initials}
                </AvatarFallback>

                <AvatarBadge className="border-2 border-surface bg-theme-accent" />
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-foreground">{user.name}</p>

                <p className="mt-0.5 truncate text-[9px] font-normal text-muted">{user.email}</p>

                <div className="mt-1.5 flex items-center gap-1.5">
                  <CircleUserRound aria-hidden="true" className="size-3 text-theme-accent" />

                  <span className="text-[9px] font-medium text-theme-accent">Client workspace</span>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1 bg-border" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={handleProfile}
            className="cursor-pointer gap-3 rounded-xl px-3 py-2.5 text-foreground transition-colors duration-150 hover:bg-surface-muted focus:bg-surface-muted">
            <CircleUserRound aria-hidden="true" className="size-4 text-muted" />

            <div>
              <p className="text-[11px] font-medium text-foreground">Profile</p>

              <p className="mt-0.5 text-[8px] text-muted">Account and client information</p>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleSettings}
            className="cursor-pointer gap-3 rounded-xl px-3 py-2.5 text-foreground transition-colors duration-150 hover:bg-surface-muted focus:bg-surface-muted">
            <Settings aria-hidden="true" className="size-4 text-muted" />

            <div>
              <p className="text-[11px] font-medium text-foreground">Settings</p>

              <p className="mt-0.5 text-[8px] text-muted">Workspace preferences</p>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleViewSite}
            className="cursor-pointer gap-3 rounded-xl px-3 py-2.5 text-foreground transition-colors duration-150 hover:bg-surface-muted focus:bg-surface-muted">
            <ExternalLink aria-hidden="true" className="size-4 text-muted" />

            <div>
              <p className="text-[11px] font-medium text-foreground">View Rcentz</p>

              <p className="mt-0.5 text-[8px] text-muted">Open the public website</p>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1 bg-border" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            disabled={isSigningOut}
            onClick={handleSignOut}
            className="cursor-pointer gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150">
            {isSigningOut ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <LogOut aria-hidden="true" className="size-4" />
            )}

            <div>
              <p className="text-[11px] font-medium">{isSigningOut ? 'Signing out' : 'Sign out'}</p>

              <p className="mt-0.5 text-[8px] opacity-70">End this client session</p>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
