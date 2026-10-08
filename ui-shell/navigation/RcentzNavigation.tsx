'use client';

import Link from 'next/link';
import { ChevronDown, ArrowUpRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { rcentzNavigationItems } from './rcentz-navigation-items';

type RcentzNavigationProps = {
  mobile?: boolean;
  compact?: boolean;
  onNavigate?: () => void;
};

export function RcentzNavigation({ mobile = false, compact = false, onNavigate }: RcentzNavigationProps) {
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    function dismiss(event: PointerEvent) {
      nav.current?.querySelectorAll('details[open]').forEach(details => {
        if (event.target instanceof Node && !details.contains(event.target)) {
          details.removeAttribute('open');
        }
      });
    }
    function escape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      const open = nav.current?.querySelector<HTMLDetailsElement>('details[open]');
      open?.removeAttribute('open');
      open?.querySelector('summary')?.focus();
    }
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, []);

  function navigate() {
    nav.current?.querySelectorAll('details[open]').forEach(details => details.removeAttribute('open'));
    onNavigate?.();
  }

  const linkClass = [
    'inline-flex items-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    compact ? 'min-h-9 px-1.5 text-[9px]' : 'min-h-11 px-2 text-[13px]',
    mobile ? 'w-full px-3 text-sm' : ''
  ].join(' ');

  return (
    <nav ref={nav} aria-label={compact ? 'Preview navigation' : mobile ? 'Mobile navigation' : 'Primary navigation'}
      className={mobile ? 'flex flex-col gap-1' : 'flex items-center gap-0.5'}>
      {rcentzNavigationItems.map(item => 'children' in item ? (
        <details key={item.label} className="group relative">
          <summary className={linkClass + ' cursor-pointer list-none gap-1 [&::-webkit-details-marker]:hidden'}>
            {item.label}
            <ChevronDown aria-hidden="true" className="size-3 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
          </summary>
          <div className={[
            'z-50 rounded-xl border border-border bg-background p-2',
            mobile ? 'mx-3 mb-2' : 'absolute left-0 top-full mt-1 w-52 shadow-sm'
          ].join(' ')}>
            {item.children.map(child => (
              <Link key={child.href} href={child.href} onClick={navigate}
                className="flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 text-xs hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {child.label}<ArrowUpRight aria-hidden="true" className="size-3 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </details>
      ) : (
        <Link key={item.label} href={item.href} onClick={navigate} className={linkClass}>{item.label}</Link>
      ))}
    </nav>
  );
}
