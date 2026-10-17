'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronDown, GripVertical, Headset, MessageCircleQuestion, X } from 'lucide-react';
import { ProjectSupportBubble } from '@/features/client/components/projects/ProjectSupportBubble';
import type { ActivityFeed } from '../types/activity-feed';
import { CustomerMobileNavigation } from './CustomerMobileNavigation';
import styles from './CustomerActivityDock.module.css';

type Sheet = 'support' | 'chat';
type Mode = 'expanded' | 'collapsed' | 'hidden';
type Position = { x: number; y: number };
const tools = [
  { key: 'support', label: 'Support', icon: MessageCircleQuestion },
  { key: 'chat', label: 'Live chat', icon: Headset },
] as const;
const buttonClass = 'relative flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 text-muted-foreground hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
const controlClass = 'flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
function bounded(position: Position, element?: HTMLElement | null): Position {
  const width = element?.offsetWidth ?? 180;
  const height = element?.offsetHeight ?? 180;
  const bottomSpace = window.innerWidth < 768 ? Number.parseFloat(document.documentElement.style.getPropertyValue('--customer-dock-space')) || 0 : 0;
  return { x: Math.max(8, Math.min(window.innerWidth - width - 8, position.x)), y: Math.max(8, Math.min(window.innerHeight - height - bottomSpace - 8, position.y)) };
}


