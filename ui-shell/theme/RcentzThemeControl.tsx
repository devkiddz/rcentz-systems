'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

type RcentzThemeControlProps = {
  mobile?: boolean;
};

export function RcentzThemeControl({ mobile = false }: RcentzThemeControlProps) {
  const { resolvedTheme, setTheme } = useTheme();

  function toggleTheme() {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      title="Toggle color theme"
      className={[
        'inline-flex shrink-0 items-center justify-center rounded-full',

        'border border-border',
        'bg-surface-muted',
        'text-muted',

        'transition-[background-color,border-color,color,transform] duration-200',

        'hover:border-border-strong',
        'hover:bg-secondary',
        'hover:text-foreground',

        'active:scale-[0.96]',

        mobile ? 'size-9' : 'size-8'
      ].join(' ')}>
      <Moon aria-hidden="true" className="size-3.5 dark:hidden" />

      <Sun aria-hidden="true" className="hidden size-3.5 dark:block" />
    </button>
  );
}
