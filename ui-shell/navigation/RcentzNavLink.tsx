'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type RcentzNavLinkProps = {
  label: string;
  href: string;
  mobile?: boolean;
  onNavigate?: () => void;
};

export function RcentzNavLink({
  label,
  href,
  mobile = false,
  onNavigate,
}: RcentzNavLinkProps) {
  const pathname = usePathname();
  const active = pathname === href ||
    (href !== '/' && pathname.startsWith(href + '/'));

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      onClick={onNavigate}
      className={[
        'relative inline-flex items-center transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        mobile
          ? 'min-h-11 w-full rounded-lg px-3 text-sm hover:bg-surface-muted'
          : 'h-10 justify-center px-3 text-sm',
        active
          ? 'font-medium text-foreground'
          : 'text-muted-foreground hover:text-foreground',
      ].join(' ')}>
      {label}
      {active ? (
        <span
          aria-hidden="true"
          className={mobile
            ? 'absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-foreground'
            : 'absolute bottom-0 inset-x-3 h-px bg-foreground'}
        />
      ) : null}
    </Link>
  );
}
