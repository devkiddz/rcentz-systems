'use client';

import { Check } from 'lucide-react';
import { useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

const operations = [
  'Check request details',
  'Update shared records',
  'Notify the workspace',
] as const;

export function ComputingIllustration() {
  const panel = useRef<HTMLDivElement>(null);
  const visible = useInView(panel, { amount: 0.5 });
  const reducedMotion = Boolean(useReducedMotion());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!visible || reducedMotion) return;
    const timer = window.setInterval(() => {
      setTick(value => (value + 1) % 22);
    }, 500);
    return () => window.clearInterval(timer);
  }, [visible, reducedMotion]);

  const progress = reducedMotion ? 16 : Math.min(tick, 16);
  const completed = progress === 16;
  const finished = completed ? 3 : Math.min(2, Math.floor(progress / 5));
  const filled = Math.round(progress / 16 * 32);

  return (
    <div className="grid min-w-0 grid-rows-[8rem_24rem] lg:block">
      <p className="min-h-32 text-sm leading-6 text-muted-foreground lg:min-h-32">
        <span className="font-semibold text-foreground">Computing.</span>{' '}
        Turn incoming requests into checks, updates and actions that keep
        your business moving.
      </p>

      <div
        ref={panel}
        role="img"
        aria-label="Illustration of a business request being checked, recorded and sent to a workspace"
        className="relative self-center lg:mt-5 h-48 overflow-hidden rounded-xl border border-border bg-linear-to-b from-surface-raised to-surface-subtle p-3">
        <div aria-hidden="true">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className={completed
                ? 'size-1.5 rounded-full bg-emerald-400'
                : 'size-1.5 rounded-full bg-emerald-400/30'} />
              <span className={!completed
                ? 'size-1.5 rounded-full bg-sky-400'
                : 'size-1.5 rounded-full bg-sky-400/30'} />
              <span className="size-1.5 rounded-full bg-red-400/30" />
            </div>
            <span className="font-mono text-[9px] text-muted-foreground">
              {completed ? 'Completed' : progress === 0 ? 'Queued...' : 'Processing...'}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 font-mono text-[10px]">
            <span className="text-foreground">Request RC-2048</span>
            <span className="text-muted-foreground">
              {Math.round(progress / 16 * 100)}%
            </span>
          </div>

          <div className="mt-2 grid grid-cols-16 gap-0.5">
            {Array.from({ length: 32 }, (_, index) => (
              <span
                key={index}
                className={[
                  'h-1.5 rounded-sm transition-colors duration-300 motion-reduce:transition-none',
                  index < filled ? 'bg-theme-accent' : 'bg-border',
                ].join(' ')}
              />
            ))}
          </div>

          <div className="mt-4 space-y-2 font-mono text-[10px]">
            {operations.map((operation, index) => {
              const done = index < finished;
              const active = !completed && index === finished;
              return (
                <div
                  key={operation}
                  className={[
                    'flex items-center gap-2 transition-colors duration-300',
                    done || active ? 'text-foreground' : 'text-muted-foreground/50',
                  ].join(' ')}>
                  {done ? (
                    <Check className="size-3 shrink-0 text-theme-accent" />
                  ) : (
                    <span className={[
                      'size-3 shrink-0 rounded-sm border',
                      active ? 'border-theme-accent bg-theme-accent-soft' : 'border-border',
                    ].join(' ')} />
                  )}
                  <span>{operation}{active ? '...' : ''}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
