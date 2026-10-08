'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

type AccountActionsProps = {
  account: { signedIn: boolean; hasProjects: boolean } | null;
  mobile?: boolean;
  compact?: boolean;
  onNavigate?: () => void;
};

export function RcentzAccountActions({ account, mobile = false, compact = false, onNavigate }: AccountActionsProps) {
  const signedIn = account?.signedIn === true;
  const hasProjects = signedIn && account?.hasProjects === true;
  const sizing = mobile ? 'min-h-11 px-4 text-sm' : compact ? 'h-8 px-3 text-xs' : 'h-9 px-3 text-xs';
  const focus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <div className={mobile ? 'grid min-w-0 grid-cols-2 gap-2' : 'flex shrink-0 items-center gap-2'}>
      <Link
        href={signedIn ? '/dashboard' : '/login'}
        onClick={onNavigate}
        className={['inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium hover:bg-surface-muted', sizing, focus].join(' ')}>
        {signedIn ? 'Workspace' : 'Login'}
      </Link>
      <Link
        href={hasProjects ? '/dashboard/projects' : '/start-project'}
        onClick={onNavigate}
        className={['inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-foreground font-medium text-background hover:opacity-85', sizing, focus].join(' ')}>
        {hasProjects ? 'Projects' : 'Start a project'}
        <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
      </Link>
    </div>
  );
}
