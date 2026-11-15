'use client';

import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';

import Link from 'next/link';

import { CircleDollarSign, FolderKanban, Globe2, Headphones, ListChecks } from 'lucide-react';

import type { ClientDashboardIdentity } from '@/features/client/server/dashboard/get-client-dashboard-identity';

type ClientDashboardIdentityRailProps = {
  summary: ClientDashboardIdentity;
};

type IdentityItem = {
  label: string;
  value: string | number;
  note: string;
  href: string;
  icon: LucideIcon;
};

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

export function ClientDashboardIdentityRail({ summary }: ClientDashboardIdentityRailProps) {
  const pathname = usePathname();
  // Preserve account KPIs on dashboard pages, but not inside a project workspace.
  if (/^\/dashboard\/projects\/[^/]+\/?$/.test(pathname)) return null;

  const items: IdentityItem[] = [
    {
      label: 'Active Projects',

      value: summary.activeProjects,

      note: summary.activeProjects === 0 ? 'No active delivery' : 'Projects currently in delivery',

      href: '/dashboard/projects',

      icon: FolderKanban
    },

    {
      label: 'Action Required',

      value: summary.actionRequired,

      note: summary.actionRequired === 0 ? 'Nothing waiting on you' : 'Items needing your response',

      href: '/dashboard/requests?view=actions',

      icon: ListChecks
    },

    {
      label: 'Open Support',

      value: summary.openSupport,

      note: summary.openSupport === 0 ? 'No open support cases' : 'Support conversations in progress',

      href: '/dashboard/requests?view=support',

      icon: Headphones
    },

    {
      label: 'Outstanding',

      value: formatMoney(summary.outstanding, summary.currency),

      note: summary.outstanding > 0 ? 'Across issued invoices' : 'No outstanding balance',

      href: '/dashboard/billing',

      icon: CircleDollarSign
    },

    {
      label: 'Managed Sites',

      value: summary.managedSites,

      note: summary.managedSites === 0 ? 'No active monitoring yet' : 'Projects reporting intelligence',

      href: '/dashboard/projects',

      icon: Globe2
    }
  ];

  return (
    <section aria-label="Client account navigation" className="pt-5">
      <div className="overflow-hidden rounded-[22px] border border-border bg-border">
        <div
          className="
            flex
            snap-x
            snap-mandatory
            gap-px
            overflow-x-auto
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden

            xl:grid
            xl:grid-cols-5
            xl:overflow-visible
          ">
          {items.map(item => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className="
                    group
                    relative
                    min-w-[78%]
                    shrink-0
                    snap-start
                    bg-background
                    px-5
                    py-5

                    transition-colors
                    duration-150

                    hover:bg-surface-raised

                    focus-visible:z-10
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-inset
                    focus-visible:ring-theme-accent/40

                    sm:min-w-[45%]

                    lg:min-w-[31%]

                    xl:min-w-0
                  ">
                <div className="flex items-start justify-between gap-4">
                  <p className="truncate text-[12px] font-semibold text-muted transition-colors group-hover:text-foreground">
                    {item.label}
                  </p>

                  <span
                    className="
                        flex
                        size-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-theme-accent-faint
                        text-theme-accent

                        transition-colors

                        group-hover:bg-theme-accent-soft
                      ">
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                </div>

                <p className="mt-3 truncate text-[28px] font-semibold tracking-[-0.05em] text-foreground">
                  {item.value}
                </p>

                <p className="mt-1 truncate text-[10px] text-muted">{item.note}</p>

                <span
                  aria-hidden="true"
                  className="
                      absolute
                      inset-x-0
                      bottom-0
                      h-[2px]
                      origin-left
                      scale-x-0
                      bg-theme-accent

                      transition-transform
                      duration-200

                      group-hover:scale-x-100
                      group-focus-visible:scale-x-100
                    "
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
