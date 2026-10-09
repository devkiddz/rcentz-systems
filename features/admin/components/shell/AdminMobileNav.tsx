'use client';

import Link from 'next/link';

import { BriefcaseBusiness, FolderKanban, LayoutDashboard, Menu, UsersRound } from 'lucide-react';

import { usePathname } from 'next/navigation';

import { useSidebar } from '@/components/ui/sidebar';

type MobileNavigationItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
};

const mobileNavigation = [
  {
    label: 'Home',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    label: 'Briefs',
    href: '/admin/requests',
    icon: BriefcaseBusiness
  },
  {
    label: 'Projects',
    href: '/admin/projects',
    icon: FolderKanban
  },
  {
    label: 'Clients',
    href: '/admin/clients',
    icon: UsersRound
  }
] satisfies MobileNavigationItem[];

function isActiveRoute(pathname: string, href: string) {
  if (href === '/admin') {
    return pathname === '/admin';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminMobileNav() {
  const pathname = usePathname();

  const { setOpenMobile } = useSidebar();

  return (
    <div
      className="
        fixed
        inset-x-0
        bottom-[calc(0.75rem+env(safe-area-inset-bottom))]
        z-40
        flex
        justify-center
        px-3
        md:hidden
      ">
      <nav
        aria-label="Admin mobile navigation"
        className="
          flex
          w-full
          max-w-[430px]
          items-center
          justify-between
          gap-1
          rounded-2xl
          border
          border-border
          bg-surface/95
          p-1.5
          shadow-[0_16px_45px_rgba(0,0,0,0.14)]
          backdrop-blur-xl
        ">
        {mobileNavigation.map(item => {
          const Icon = item.icon;

          const active = isActiveRoute(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={[
                'flex',
                'min-w-0',
                'flex-1',
                'flex-col',
                'items-center',
                'justify-center',
                'gap-1',
                'rounded-[16px]',
                'px-1.5',
                'py-2',
                'transition-colors',
                'duration-150',

                active
                  ? ['bg-theme-accent-faint', 'text-theme-accent'].join(' ')
                  : ['text-muted-foreground', 'hover:bg-surface-muted', 'hover:text-foreground'].join(' ')
              ].join(' ')}>
              <Icon
                aria-hidden="true"
                className={['size-[17px]', active ? 'text-theme-accent' : ''].join(' ')}
              />

              <span
                className={[
                  'max-w-full',
                  'truncate',
                  'text-xs',
                  'leading-none',

                  active ? 'font-semibold' : 'font-medium'
                ].join(' ')}>
                {item.label}
              </span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setOpenMobile(true)}
          aria-label="Open complete admin navigation"
          className="
            flex
            min-w-0
            flex-1
            flex-col
            items-center
            justify-center
            gap-1
            rounded-[16px]
            px-1.5
            py-2
            text-muted-foreground
            transition-colors
            duration-150
            hover:bg-surface-muted
            hover:text-foreground
          ">
          <Menu aria-hidden="true" className="size-[17px]" />

          <span className="text-xs font-medium leading-none">More</span>
        </button>
      </nav>
    </div>
  );
}
