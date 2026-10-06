'use client';

import Link from 'next/link';

type RcentzNavigationProps = {
  mobile?: boolean;
  onNavigate?: () => void;
};

export function RcentzNavigation({
  mobile = false,
  onNavigate,
}: RcentzNavigationProps) {
  return (
    <nav
      aria-label={mobile ? 'Mobile navigation' : 'Primary navigation'}
      className={mobile ? 'flex flex-col gap-1' : 'hidden items-center gap-5 md:flex'}>
      <Link
        href="/"
        onClick={onNavigate}
        className="inline-flex min-h-11 items-center text-sm font-medium">
        Overview
      </Link>
      <a
        href="https://rcentz.cc"
        onClick={onNavigate}
        className="inline-flex min-h-11 items-center text-sm text-muted-foreground hover:text-foreground">
        Rcentz
      </a>
    </nav>
  );
}
