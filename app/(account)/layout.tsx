import type { ReactNode } from 'react';
import Link from 'next/link';
import { RcentzBrandLogo } from '@/ui-shell/brand/RcentzBrandLogo';
import { RcentzThemeControl } from '@/ui-shell/theme/RcentzThemeControl';

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
          <Link
            href="/"
            aria-label="Rcentz Systems home"
            className="inline-flex min-h-11 items-center"
          >
            <RcentzBrandLogo className="w-20" />
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
        <p>Rcentz Systems · From brief to delivery.</p>
        <a
          href="mailto:dennis@rcentz.cc"
          className="inline-flex min-h-11 items-center"
        >
          Need help? dennis@rcentz.cc
        </a>
      </footer>
    </div>
  );
}