export function CustomerActivityDock() {
  const pathname = usePathname();
  const [feed, setFeed] = useState<ActivityFeed | null>(null);
  const [mode, setMode] = useState<Mode>('expanded');
  const [navMode, setNavMode] = useState<Mode>('expanded');
  const [position, setPosition] = useState<Position>({ x: 24, y: 120 });
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [error, setError] = useState('');
  const preferenceKey = useRef('');
  const drag = useRef<{ pointerId: number; x: number; y: number; start: Position; last: Position } | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const dragged = useRef(false);
  const sheetRef = useRef<HTMLElement>(null);
  const dockRef = useRef<HTMLElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const closeSheet = useCallback(() => { setSheet(null); returnFocus.current?.focus(); }, []);

  // Follow the page pointer, without React renders on each mouse movement.
  useEffect(() => {
    const button = launcherRef.current;
    if (!button || mode === 'expanded') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    let frame = 0;
    let pointer: { x: number; y: number } | null = null;
    function reset() {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0; pointer = null;
      if (button) resetLauncherTilt(button);
    }
    function paint() {
      frame = 0;
      if (!button || !pointer || drag.current || reduced.matches || !fine.matches || document.hidden) { reset(); return; }
      const rect = button.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (pointer.x - rect.left - rect.width / 2) / Math.max(160, window.innerWidth / 2)));
      const y = Math.max(-1, Math.min(1, (pointer.y - rect.top - rect.height / 2) / Math.max(160, window.innerHeight / 2)));
      button.style.setProperty('--support-rotate-x', `${-y * 28}deg`);
      button.style.setProperty('--support-rotate-y', `${x * 28}deg`);
      button.style.setProperty('--support-shift-x', `${x * 2}px`);
      button.style.setProperty('--support-shift-y', `${y * 2}px`);
    }
    function follow(event: PointerEvent) {
      if (event.pointerType !== 'mouse' || drag.current || reduced.matches || !fine.matches) { reset(); return; }
      pointer = { x: event.clientX, y: event.clientY };
      if (!frame) frame = window.requestAnimationFrame(paint);
    }
    function leave(event: PointerEvent) { if (!event.relatedTarget) reset(); }
    window.addEventListener('pointermove', follow, { passive: true });
    window.addEventListener('pointerout', leave);
    window.addEventListener('blur', reset);
    document.addEventListener('visibilitychange', reset);
    reduced.addEventListener('change', reset); fine.addEventListener('change', reset);
    return () => {
      reset();
      window.removeEventListener('pointermove', follow);
      window.removeEventListener('pointerout', leave);
      window.removeEventListener('blur', reset);
      document.removeEventListener('visibilitychange', reset);
      reduced.removeEventListener('change', reset); fine.removeEventListener('change', reset);
    };
  }, [mode, feed?.accountKey]);

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
          if (!disposed && !current.signal.aborted) { setFeed(null); setSheet(null); preferenceKey.current = ''; setNavMode('expanded'); }
          return;
        }
        if (!response.ok) throw new Error('Updates are temporarily unavailable.');
        const data: ActivityFeed = await response.json();
        if (disposed || current.signal.aborted) return;
        const key = 'rcentz:activity-dock:v1:' + data.accountKey;
        if (key !== preferenceKey.current) {
          preferenceKey.current = key;
          let nextMode: Mode = 'expanded';
          let nextPosition = { x: window.innerWidth - 196, y: window.innerHeight - 348 };
          try {
            const value = JSON.parse(localStorage.getItem(key) || 'null');
            if (value && ['expanded', 'collapsed', 'hidden'].includes(value.mode)) nextMode = value.mode;
            if (value?.position && Number.isFinite(value.position.x) && Number.isFinite(value.position.y)) nextPosition = value.position;
          } catch { /* Browser storage is optional. */ }
          let nextNavMode: Mode = 'expanded';
          try { const stored = localStorage.getItem('rcentz:mobile-nav:v1:' + data.accountKey); if (stored === 'collapsed' || stored === 'hidden') nextNavMode = stored; } catch { /* Storage is optional. */ }
          setNavMode(nextNavMode);
          setMode(nextMode); setPosition(bounded(nextPosition, dockRef.current)); setSheet(null);
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
    const resize = () => setPosition(value => bounded(value, dockRef.current));
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [mode, navMode, feed?.accountKey]);
  useEffect(() => {
    if (!sheet) return;
    if (sheet !== 'chat') sheetRef.current?.focus();
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') closeSheet(); };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [sheet, closeSheet]);
  useEffect(() => {
    document.documentElement.style.setProperty('--customer-dock-space', feed && !pathname.startsWith('/admin') && navMode !== 'hidden' ? '88px' : '0px');
    return () => { document.documentElement.style.removeProperty('--customer-dock-space'); };
  }, [feed, navMode, pathname]);

  function save(nextMode: Mode, nextPosition = position) {
    try { if (preferenceKey.current) localStorage.setItem(preferenceKey.current, JSON.stringify({ mode: nextMode, position: nextPosition })); } catch { /* Keep usable without storage. */ }
  }
  function startDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    dragged.current = false;
    drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, start: position, last: position };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function resetLauncherTilt(button: HTMLButtonElement) {
    button.style.removeProperty('--support-rotate-x');
    button.style.removeProperty('--support-rotate-y');
    button.style.removeProperty('--support-shift-x');
    button.style.removeProperty('--support-shift-y');
  }
  function moveWithKeyboard(event: ReactKeyboardEvent<HTMLButtonElement>) {
    const delta = { ArrowLeft: [-16, 0], ArrowRight: [16, 0], ArrowUp: [0, -16], ArrowDown: [0, 16] }[event.key];
    if (!delta) return;
    event.preventDefault();
    const next = bounded({ x: position.x + delta[0], y: position.y + delta[1] }, dockRef.current);
    setPosition(next); save(mode, next);
  }
  function moveDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const dx = event.clientX - active.x, dy = event.clientY - active.y;
    if (Math.hypot(dx, dy) > 4) dragged.current = true;
    active.last = bounded({ x: active.start.x + dx, y: active.start.y + dy }, dockRef.current);
    setPosition(active.last);
  }
  function finishDrag() {
    if (drag.current) save(mode, drag.current.last);
    drag.current = null;
  }
  function changeMode(next: Mode) { setMode(next); save(next); if (next === 'hidden') closeSheet(); }
  function openSheet(next: Sheet, element: HTMLElement) {
    returnFocus.current = element;
    setSheet(value => value === next ? null : next);
  }
  function changeNavMode(next: Mode) {
    setNavMode(next);
    try { if (feed) localStorage.setItem('rcentz:mobile-nav:v1:' + feed.accountKey, next); } catch { /* Keep usable without storage. */ }
  }
  if (!feed || pathname.startsWith('/admin')) return null;
  const projectParts = pathname.split('/');
  const projectId = projectParts[1] === 'dashboard' && projectParts[2] === 'projects' && projectParts[3] ? projectParts[3] : undefined;
  const dockStyle = { '--dock-x': position.x + 'px', '--dock-y': position.y + 'px' } as CSSProperties;
  const dockWidth = mode === 'expanded' ? 180 : 48;
  const sheetTop = Math.max(80, Math.min(window.innerHeight - 180, position.y));
  const leftSpace = position.x;
  const rightSpace = window.innerWidth - position.x - dockWidth;
  const sheetWidth = Math.min(360, Math.max(220, Math.max(leftSpace, rightSpace) - 20));
  const sheetLeft = rightSpace >= leftSpace ? position.x + dockWidth + 12 : Math.max(8, position.x - sheetWidth - 12);
  const sheetStyle = { '--sheet-left': sheetLeft + 'px', '--sheet-width': sheetWidth + 'px', '--sheet-top': sheetTop + 'px', '--sheet-bottom': 'auto', '--sheet-height': Math.max(120, Math.min(560, window.innerHeight - sheetTop - 16)) + 'px' } as CSSProperties;

  return (
    <>
      <CustomerMobileNavigation counts={feed.counts} mode={navMode} onModeChange={changeNavMode} />
      <aside ref={dockRef} aria-label="Customer support panel" style={dockStyle} className={[styles.dock, mode !== 'expanded' ? styles.compactDock : ''].join(' ')}>
        {mode !== 'expanded' ? (
          <button ref={launcherRef} type="button" aria-label="Open support menu; drag or use arrow keys to move" title="Support — click to open, drag to move" aria-expanded={false} onKeyDown={moveWithKeyboard}
            onPointerDown={event => { resetLauncherTilt(event.currentTarget); startDrag(event); }} onPointerMove={moveDrag} onPointerUp={finishDrag} onPointerCancel={event => { resetLauncherTilt(event.currentTarget); finishDrag(); }} onLostPointerCapture={event => { resetLauncherTilt(event.currentTarget); drag.current = null; }}
            onClick={event => { if (!dragged.current || event.detail === 0) changeMode('expanded'); dragged.current = false; }}
            className={styles.launcher}>
            <span className={styles.launcherIcon}><Headset aria-hidden="true" className="size-5" strokeWidth={1.75} /></span>
            <span className="sr-only">Support</span>
          </button>
        ) : (
          <>
            <div className={styles.handle}>
              <button type="button" aria-label="Move support panel; use arrow keys to reposition" className={controlClass + ' cursor-grab touch-none active:cursor-grabbing'}
                onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={finishDrag} onPointerCancel={finishDrag} onLostPointerCapture={() => { drag.current = null; }}
                onKeyDown={moveWithKeyboard}>
                <GripVertical aria-hidden="true" className="size-4" />
              </button>
              <p className={styles.dockTitle}>Support</p>
              <button type="button" aria-label="Collapse support panel" onClick={() => changeMode('collapsed')} className={controlClass}><ChevronDown aria-hidden="true" className="size-4" /></button>
              <button type="button" aria-label="Hide support panel" onClick={() => changeMode('hidden')} className={controlClass}><X aria-hidden="true" className="size-4" /></button>
            </div>
            <nav aria-label="Support tools" className={styles.actions}>
              {tools.map(({ key, label, icon: Icon }) => <button key={key} type="button" aria-label={label} aria-expanded={sheet === key} aria-controls="customer-activity-sheet" onClick={event => openSheet(key, event.currentTarget)} className={buttonClass}>
                <Icon aria-hidden="true" className="size-4" /><span className={styles.actionLabel + ' text-xs'}>{label}</span>
              </button>)}
            </nav>
          </>
        )}
      </aside>
      {sheet ? (
        <section ref={sheetRef} style={sheetStyle} tabIndex={-1} aria-label={sheet === 'chat' ? 'Live support chat' : 'Customer support'} id="customer-activity-sheet" className={[styles.sheet, sheet === 'chat' ? styles.chatSheet : '', 'focus:outline-none'].join(' ')}>
          {sheet === 'chat' ? <ProjectSupportBubble key={projectId || 'general'} projectId={projectId} embedded onClose={closeSheet} /> : (
            <>
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold">How can we help?</h2>
                <button type="button" aria-label="Close support details" onClick={closeSheet} className={controlClass}><X aria-hidden="true" className="size-4" /></button>
              </div>
              <div className="space-y-4 p-4">
                <p className="text-sm leading-6 text-muted-foreground">Ask about your project, share a delivery concern or get help using your workspace.</p>
                <button type="button" onClick={() => setSheet('chat')} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-theme-accent/30 bg-theme-accent-faint px-4 text-sm font-semibold text-theme-accent hover:bg-theme-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Headset aria-hidden="true" className="size-4" />Open live chat</button>
                <a href="mailto:contact@rcentz.cc" className="block rounded-lg py-2 text-sm font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Email contact@rcentz.cc</a>
                <p className="text-xs leading-5 text-muted-foreground">Messages are saved in your workspace. The team replies as soon as available.</p>
                {error ? <p role="status" className="text-xs text-muted-foreground">{error}</p> : null}
              </div>
            </>
          )}
        </section>
      ) : null}
    </>
  );
}
