'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Bell, ChevronDown, GripVertical, Headphones, LayoutDashboard, MessageSquare, X } from 'lucide-react';
import { ProjectSupportBubble } from '@/features/client/components/projects/ProjectSupportBubble';
import type { ActivityFeed, ActivityItem } from '../types/activity-feed';
import styles from './CustomerActivityDock.module.css';

type Sheet = 'notifications' | 'messages' | 'activities' | 'chat';
type Mode = 'expanded' | 'collapsed' | 'hidden';
type Position = { x: number; y: number };
const tools = [
  { key: 'chat', label: 'Live chat', icon: Headphones },
  { key: 'messages', label: 'Messages', icon: MessageSquare },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'activities', label: 'Activities', icon: Activity },
] as const;
const buttonClass = 'relative flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 text-muted-foreground hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
const controlClass = 'flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
function bounded(position: Position): Position {
  return { x: Math.max(8, Math.min(window.innerWidth - 308, position.x)), y: Math.max(8, Math.min(window.innerHeight - 156, position.y)) };
}
function badge(count: number) { return count > 99 ? '99+' : String(count); }

export function CustomerActivityDock() {
  const pathname = usePathname();
  const [feed, setFeed] = useState<ActivityFeed | null>(null);
  const [mode, setMode] = useState<Mode>('expanded');
  const [position, setPosition] = useState<Position>({ x: 24, y: 120 });
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const preferenceKey = useRef('');
  const drag = useRef<{ pointerId: number; x: number; y: number; start: Position } | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const closeSheet = useCallback(() => { setSheet(null); returnFocus.current?.focus(); }, []);

  useEffect(() => {
    let disposed = false;
    let controller: AbortController | null = null;
    async function refresh() {
      if (document.hidden) return;
      controller?.abort();
      const current = new AbortController();
      controller = current;
      try {
        const response = await fetch('/api/activity', { cache: 'no-store', credentials: 'same-origin', signal: current.signal });
        if (response.status === 401) {
          if (!disposed && !current.signal.aborted) { setFeed(null); setSheet(null); preferenceKey.current = ''; }
          return;
        }
        if (!response.ok) throw new Error('Updates are temporarily unavailable.');
        const data: ActivityFeed = await response.json();
        if (disposed || current.signal.aborted) return;
        const key = 'rcentz:activity-dock:v1:' + data.accountKey;
        if (key !== preferenceKey.current) {
          preferenceKey.current = key;
          let nextMode: Mode = 'expanded';
          let nextPosition = { x: window.innerWidth - 324, y: window.innerHeight - 224 };
          try {
            const value = JSON.parse(localStorage.getItem(key) || 'null');
            if (value && ['expanded', 'collapsed', 'hidden'].includes(value.mode)) nextMode = value.mode;
            if (value?.position && Number.isFinite(value.position.x) && Number.isFinite(value.position.y)) nextPosition = value.position;
          } catch { /* Browser storage is optional. */ }
          setMode(nextMode); setPosition(bounded(nextPosition)); setSheet(null);
        }
        setFeed(data); setError('');
      } catch (cause) {
        if (!disposed && !current.signal.aborted) setError(cause instanceof Error ? cause.message : 'Could not check updates.');
      }
    }
    void refresh();
    const update = () => { void refresh(); };
    const interval = window.setInterval(update, 20000);
    window.addEventListener('focus', update);
    window.addEventListener('pageshow', update);
    window.addEventListener('rcentz:activity-refresh', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      disposed = true; controller?.abort(); window.clearInterval(interval);
      window.removeEventListener('focus', update); window.removeEventListener('pageshow', update);
      window.removeEventListener('rcentz:activity-refresh', update); document.removeEventListener('visibilitychange', update);
    };
  }, [pathname]);

  useEffect(() => {
    const resize = () => setPosition(value => bounded(value));
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  useEffect(() => {
    if (!sheet) return;
    if (sheet !== 'chat') sheetRef.current?.focus();
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') closeSheet(); };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [sheet, closeSheet]);
  useEffect(() => {
    document.documentElement.style.setProperty('--customer-dock-space', feed && mode !== 'hidden' ? '88px' : '0px');
    return () => { document.documentElement.style.removeProperty('--customer-dock-space'); };
  }, [feed, mode]);

  function save(nextMode: Mode, nextPosition = position) {
    try { if (preferenceKey.current) localStorage.setItem(preferenceKey.current, JSON.stringify({ mode: nextMode, position: nextPosition })); } catch { /* Keep usable without storage. */ }
  }
  function changeMode(next: Mode) { setMode(next); save(next); if (next === 'hidden') closeSheet(); }
  function openSheet(next: Sheet, element: HTMLElement) {
    returnFocus.current = element;
    setSheet(value => value === next ? null : next);
  }
  async function markRead(items: ActivityItem[]) {
    const ids = items.filter(item => item.unread).map(item => item.id);
    if (!ids.length || pending) return;
    setPending(true);
    try {
      const response = await fetch('/api/activity', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
      if (!response.ok) throw new Error('Could not mark updates as read.');
      window.dispatchEvent(new Event('rcentz:activity-refresh'));
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Please retry.'); }
    finally { setPending(false); }
  }
  if (!feed) return null;
  const total = feed.counts.notifications + feed.counts.messages;
  const projectParts = pathname.split('/');
  const projectId = projectParts[1] === 'dashboard' && projectParts[2] === 'projects' && projectParts[3] ? projectParts[3] : undefined;
  const items = sheet && sheet !== 'chat' ? feed[sheet] : [];
  const dockStyle = { '--dock-x': position.x + 'px', '--dock-y': position.y + 'px' } as CSSProperties;
  const above = position.y > 360;
  const sheetStyle = {
    '--sheet-left': Math.max(8, Math.min(window.innerWidth - 368, position.x)) + 'px',
    '--sheet-top': above ? 'auto' : position.y + 144 + 'px',
    '--sheet-bottom': above ? window.innerHeight - position.y + 12 + 'px' : 'auto',
    '--sheet-height': Math.max(120, Math.min(560, above ? position.y - 80 : window.innerHeight - position.y - 160)) + 'px',
  } as CSSProperties;

  return (
    <>
      <aside aria-label="Customer activity panel" style={dockStyle} className={[styles.dock, mode === 'collapsed' ? styles.collapsed : '', mode === 'hidden' ? styles.hiddenDock : ''].join(' ')}>
        {mode === 'hidden' ? (
          <button type="button" aria-label={`Show customer activity panel${total ? ', ' + total + ' unread updates' : ''}`} onClick={() => changeMode('expanded')} className="relative flex size-12 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Bell aria-hidden="true" className="size-5" />
            {total ? <span className="absolute -right-1 -top-1 rounded-full bg-theme-accent px-1.5 text-[10px] font-semibold text-background">{badge(total)}</span> : null}
          </button>
        ) : (
          <>
            <div className={styles.handle}>
              <button type="button" aria-label="Move activity panel; use arrow keys to reposition" className={controlClass + ' cursor-grab touch-none active:cursor-grabbing'}
                onPointerDown={event => { if (event.button !== 0) return; drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, start: position }; event.currentTarget.setPointerCapture(event.pointerId); }}
                onPointerMove={event => { const active = drag.current; if (!active || active.pointerId !== event.pointerId) return; setPosition(bounded({ x: active.start.x + event.clientX - active.x, y: active.start.y + event.clientY - active.y })); }}
                onPointerUp={() => { drag.current = null; save(mode); }} onPointerCancel={() => { drag.current = null; save(mode); }} onLostPointerCapture={() => { drag.current = null; }}
                onKeyDown={event => { const delta = { ArrowLeft: [-16, 0], ArrowRight: [16, 0], ArrowUp: [0, -16], ArrowDown: [0, 16] }[event.key]; if (!delta) return; event.preventDefault(); const next = bounded({ x: position.x + delta[0], y: position.y + delta[1] }); setPosition(next); save(mode, next); }}>
                <GripVertical aria-hidden="true" className="size-4" />
              </button>
              <p className="flex-1 text-xs font-semibold">Your workspace</p>
              <button type="button" aria-label={mode === 'collapsed' ? 'Expand activity panel' : 'Collapse activity panel'} onClick={() => changeMode(mode === 'collapsed' ? 'expanded' : 'collapsed')} className={controlClass}><ChevronDown aria-hidden="true" className="size-4" /></button>
              <button type="button" aria-label="Hide activity panel" onClick={() => changeMode('hidden')} className={controlClass}><X aria-hidden="true" className="size-4" /></button>
            </div>
            <div className={styles.mobileControls}>
              <button type="button" aria-label={mode === 'collapsed' ? 'Expand mobile menu' : 'Collapse mobile menu'} onClick={() => changeMode(mode === 'collapsed' ? 'expanded' : 'collapsed')} className={controlClass}><ChevronDown aria-hidden="true" className="size-3.5" /></button>
              <button type="button" aria-label="Hide mobile menu" onClick={() => changeMode('hidden')} className={controlClass}><X aria-hidden="true" className="size-3.5" /></button>
            </div>
            <nav aria-label="Customer quick menu" className={styles.actions}>
              <Link href="/dashboard" onClick={closeSheet} className={buttonClass} aria-label="Workspace"><LayoutDashboard aria-hidden="true" className="size-4" /><span className={styles.actionLabel + ' text-[9px]'}>Workspace</span></Link>
              {tools.map(tool => {
                const count = tool.key === 'chat' ? 0 : feed.counts[tool.key];
                const Icon = tool.icon;
                return <button key={tool.key} type="button" aria-label={tool.label + (count ? ', ' + count + ' unread' : '')} aria-expanded={sheet === tool.key} aria-controls="customer-activity-sheet" onClick={event => openSheet(tool.key, event.currentTarget)} className={buttonClass}>
                  <Icon aria-hidden="true" className="size-4" />
                  <span className={styles.actionLabel + ' text-[9px]'}>{tool.label}</span>
                  {count ? <span aria-hidden="true" className="absolute right-0 top-0 rounded-full bg-theme-accent px-1 text-[9px] font-semibold text-background">{badge(count)}</span> : null}
                </button>;
              })}
            </nav>
          </>
        )}
      </aside>
      {sheet ? (
        <section ref={sheetRef} style={sheetStyle} tabIndex={-1} aria-label={sheet === 'chat' ? 'Live support chat' : 'Customer ' + sheet} id="customer-activity-sheet" className={[styles.sheet, sheet === 'chat' ? styles.chatSheet : '', 'focus:outline-none'].join(' ')}>
          {sheet === 'chat' ? <ProjectSupportBubble key={projectId || 'general'} projectId={projectId} embedded onClose={closeSheet} /> : (
            <>
              <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background px-4 py-3">
                <h2 className="text-sm font-semibold capitalize">{sheet === 'activities' ? 'Project activity' : sheet}</h2>
                <button type="button" aria-label="Close activity details" onClick={closeSheet} className={controlClass}><X aria-hidden="true" className="size-4" /></button>
              </div>
              {error ? <p role="status" className="px-4 pt-3 text-xs text-muted-foreground">{error}</p> : null}
              <div className="space-y-1 p-2">
                {items.length ? items.map(item => <Link key={item.id} href={item.href} onClick={() => { if (item.unread) void markRead([item]); closeSheet(); }} className="block rounded-xl px-3 py-3 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <p className="flex items-center gap-2 text-xs font-semibold">{item.unread ? <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-theme-accent" /> : null}{item.title}</p>
                  <p className="mt-1 line-clamp-2 break-words text-xs leading-5 text-muted-foreground">{item.message}</p>
                  <time dateTime={item.createdAt} className="mt-1 block text-[10px] text-muted-foreground">{new Date(item.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</time>
                </Link>) : <p className="px-3 py-6 text-xs leading-5 text-muted-foreground">{sheet === 'messages' ? 'No conversations yet. Open live chat to message the team.' : 'No updates yet. New customer updates will appear here.'}</p>}
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-border p-3 text-xs">
                <Link href={sheet === 'messages' ? '/dashboard/messages' : '/dashboard/notifications'} onClick={closeSheet} className="rounded-lg px-2 py-2 font-medium hover:bg-surface-muted">View all</Link>
                {sheet !== 'messages' && items.some(item => item.unread) ? <button type="button" disabled={pending} onClick={() => void markRead(items)} className="rounded-lg px-2 py-2 text-muted-foreground hover:bg-surface-muted disabled:opacity-50">Mark shown as read</button> : null}
              </div>
            </>
          )}
        </section>
      ) : null}
    </>
  );
}
