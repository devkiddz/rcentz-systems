'use client';

import { useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  ChevronDown,
  ExternalLink,
  LoaderCircle,
  LogOut,
  Settings,
  ShieldCheck,
  UserRound
} from 'lucide-react';

import { useTranslations } from 'next-intl';

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

import { authClient } from '@/lib/auth-client';

type AdminAccountMenuProps = {
  user: {
    name: string;
    email: string;
    image: string | null;
    role: 'ADMIN' | 'SUPER_ADMIN';
  };
};

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(namePart => namePart.charAt(0).toUpperCase())
    .join('');

  return initials || 'R';
}

export function AdminAccountMenu({ user }: AdminAccountMenuProps) {
  const router = useRouter();

  const t = useTranslations('AdminNavigation');

  const [isSigningOut, setIsSigningOut] = useState(false);

  const initials = useMemo(() => getInitials(user.name), [user.name]);

  async function handleSignOut() {
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

  function handleProfile() {
    router.push('/admin/profile');
  }

  function handleSettings() {
    router.push('/admin/settings');
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
            aria-label={t('account.openMenu')}
            className="
              group
              flex
              min-w-0
              cursor-pointer
              items-center
              gap-2
              rounded-xl
              px-1.5
              py-1
              text-left
              transition-colors
              duration-150
              hover:bg-surface-muted
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-theme-accent/40
              sm:px-2
            ">
            <Avatar
              size="sm"
              className="
                shrink-0
                ring-1
                ring-border
                transition-all
                duration-150
                group-hover:ring-theme-accent/40
              ">
              {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}

              <AvatarFallback className="bg-surface-muted text-xs font-semibold text-foreground">
                {initials}
              </AvatarFallback>

              <AvatarBadge aria-label="Active" className="border-2 border-surface bg-theme-accent" />
            </Avatar>

            <div className="hidden min-w-0 sm:block">
              <p className="max-w-32 truncate text-xs font-semibold text-foreground">{user.name}</p>

              <p className="max-w-32 truncate text-xs text-muted">{t(`account.roles.${user.role}`)}</p>
            </div>

            <ChevronDown
              aria-hidden="true"
              className="
                hidden
                size-3.5
                shrink-0
                text-muted
                transition-transform
                duration-150
                group-data-[popup-open]:rotate-180
                sm:block
              "
            />
          </button>
        }
      />

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="
          w-72
          overflow-hidden
          rounded-2xl
          border
          border-border
          bg-surface
          p-1
          text-foreground
          shadow-xl
        ">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="rounded-xl px-3 py-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-10 shrink-0 ring-1 ring-border">
                {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}

                <AvatarFallback className="bg-surface-muted text-xs font-semibold text-foreground">
                  {initials}
                </AvatarFallback>

                <AvatarBadge className="border-2 border-surface bg-theme-accent" />
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>

                <p className="mt-0.5 truncate text-xs font-normal text-muted">{user.email}</p>

                <div className="mt-1.5 flex items-center gap-1.5">
                  <ShieldCheck aria-hidden="true" className="size-3 text-theme-accent" />

                  <span className="text-xs font-medium text-theme-accent">
                    {t(`account.roles.${user.role}`)}
                  </span>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1 bg-border" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={handleProfile}
            className="
              cursor-pointer
              gap-3
              rounded-xl
              px-3
              py-2.5
              text-foreground
              transition-colors
              duration-150
              hover:bg-surface-muted
              focus:bg-surface-muted
            ">
            <UserRound aria-hidden="true" className="size-4 text-muted" />

            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground">Admin profile</p>

              <p className="mt-0.5 text-xs text-muted">Account and personal information</p>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleSettings}
            className="
              cursor-pointer
              gap-3
              rounded-xl
              px-3
              py-2.5
              text-foreground
              transition-colors
              duration-150
              hover:bg-surface-muted
              focus:bg-surface-muted
            ">
            <Settings aria-hidden="true" className="size-4 text-muted" />

            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground">Settings</p>

              <p className="mt-0.5 text-xs text-muted">Workspace preferences</p>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleViewSite}
            className="
              cursor-pointer
              gap-3
              rounded-xl
              px-3
              py-2.5
              text-foreground
              transition-colors
              duration-150
              hover:bg-surface-muted
              focus:bg-surface-muted
            ">
            <ExternalLink aria-hidden="true" className="size-4 text-muted" />

            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground">{t('account.viewSite')}</p>

              <p className="mt-0.5 text-xs text-muted">Open the public Rcentz website</p>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1 bg-border" />

        <div className="px-1 py-1">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-raised px-2.5 py-2">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-theme-accent-faint">
              <ShieldCheck aria-hidden="true" className="size-3.5 text-theme-accent" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">Protected admin session</p>

              <p className="mt-0.5 text-xs leading-3 text-muted">Authenticated Rcentz workspace</p>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="my-1 bg-border" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            disabled={isSigningOut}
            onClick={handleSignOut}
            className="
              cursor-pointer
              gap-3
              rounded-xl
              px-3
              py-2.5
              transition-colors
              duration-150
            ">
            {isSigningOut ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <LogOut aria-hidden="true" className="size-4" />
            )}

            <div className="min-w-0">
              <p className="text-xs font-medium">
                {isSigningOut ? t('account.signingOut') : t('account.signOut')}
              </p>

              <p className="mt-0.5 text-xs opacity-70">End this admin session</p>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
