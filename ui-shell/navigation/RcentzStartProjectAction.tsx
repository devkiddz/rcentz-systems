'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('Header');

  return (
    <Link
      href="/services"
      onClick={onNavigate}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-full',
        'bg-foreground font-medium text-background hover:opacity-85',
        'transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        mobile
          ? 'min-h-11 w-full px-4 text-sm'
          : compact
            ? 'h-8 px-3 text-xs'
            : 'h-9 px-4 text-xs',
      ].join(' ')}>
      {t('startProject')}
      <ArrowUpRight aria-hidden="true" className="size-3.5" />
    </Link>
  );
}
