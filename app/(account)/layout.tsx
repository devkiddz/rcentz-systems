import type { ReactNode } from 'react';
import Link from 'next/link';
import { RcentzBrandLockup } from '@/ui-shell/brand/RcentzBrandLockup';
import { RcentzThemeControl } from '@/ui-shell/theme/RcentzThemeControl';

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-[var(--content-max)] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            aria-label="Rcentz Systems home"
            className="inline-flex min-h-11 items-center"
          >
            <RcentzBrandLockup className="w-26 shrink-0 md:w-28 xl:w-32" />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Back to website
            </Link>
            <RcentzThemeControl />
          </div>
        </div>
      </header>
      {children}
      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-xs text-muted-foreground sm:px-8">
        <p>Rcentz Systems Â· From brief to delivery.</p>
        <a
          href="mailto:contact@rcentz.cc"
          className="inline-flex min-h-11 items-center"
        >
          Need help? contact@rcentz.cc
        </a>
      </footer>
    </div>
  );
}
