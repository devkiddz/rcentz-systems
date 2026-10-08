'use client';

import { useSyncExternalStore } from 'react';

export const palettes = [
  { id: 'yellow', name: 'Yellow & Black', color: '#f5d84b', description: 'Bright highlights, clean neutral surfaces.' },
  { id: 'emerald', name: 'Emerald', color: '#34d399', description: 'Fresh green, calm and balanced.' },
  { id: 'blue', name: 'Blue', color: '#60a5fa', description: 'Clear blue for a focused workspace.' },
  { id: 'violet', name: 'Violet', color: '#a78bfa', description: 'Soft violet with a little character.' }
] as const;
export type Palette = (typeof palettes)[number]['id'] | 'neutral';
const key = 'rcentz-palette-v1';
const eventName = 'rcentz-palette-change';
function valid(value: string | null | undefined): Palette {
  return palettes.some(item => item.id === value) ? value as Palette : 'neutral';
}
function snapshot(): Palette { return valid(document.documentElement.dataset.palette); }
function serverSnapshot(): Palette { return 'neutral'; }
function subscribe(callback: () => void) {
  const storage = (event: StorageEvent) => {
    if (event.key !== key && event.key !== null) return;
    document.documentElement.dataset.palette = valid(event.newValue);
    callback();
  };
  window.addEventListener('storage', storage);
  window.addEventListener(eventName, callback);
  return () => {
    window.removeEventListener('storage', storage);
    window.removeEventListener(eventName, callback);
  };
}
export function usePalette() {
  const palette = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  function setPalette(value: Palette) {
    document.documentElement.dataset.palette = value;
    try { localStorage.setItem(key, value); } catch { /* Selection still applies for this visit. */ }
    window.dispatchEvent(new Event(eventName));
  }
  return { palette, setPalette };
}
