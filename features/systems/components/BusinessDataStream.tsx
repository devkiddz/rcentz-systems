'use client';

import { useHydratedReducedMotion } from '@/hooks/use-hydrated-reduced-motion';

import { useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

const columns = 28;
const rows = 26;
const profile = [
    10, 10, 10, 10, 9, 8, 8, 8, 8, 8, 9, 9, 10, 10,
    10, 10, 9, 8, 7, 6, 5, 6, 7, 8, 8, 8, 9, 11,
  ];

const risingProfile = [
  12, 14, 16, 18, 20, 22, 23, 23, 23, 23, 23, 23, 23, 22,
  20, 17, 14, 10, 8, 7, 7, 7, 7, 7, 7, 8, 10, 14,
];

export function BusinessDataStream() {
  const panel = useRef<HTMLDivElement>(null);
  const visible = useInView(panel, { amount: 0.5 });
  const reducedMotion = Boolean(useHydratedReducedMotion());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!visible || reducedMotion) return;
    const timer = window.setInterval(() => {
      setTick(value => (value + 1) % 48);
    }, 450);
    return () => window.clearInterval(timer);
  }, [visible, reducedMotion]);

  const progress = reducedMotion ? 24 : tick;
  // Slow attack, brief peak, fast release.
  const rise = progress < 4
    ? 0
    : progress < 32
      ? Math.pow((progress - 4) / 28, 1.2)
      : progress < 36
        ? 1
        : progress < 40
          ? Math.pow(1 - (progress - 36) / 4, 2)
          : 0;

  const activityLabel = progress < 4 || progress >= 40
    ? 'Business activity'
    : progress < 32
      ? 'Activity rising'
      : progress < 36
        ? 'Peak activity'
        : 'Activity settling';

  return (
    <div className="grid min-w-0 grid-rows-[8rem_24rem] lg:block">
      <p className="min-h-24 text-sm leading-6 text-muted-foreground lg:min-h-32">
        <span className="font-semibold text-foreground">Business data.</span>{' '}
        Bring everyday activity into view, with connected records that grow
        alongside your operations.
      </p>

      <div
        ref={panel}
        className="relative self-center lg:mt-5 h-80 overflow-hidden rounded-xl border border-border bg-linear-to-b from-surface-raised to-surface-subtle">

        <span
          aria-hidden="true"
          className="absolute left-3 top-3 font-mono text-[10px] text-theme-accent">
          {activityLabel}
        </span>

        <svg
          role="img"
          aria-label="Illustrative business data graph with a gradually rising and settling activity edge"
          viewBox="0 0 280 260"
          preserveAspectRatio="xMidYMax meet"
          className="absolute inset-x-3 bottom-9 h-[calc(100%-4rem)] w-[calc(100%-1.5rem)]">
          {Array.from({ length: columns }, (_, column) => {
            const movement = 0;
            const levelTarget =
              profile[column] +
              (risingProfile[column] - profile[column]) * rise;

            const height = Math.max(
              2,
              Math.min(rows - 1, Math.round(levelTarget) + movement)
            );

            return Array.from({ length: rows }, (_, row) => {
              const level = rows - row;
              const active = level <= height && level > height - 3;
              const occupied = level <= height;
              return (
                <rect
                  key={column + '-' + row}
                  x={column * 10}
                  y={row * 10}
                  width="8"
                  height="8"
                  rx="1"
                  fill={active
                    ? 'var(--foreground)'
                    : occupied
                      ? 'var(--border-emphasis)'
                      : 'var(--border)'}
                  opacity={active
                    ? level === height ? 1 : 0.9
                    : occupied ? 0.7 : 0}
                  className="transition-[fill,opacity] duration-500 motion-reduce:transition-none"
                />
              );
            });
          })}
        </svg>

        <div
          aria-hidden="true"
          className="absolute inset-x-3 bottom-3 flex items-center gap-4 font-mono text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-foreground" />
            Activity
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-border-strong" />
            Records
          </span>
        </div>
      </div>
    </div>
  );
}
