'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { rcentzNavigationItems } from './rcentz-navigation-items';
import { RcentzProductsMenu } from './RcentzProductsMenu';
import { RcentzIllustratedMenu } from './RcentzIllustratedMenu';

type RcentzNavigationProps = {
  mobile?: boolean;
  compact?: boolean;
  onNavigate?: () => void;
};

export function RcentzNavigation({
  mobile = false,
  compact = false,
  onNavigate
}: RcentzNavigationProps) {
  const nav = useRef<HTMLElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const [productsOpen, setProductsOpen] = useState(false);

  useEffect(() => {
    function dismiss(event: PointerEvent) {
      nav.current?.querySelectorAll('details[open]').forEach((details) => {
        if (event.target instanceof Node && !details.contains(event.target))
          details.removeAttribute('open');
      });
    }
    function escape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      const open =
        nav.current?.querySelector<HTMLDetailsElement>('details[open]');
      open?.removeAttribute('open');
      open?.querySelector('summary')?.focus();
    }
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      window.clearTimeout(closeTimer.current);
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, []);

  function closeOthers(current: HTMLDetailsElement) {
    nav.current?.querySelectorAll('details[open]').forEach((details) => {
      if (details !== current) details.removeAttribute('open');
    });
  }
  function navigate() {
    window.clearTimeout(closeTimer.current);
    nav.current
      ?.querySelectorAll('details[open]')
      .forEach((details) => details.removeAttribute('open'));
    onNavigate?.();
  }
  const linkClass = [
    'inline-flex items-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    compact ? 'min-h-9 px-1.5 text-[9px]' : 'min-h-11 px-2 text-[13px]',
    mobile ? 'w-full px-3 text-sm' : ''
  ].join(' ');

  return (
    <nav
      ref={nav}
      aria-label={
        compact
          ? 'Preview navigation'
          : mobile
            ? 'Mobile navigation'
            : 'Primary navigation'
      }
      className={mobile ? 'flex flex-col gap-1' : 'flex items-center gap-0.5'}
    >
      {rcentzNavigationItems.map((item) =>
        'children' in item ? (
          <details
            key={item.label}
            className="group relative"
            onPointerEnter={(event) => {
              if (mobile || event.pointerType !== 'mouse') return;
              window.clearTimeout(closeTimer.current);
              closeOthers(event.currentTarget);
              event.currentTarget.open = true;
            }}
            onPointerLeave={(event) => {
              if (mobile || event.pointerType !== 'mouse') return;
              const target = event.currentTarget;
              closeTimer.current = window.setTimeout(() => {
                if (!target.contains(document.activeElement))
                  target.open = false;
              }, 180);
            }}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget))
                event.currentTarget.open = false;
            }}
            onToggle={(event) => {
              if (event.currentTarget.open) closeOthers(event.currentTarget);
              if (item.label === 'Products')
                setProductsOpen(event.currentTarget.open);
            }}
          >
            <summary
              className={
                linkClass +
                ' cursor-pointer list-none gap-1 [&::-webkit-details-marker]:hidden'
              }
            >
              {item.label}
              <ChevronDown
                aria-hidden="true"
                className="size-3 transition-transform group-open:rotate-180 motion-reduce:transition-none"
              />
            </summary>
            <div
              className={
                mobile
                  ? 'mx-1 pb-2 pt-1'
                  : 'absolute left-0 top-full z-50 pt-2'
              }
            >
              <div
                className={[
                  'rounded-xl border border-border bg-background shadow-sm',
                  item.label === 'Products' && !compact && !mobile
                    ? 'w-4xl max-w-[calc(100vw-2rem)]'
                    : mobile
                      ? 'w-full'
                      : compact
                        ? 'w-64'
                        : 'w-[800px] max-w-[calc(100vw-2rem)]'
                ].join(' ')}
              >
                {item.label === 'Products' && !compact ? (
                  productsOpen ? (
                    <RcentzProductsMenu onNavigate={navigate} />
                  ) : null
                ) : (
                  <RcentzIllustratedMenu
                    kind={
                      item.label === 'Resources'
                        ? 'resources'
                        : item.label === 'Products'
                          ? 'products'
                          : 'solutions'
                    }
                    items={item.children}
                    compact={compact}
                    onNavigate={navigate}
                  />
                )}
              </div>
            </div>
          </details>
        ) : (
          <Link
            key={item.label}
            href={item.href}
            onClick={navigate}
            className={linkClass}
          >
            {item.label}
          </Link>
        )
      )}
    </nav>
  );
}
