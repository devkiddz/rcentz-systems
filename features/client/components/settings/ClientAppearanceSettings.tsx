'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun, Check } from 'lucide-react';
import { palettes, usePalette } from '@/ui-shell/theme/rcentz-palette';

const subscribe = () => () => {};
const client = () => true;
const server = () => false;
const modes = [
  { id: 'light', name: 'Light', icon: Sun },
  { id: 'dark', name: 'Dark', icon: Moon },
  { id: 'system', name: 'System', icon: Monitor }
] as const;

export function ClientAppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const { palette, setPalette } = usePalette();
  const mounted = useSyncExternalStore(subscribe, client, server);
  return (
    <section aria-labelledby="appearance-title" className="rounded-2xl border border-border bg-surface-raised p-5 sm:p-6">
      <h2 id="appearance-title" className="text-lg font-semibold">Appearance</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Make the workspace feel like yours. Changes apply immediately and are remembered in this browser.</p>
      <fieldset className="mt-6">
        <legend className="text-sm font-semibold">Colour theme</legend>
        <div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
          {palettes.map(item => (
            <label key={item.id} className="relative cursor-pointer rounded-xl border border-border p-3 has-[:checked]:border-theme-accent has-[:checked]:bg-theme-accent-faint has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring">
              <input type="radio" name="workspace-palette" value={item.id} checked={palette === item.id} onChange={() => setPalette(item.id)} className="sr-only" />
              <div aria-hidden="true" className="rounded-lg bg-neutral-950 p-3">
                <div className="flex gap-1"><span className="size-1 rounded-full bg-neutral-500" /><span className="size-1 rounded-full bg-neutral-500" /></div>
                <div className="mt-3 flex items-end gap-2"><span className="h-9 w-3 rounded-sm" style={{ backgroundColor: item.color, opacity: 0.5 }} /><span className="h-12 w-3 rounded-sm" style={{ backgroundColor: item.color }} /><div className="flex-1 space-y-2"><div className="h-1 rounded bg-neutral-700" /><div className="h-1 w-2/3 rounded bg-neutral-700" /></div></div>
              </div>
              <span className="mt-3 flex items-center justify-between gap-2 text-sm font-semibold">{item.name}{palette === item.id ? <Check aria-hidden="true" className="size-4 text-theme-accent" /> : null}</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.description}</span>
            </label>
          ))}
        </div>
        <button type="button" onClick={() => setPalette('neutral')} aria-pressed={palette === 'neutral'} className="mt-3 min-h-11 rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Use original neutral colours{palette === 'neutral' ? ' ✓' : ''}</button>
      </fieldset>
      <fieldset className="mt-6 border-t border-border pt-6">
        <legend className="float-left w-full text-sm font-semibold">Display mode</legend>
        <div className="clear-both grid grid-cols-3 gap-2 pt-3 sm:max-w-md">
          {modes.map(({ id, name, icon: Icon }) => (
            <label key={id} className="flex min-h-14 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-border p-3 text-sm font-medium has-[:checked]:border-theme-accent has-[:checked]:bg-theme-accent-soft has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring sm:flex-row">
              <input type="radio" name="workspace-mode" value={id} checked={mounted && theme === id} onChange={() => setTheme(id)} className="sr-only" />
              <Icon aria-hidden="true" className="size-4" />{name}
            </label>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">System follows your device’s light or dark preference. Your colour theme stays the same.</p>
      </fieldset>
      <p role="status" className="mt-6 text-xs text-muted-foreground">Your display choices apply across Rcentz Systems on this browser.</p>
    </section>
  );
}
