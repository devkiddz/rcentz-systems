'use client';

import { useState } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { FilePlus2, FolderPlus, LoaderCircle, LogOut, Plus } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import { authClient } from '@/lib/auth-client';

type AdminWorkspaceHeaderProps = {
  user: {
    name: string;
    email: string;
    image: string | null;
  };
};

const createActions = [
  {
    label: 'New project',
    description: 'Start and configure a client project',
    href: '/admin/projects/new',
    icon: FolderPlus
  },
  {
    label: 'Create invoice',
    description: 'Compose a new client invoice',
    href: '/admin/invoices/new',
    icon: FilePlus2
  }
];

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => {
      return part.charAt(0).toUpperCase();
    })
    .join('');

  return initials || 'R';
}

function shouldShowWorkspaceHeader(pathname: string) {
  if (pathname === '/admin') {
    return true;
  }

  const segments = pathname.split('/').filter(Boolean);

  if (segments[0] !== 'admin') {
    return false;
  }

  /*
   * Static admin routes:
   *
   * /admin/projects
   * /admin/invoices
   * /admin/clients
   * /admin/settings
   */
  if (segments.length === 2) {
    return true;
  }

  /*
   * Creation routes are also workspace routes:
   *
   * /admin/projects/new
   * /admin/tasks/new
   * /admin/invoices/new
   */
  if (segments.length === 3 && (segments[2] === 'new' || segments[2] === 'create')) {
    return true;
  }

  /*
   * Focused record routes do not use this header:
   *
   * /admin/projects/[projectId]
   * /admin/invoices/[invoiceId]
   * /admin/clients/[clientId]
   */
  return false;
}

export function AdminWorkspaceHeader({ user }: AdminWorkspaceHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isSigningOut, setIsSigningOut] = useState(false);

  const firstName = user.name.trim().split(/\s+/)[0] || user.name;

  if (!shouldShowWorkspaceHeader(pathname)) {
    return null;
  }

  async function handleLogout() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await authClient.signOut();

      router.push('/adminlogin/login');
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <div className="border-b border-border bg-background">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-5 sm:px-6 lg:px-8">
        <section className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-10 shrink-0 ring-1 ring-border sm:size-11">
              {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}

              <AvatarFallback className="bg-surface-muted text-xs font-semibold text-foreground">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-theme-accent sm:text-xs">
                Operations Workspace
              </p>

              <p className="mt-1 truncate text-base font-semibold tracking-[-0.03em] text-foreground sm:text-lg">
                Welcome back, {firstName}
              </p>

              <p className="mt-1 hidden truncate text-xs text-muted sm:block">
                Monitor and manage activity across Rcentz Systems.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    aria-label="Create new"
                    className="group flex size-9 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface-raised text-foreground transition-[background-color,border-color,transform] duration-150 hover:-translate-y-px hover:border-foreground/20 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/40">
                    <Plus
                      aria-hidden="true"
                      className="size-4 transition-transform duration-150 group-data-[popup-open]:rotate-45"
                    />
                  </button>
                }
              />

              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-72 overflow-hidden rounded-2xl border border-border bg-surface p-1 text-foreground shadow-xl">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-3 py-2.5">
                    <p className="text-xs font-semibold text-foreground">Create new</p>

                    <p className="mt-0.5 text-xs font-normal text-muted">
                      Start a new Rcentz business record.
                    </p>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1 bg-border" />

                <DropdownMenuGroup>
                  {createActions.map(action => {
                    const Icon = action.icon;

                    return (
                      <DropdownMenuItem
                        key={action.href}
                        onClick={() => {
                          router.push(action.href);
                        }}
                        className="cursor-pointer gap-3 rounded-xl px-3 py-2.5 text-foreground transition-colors duration-150 hover:bg-surface-muted focus:bg-surface-muted">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                          <Icon aria-hidden="true" className="size-3.5 text-theme-accent" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground">{action.label}</p>

                          <p className="mt-0.5 text-xs leading-4 text-muted">{action.description}</p>
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              type="button"
              disabled={isSigningOut}
              onClick={handleLogout}
              aria-label="Logout"
              className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-xl px-2.5 text-xs font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:px-3">
              {isSigningOut ? (
                <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" />
              ) : (
                <LogOut aria-hidden="true" className="size-3.5" />
              )}

              <span className="hidden sm:inline">{isSigningOut ? 'Signing out...' : 'Logout'}</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
