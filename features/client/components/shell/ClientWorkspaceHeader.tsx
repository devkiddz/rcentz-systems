'use client';

import { useState } from 'react';

import {
  BriefcaseBusiness,
  FolderPlus,
  Headphones,
  LoaderCircle,
  LogOut,
  MessageSquarePlus,
  Plus,
  ShoppingBag
} from 'lucide-react';

import { usePathname, useRouter } from 'next/navigation';

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

type Props = {
  user: {
    name: string;
    email: string;
    image: string | null;
  };
};

const quickActions = [
  {
    label: 'Start conversation',
    description: 'Message the Rcentz team',
    href: 'mailto:contact@rcentz.cc',
    icon: MessageSquarePlus
  },
  {
    label: 'Start new project',
    description: 'Begin a new project request',
    href: '/dashboard/onboarding',
    icon: FolderPlus
  },
  {
    label: 'Request service',
    description: 'Explore and request a Rcentz service',
    href: '/solutions',
    icon: BriefcaseBusiness
  },
  {
    label: 'Open support ticket',
    description: 'Request help or report an issue',
    href: 'mailto:contact@rcentz.cc?subject=Support%20request',
    icon: Headphones
  },
  {
    label: 'Explore products',
    description: 'Browse available Rcentz products',
    href: '/dashboard/products',
    icon: ShoppingBag
  }
];

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('') || 'R'
  );
}

function shouldShow(pathname: string) {
  if (pathname === '/dashboard') {
    return true;
  }

  const segments = pathname.split('/').filter(Boolean);

  if (segments[0] !== 'dashboard') {
    return false;
  }

  return segments.length === 2;
}

export function ClientWorkspaceHeader({ user }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const [signingOut, setSigningOut] = useState(false);

  if (!shouldShow(pathname)) {
    return null;
  }

  const firstName = user.name.trim().split(/\s+/)[0] || user.name;

  async function signOut() {
    if (signingOut) {
      return;
    }

    setSigningOut(true);

    try {
      await authClient.signOut();

      router.push('/login');
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="border-b border-border bg-background">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-5 sm:px-6 lg:px-8">
        <section className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-10 shrink-0 ring-1 ring-border sm:size-11">
              {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}

              <AvatarFallback className="bg-surface-muted text-[11px] font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-theme-accent">
                Client Workspace
              </p>

              <h2 className="mt-1 truncate text-[17px] font-semibold tracking-[-0.03em] text-foreground sm:text-lg">
                Welcome back, {firstName}
              </h2>

              <p className="mt-1 hidden text-[11px] text-muted sm:block">
                Projects, billing and communication with Rcentz.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    aria-label="Quick create"
                    className="group flex size-10 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface-raised text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/40">
                    <Plus className="size-4 transition-transform duration-150 group-data-[popup-open]:rotate-45" />
                  </button>
                }
              />

              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-80 overflow-hidden rounded-2xl border border-border bg-surface p-1 shadow-xl">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-3 py-3">
                    <p className="text-[13px] font-semibold text-foreground">Quick actions</p>

                    <p className="mt-0.5 text-[11px] font-normal text-muted">Start something with Rcentz.</p>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  {quickActions.map(action => {
                    const Icon = action.icon;

                    return (
                      <DropdownMenuItem
                        key={action.label}
                        onClick={() => {
                          if (action.href.startsWith('mailto:')) window.location.assign(action.href);
                          else router.push(action.href);
                        }}
                        className="cursor-pointer gap-3 rounded-xl px-3 py-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background">
                          <Icon className="size-4 text-theme-accent" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-foreground">{action.label}</p>

                          <p className="mt-0.5 text-[11px] leading-5 text-muted">{action.description}</p>
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              type="button"
              aria-label={signingOut ? 'Signing out' : 'Sign out'}
              disabled={signingOut}
              onClick={signOut}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-[13px] font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground disabled:opacity-50">
              {signingOut ? <LoaderCircle className="size-4 animate-spin" /> : <LogOut className="size-4" />}

              <span className="hidden sm:inline">{signingOut ? 'Signing out...' : 'Sign out'}</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
