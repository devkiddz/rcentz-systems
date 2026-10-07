'use client';

import Link from 'next/link';

import { ChevronDown, ArrowUpRight } from 'lucide-react';
import { useEffect, useRef } from 'react';

type RcentzNavigationProps = {
  mobile?: boolean;
  onNavigate?: () => void;
};

const resources = [
  { label: 'Rcentz', description: 'Company and wider ecosystem', href: 'https://rcentz.cc' },
  { label: 'Products', description: 'Explore Rcentz products', href: 'https://products.rcentz.cc' },
] as const;

export function RcentzNavigation({
  mobile = false,
  onNavigate,
}: RcentzNavigationProps) {
  const dropdown = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function dismiss(event: PointerEvent) {
      if (event.target instanceof Node && !dropdown.current?.contains(event.target)) {
        if (dropdown.current) dropdown.current.open = false;
      }
    }

    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape' && dropdown.current?.open) {
        dropdown.current.open = false;
        dropdown.current.querySelector('summary')?.focus();
      }
    }

    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, []);

  function navigate() {
    if (dropdown.current) dropdown.current.open = false;
    onNavigate?.();
  }

  const linkClass = [
    'inline-flex min-h-11 items-center rounded-lg text-sm text-muted-foreground',
    'transition-colors hover:bg-surface-muted hover:text-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    mobile ? 'w-full px-3' : 'px-2.5',
  ].join(' ');

  return (
    <nav
      aria-label={mobile ? 'Mobile navigation' : 'Primary navigation'}
      className={mobile ? 'flex flex-col gap-1' : 'flex items-center gap-1'}>
      <Link href="/#solutions" onClick={navigate} className={linkClass}>Solutions</Link>
      <Link href="/#how-we-work" onClick={navigate} className={linkClass}>How we work</Link>

      <details ref={dropdown} className="group relative">
        <summary className={linkClass + ' cursor-pointer list-none gap-1.5 [&::-webkit-details-marker]:hidden'}>
          Resources
          <ChevronDown
            aria-hidden="true"
            className="size-3.5 transition-transform group-open:rotate-180 motion-reduce:transition-none"
          />
        </summary>

        <div className={[
          'rounded-xl border border-border bg-background p-2',
          mobile ? 'mx-3 mb-2' : 'absolute left-0 top-full z-50 mt-2 w-64 shadow-lg',
        ].join(' ')}>
          {resources.map(resource => (
            <a
              key={resource.href}
              href={resource.href}
              onClick={navigate}
              className="block rounded-lg px-3 py-2.5 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="flex items-center justify-between gap-3 text-sm font-medium">
                {resource.label}
                <ArrowUpRight aria-hidden="true" className="size-3.5 text-muted-foreground" />
              </span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                {resource.description}
              </span>
            </a>
          ))}
        </div>
      </details>

      <Link href="/#pricing" onClick={navigate} className={linkClass}>Pricing</Link>
    </nav>
  );
}
