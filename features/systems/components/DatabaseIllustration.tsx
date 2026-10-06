'use client';

import { Database } from 'lucide-react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

const records = [
  { label: 'Customers', y: 86 },
  { label: 'Requests', y: 146 },
  { label: 'Projects', y: 206 },
] as const;

export function DatabaseIllustration() {
  const panel = useRef<HTMLDivElement>(null);
  const visible = useInView(panel, { amount: 0.5 });
  const reducedMotion = Boolean(useReducedMotion());
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!visible || reducedMotion) return;
    const timer = window.setTimeout(() => {
      setStep(value => (value + 1) % 5);
    }, step === 4 ? 3000 : 1800);
    return () => window.clearTimeout(timer);
  }, [visible, reducedMotion, step]);

  const current = reducedMotion ? 4 : step;

  return (
    <div className="grid min-w-0 grid-rows-[8rem_24rem] lg:block">
      <p className="min-h-32 text-sm leading-6 text-muted-foreground lg:min-h-32">
        <span className="font-semibold text-foreground">Database.</span>{' '}
        Keep customer, project and operational records connected, so your
        applications share a clear source of information.
      </p>

      <div
        ref={panel}
        className="relative self-center lg:mt-5 h-96 overflow-hidden rounded-xl border border-border bg-linear-to-b from-surface-raised to-surface-subtle p-3">
        <div aria-hidden="true" className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className={current === 4
              ? 'size-1.5 rounded-full bg-emerald-400'
              : 'size-1.5 rounded-full bg-emerald-400/30'} />
            <span className={current < 4
              ? 'size-1.5 rounded-full bg-sky-400'
              : 'size-1.5 rounded-full bg-sky-400/30'} />
            <span className="size-1.5 rounded-full bg-red-400/30" />
          </div>
          <span className="font-mono text-[9px] text-muted-foreground">
            {current === 4 ? 'Records connected' : 'Syncing records...'}
          </span>
        </div>

        <div aria-hidden="true" className="relative mt-5 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-background px-3 py-1.5 font-mono text-[10px]">
            <Database className="size-3.5 text-theme-accent" />
            Business records
          </span>
        </div>

        <svg
          role="img"
          aria-label="Illustration connecting customer, request and project records to a team workspace"
          viewBox="0 0 240 300"
          className="absolute inset-x-3 bottom-5 h-72 w-[calc(100%-1.5rem)]">
          <path
            d="M120 8V236M120 206V236H58V264M120 236H182V264"
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="1"
          />

          {records.map((record, index) => {
            const active = current >= index + 1;
            return (
              <g key={record.label}>
                <circle
                  cx="120"
                  cy={record.y - 24}
                  r="3"
                  fill={active ? 'var(--theme-accent)' : 'var(--background)'}
                  stroke={active ? 'var(--theme-accent)' : 'var(--border-strong)'}
                  className="transition-colors duration-700"
                />
                <rect
                  x="65"
                  y={record.y - 13}
                  width="110"
                  height="26"
                  rx="5"
                  fill={active ? 'var(--theme-accent-soft)' : 'var(--background)'}
                  stroke={active ? 'var(--theme-accent)' : 'var(--border)'}
                  className="transition-[fill,stroke] duration-700"
                />
                <text
                  x="120"
                  y={record.y + 3}
                  textAnchor="middle"
                  fill={active ? 'var(--foreground)' : 'var(--muted-foreground)'}
                  fontSize="10"
                  fontFamily="monospace">
                  {record.label}
                </text>
              </g>
            );
          })}

          {!reducedMotion && visible && current < 4 ? (
            <motion.circle
              key={current}
              cx="120"
              r="2.5"
              fill="var(--foreground)"
              initial={{ cy: current === 0 ? 8 : 62 + (current - 1) * 60, opacity: 0 }}
              animate={{ cy: 62 + current * 60, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.4, ease: 'linear' }}
            />
          ) : null}

          {[
            { label: 'Team tasks', x: 18 },
            { label: 'Updates', x: 142 },
          ].map(item => (
            <g key={item.label}>
              <rect
                x={item.x}
                y="264"
                width="80"
                height="26"
                rx="5"
                fill={current === 4 ? 'var(--theme-accent-soft)' : 'var(--background)'}
                stroke={current === 4 ? 'var(--theme-accent)' : 'var(--border)'}
                className="transition-[fill,stroke] duration-700"
              />
              <text
                x={item.x + 40}
                y="280"
                textAnchor="middle"
                fill={current === 4 ? 'var(--foreground)' : 'var(--muted-foreground)'}
                fontSize="9"
                fontFamily="monospace">
                {item.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
