'use client';

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
    <a
      href="mailto:dennis@rcentz.cc?subject=Rcentz%20Systems%20project%20enquiry"
      onClick={onNavigate}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-full bg-foreground font-medium text-background hover:opacity-85',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        mobile ? 'min-h-11 w-full px-4 text-sm'
          : compact ? 'h-8 px-3 text-xs' : 'h-9 px-4 text-xs',
      ].join(' ')}>
      Discuss a project
      <ArrowUpRight aria-hidden="true" className="size-3.5" />
    </a>
  );
}
