'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, ChevronDown, ChevronUp, FolderKanban, LayoutDashboard, Menu, MessageSquare, Settings, X } from 'lucide-react';
import type { ActivityFeed } from '../types/activity-feed';
import styles from './CustomerActivityDock.module.css';

const links = [
  { href: '/dashboard', label: 'Workspace', icon: LayoutDashboard },
  { href: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare, counter: 'messages' },
  { href: '/dashboard/notifications', label: 'Updates', icon: Bell, counter: 'notifications' },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
] as const;
type Mode = 'expanded' | 'collapsed' | 'hidden';

export function CustomerMobileNavigation({ counts, mode, onModeChange }: {
  counts: ActivityFeed['counts'];
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}) {
  const pathname = usePathname();
  if (mode === 'hidden') return (
    <button type="button" aria-label="Show mobile navigation" onClick={() => onModeChange('expanded')} className={styles.mobileRestore + ' flex size-12 items-center justify-center border border-border bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'}><Menu aria-hidden="true" className="size-5" /></button>
  );
  return (
    <nav aria-label="Customer mobile navigation" className={styles.mobileBar}>
      <div className={styles.mobileControls}>
        <button type="button" aria-label={mode === 'collapsed' ? 'Expand mobile navigation' : 'Collapse mobile navigation'} onClick={() => onModeChange(mode === 'collapsed' ? 'expanded' : 'collapsed')} className="flex size-8 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{mode === 'collapsed' ? <ChevronUp aria-hidden="true" className="size-4" /> : <ChevronDown aria-hidden="true" className="size-4" />}</button>
        <button type="button" aria-label="Hide mobile navigation" onClick={() => onModeChange('hidden')} className="flex size-8 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><X aria-hidden="true" className="size-4" /></button>
      </div>
      <div className={styles.mobileLinks}>
        {links.map(item => {
          const active = item.href === '/dashboard' ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/');
          const count = 'counter' in item ? counts[item.counter] : 0;
          const Icon = item.icon;
          return <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} aria-label={item.label + (count ? `, ${count} unread` : '')} className={['relative flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', active ? 'bg-theme-accent-soft text-theme-accent' : 'hover:bg-surface-muted'].join(' ')}>
            <Icon aria-hidden="true" className="size-5" />
            {mode === 'expanded' ? <span className="text-[10px] font-medium">{item.label}</span> : null}
            {count ? <span aria-hidden="true" className="absolute right-1 top-0 rounded-full bg-theme-accent px-1 text-[9px] font-semibold text-background">{count > 99 ? '99+' : count}</span> : null}
          </Link>;
        })}
      </div>
    </nav>
  );
}
