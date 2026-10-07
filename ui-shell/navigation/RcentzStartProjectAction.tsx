'use client';

import { projectEntryUrl } from '@/features/systems/lib/project-entry';
import Link from 'next/link';

import { ArrowUpRight } from 'lucide-react';

type RcentzStartProjectActionProps = {
  mobile?: boolean;
  compact?: boolean;
  onNavigate?: () => void;
};

export function RcentzStartProjectAction({
  mobile = false,
  compact = false,
  onNavigate,
}: RcentzStartProjectActionProps) {
  return (
    <Link
      href={projectEntryUrl}
      onClick={onNavigate}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-md bg-foreground font-medium text-background hover:opacity-85',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        mobile ? 'min-h-11 w-full px-4 text-sm'
          : compact ? 'h-8 px-3 text-xs' : 'h-9 px-4 text-xs',
      ].join(' ')}>
      Start a project
      <ArrowUpRight aria-hidden="true" className="size-3.5" />
    </Link>
  );
}
