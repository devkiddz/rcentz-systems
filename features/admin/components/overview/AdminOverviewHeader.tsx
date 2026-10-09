'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { CheckSquare2, LogOut, Plus } from 'lucide-react';

import { authClient } from '@/lib/auth-client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Button } from '@/components/ui/button';

type AdminOverviewHeaderProps = {
  user: {
    name: string;
    email: string;
    image: string | null;
  };
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
}

export function AdminOverviewHeader({ user }: AdminOverviewHeaderProps) {
  const router = useRouter();

  const firstName = user.name.trim().split(/\s+/)[0] || user.name;

  async function handleLogout() {
    await authClient.signOut();

    router.push('/adminlogin/login');
    router.refresh();
  }

  return (
    <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="size-9 shrink-0 ring-1 ring-border sm:size-10">
          {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}

          <AvatarFallback className="bg-surface-muted text-xs font-semibold sm:text-xs">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-theme-accent sm:text-xs">
            Operations Overview
          </p>

          <h1 className="mt-1 truncate text-[15px] font-semibold tracking-[-0.03em] text-foreground sm:text-lg">
            Welcome back, {firstName}
          </h1>

          <p className="mt-1 hidden truncate text-xs text-muted sm:block">
            Monitor activity across Rcentz Systems.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          nativeButton={false}
          variant="ghost"
          render={<Link href="/admin/tasks/new" />}
          aria-label="Create task"
          className="size-8 cursor-pointer rounded-xl bg-surface-muted/55 p-0 shadow-none transition-all duration-150 hover:-translate-y-px hover:bg-surface-muted sm:h-8 sm:w-auto sm:px-2.5">
          <span className="flex size-5 items-center justify-center rounded-lg bg-background/80">
            <CheckSquare2 aria-hidden="true" className="size-3.5" />
          </span>

          <span className="hidden text-xs font-medium sm:inline">Create task</span>
        </Button>

        <Button
          nativeButton={false}
          render={<Link href="/admin/projects/new" />}
          className="h-8 cursor-pointer rounded-xl px-2.5 text-xs font-medium shadow-sm transition-all duration-150 hover:-translate-y-px sm:text-xs">
          <span className="flex size-5 items-center justify-center rounded-lg bg-black/10">
            <Plus aria-hidden="true" className="size-3.5" />
          </span>

          <span>New project</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={handleLogout}
          aria-label="Logout"
          className="size-8 cursor-pointer rounded-xl p-0 text-muted transition-colors hover:bg-surface-muted hover:text-foreground sm:h-8 sm:w-auto sm:px-2.5">
          <LogOut aria-hidden="true" className="size-3.5 shrink-0" />

          <span className="hidden text-xs font-medium sm:inline">Logout</span>
        </Button>
      </div>
    </section>
  );
}
