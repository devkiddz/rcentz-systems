'use client';

import { useId, useState, type KeyboardEvent, type ReactNode } from 'react';
import { CheckCircle2, GitCommitHorizontal, Images } from 'lucide-react';

type TabId = 'milestones' | 'development' | 'media';
type Props = {
  milestones: ReactNode;
  development: ReactNode;
  media: ReactNode;
};
const entries = [
  { id: 'milestones', label: 'Milestones', Icon: CheckCircle2 },
  { id: 'development', label: 'Development evidence', Icon: GitCommitHorizontal },
  { id: 'media', label: 'Project media', Icon: Images }
] as const;

export function ProjectSectionTabs({ milestones, development, media }: Props) {
  const [active, setActive] = useState<TabId>('milestones');
  const baseId = useId();
  const panels = { milestones, development, media };

  function onKeys(event: KeyboardEvent<HTMLButtonElement>, current: TabId) {
    const index = entries.findIndex(entry => entry.id === current);
    const next = event.key === 'ArrowRight' ? (index + 1) % entries.length
      : event.key === 'ArrowLeft' ? (index + entries.length - 1) % entries.length
      : event.key === 'Home' ? 0 : event.key === 'End' ? entries.length - 1 : -1;
    if (next < 0) return;
    event.preventDefault();
    setActive(entries[next].id);
    const target = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next];
    target?.focus();
  }

  return (
    <section aria-label="Project delivery workspace" className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="border-b border-border bg-surface-raised/40 px-3 pt-3 sm:px-5 sm:pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Project delivery</h2>
            <p className="mt-1 text-xs text-muted">Manage milestones, inspect development evidence, and organize project media.</p>
          </div>
        </div>
        <div role="tablist" aria-label="Project delivery sections" className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {entries.map(({ id, label, Icon }) => {
            const selected = active === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`${baseId}-${id}-tab`}
                aria-controls={`${baseId}-${id}-panel`}
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(id)}
                onKeyDown={event => onKeys(event, id)}
                className={`relative inline-flex shrink-0 items-center gap-2 rounded-t-lg px-3 py-3 text-xs font-medium outline-none transition-[background-color,color,transform] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${selected ? 'bg-background text-foreground' : 'text-muted hover:bg-surface-muted hover:text-foreground'}`}
              >
                <Icon aria-hidden="true" className={`size-3.5 transition-transform duration-200 motion-reduce:transition-none ${selected ? 'text-theme-accent' : 'group-hover:scale-105'}`} />
                {label}
                <span aria-hidden="true" className={`absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-theme-accent transition-opacity duration-200 motion-reduce:transition-none ${selected ? 'opacity-100' : 'opacity-0'}`} />
              </button>
            );
          })}
        </div>
      </div>
      {entries.map(({ id }) => (
        <div
          key={id}
          role="tabpanel"
          id={`${baseId}-${id}-panel`}
          aria-labelledby={`${baseId}-${id}-tab`}
          tabIndex={0}
          hidden={active !== id}
          className="min-w-0 p-3 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:p-5 [&>section]:border-0 [&>section]:shadow-none motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-300"
        >
          {panels[id]}
        </div>
      ))}
    </section>
  );
}
