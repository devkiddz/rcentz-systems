'use client';

import { useHydratedReducedMotion } from '@/hooks/use-hydrated-reduced-motion';

import { ArrowUpRight, Sparkles } from 'lucide-react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

const durations = [2200, 2800, 3200, 4000];
const sources = ['Requests', 'Projects', 'Team'] as const;

export function IntelligentCollaborationIllustration() {
  const panel = useRef<HTMLDivElement>(null);
  const visible = useInView(panel, { amount: 0.5 });
  const reducedMotion = Boolean(useHydratedReducedMotion());
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!visible || reducedMotion) return;
    const timer = window.setTimeout(() => {
      setStep(value => (value + 1) % durations.length);
    }, durations[step]);
    return () => window.clearTimeout(timer);
  }, [visible, reducedMotion, step]);

  const current = reducedMotion ? 3 : step;

  return (
    <div className="grid min-w-0 grid-rows-[8rem_24rem] lg:block">
      <p className="min-h-24 text-sm leading-6 text-muted-foreground lg:min-h-32">
        <span className="font-semibold text-foreground">Intelligent collaboration.</span>{' '}
        Bring questions, business records and useful next steps into one conversation.
      </p>

      <div
        ref={panel}
        role="img"
        aria-label="Illustration of AI consulting business records and preparing a suggestion for human review"
        className="relative self-center lg:mt-5 h-60 overflow-hidden rounded-xl border border-border bg-linear-to-b from-surface-raised to-surface-subtle p-3">
        <div aria-hidden="true">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className={current >= 2
                ? 'size-1.5 rounded-full bg-emerald-400'
                : 'size-1.5 rounded-full bg-emerald-400/30'} />
              <span className={current < 2
                ? 'size-1.5 rounded-full bg-sky-400'
                : 'size-1.5 rounded-full bg-sky-400/30'} />
              <span className="size-1.5 rounded-full bg-red-400/30" />
            </div>
            <span className="font-mono text-[9px] text-muted-foreground">
              {['Question received', 'Connecting context...', 'Insight prepared', 'Awaiting review'][current]}
            </span>
          </div>

          <div className="mt-3 rounded-lg border border-border bg-background px-2.5 py-2 text-[10px] leading-4">
            Which request needs our attention?
          </div>

          <div className="relative mt-3 h-20">
            <svg viewBox="0 0 240 80" className="absolute inset-0 h-full w-full">
              {[40, 120, 200].map((x, index) => (
                <g key={sources[index]}>
                  <rect
                    x={x - 35}
                    y="1"
                    width="70"
                    height="20"
                    rx="5"
                    fill="var(--background)"
                    stroke={current >= 1 ? 'var(--border-emphasis)' : 'var(--border)'}
                  />
                  <text
                    x={x}
                    y="14"
                    textAnchor="middle"
                    fontSize="9"
                    fontFamily="monospace"
                    fill={current >= 1 ? 'var(--foreground)' : 'var(--muted-foreground)'}>
                    {sources[index]}
                  </text>
                  <path
                    d={'M' + x + ' 21V34Q' + x + ' 40 120 46'}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth="1"
                  />
                  <motion.path
                    d={'M' + x + ' 21V34Q' + x + ' 40 120 46'}
                    fill="none"
                    stroke="var(--theme-accent)"
                    strokeWidth="1"
                    initial={false}
                    animate={{ pathLength: current >= 1 ? 1 : 0, opacity: current >= 1 ? 0.9 : 0 }}
                    transition={{
                      duration: reducedMotion ? 0 : 1,
                      delay: reducedMotion ? 0 : index * 0.25,
                    }}
                  />
                </g>
              ))}
              <path d="M120 64V80" stroke="var(--border-strong)" />
            </svg>

            <motion.span
              initial={false}
              animate={{
                scale: current === 1 ? 1.08 : 1,
                borderColor: current >= 1 ? 'var(--theme-accent)' : 'var(--border)',
              }}
              transition={{ duration: reducedMotion ? 0 : 0.6 }}
              className="absolute left-1/2 top-10 flex size-7 -translate-x-1/2 items-center justify-center rounded-full border bg-background">
              <Sparkles className="size-3.5 text-theme-accent" />
            </motion.span>
          </div>

          <div className="relative mt-2 h-16">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current < 2 ? 'reading' : current}
                initial={reducedMotion ? false : { opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 rounded-lg border border-border bg-background px-2.5 py-2">
                {current < 2 ? (
                  <div>
                    <p className="font-mono text-[9px] text-muted-foreground">
                      {current === 0 ? 'Preparing context...' : 'Checking shared records...'}
                    </p>
                    <div className="mt-2 h-1.5 w-4/5 rounded-full bg-border" />
                    <div className="mt-1.5 h-1.5 w-1/2 rounded-full bg-border" />
                  </div>
                ) : (
                  <div className="text-[10px] leading-4">
                    <p className="font-medium">
                      {current === 2 ? 'RC-2048 is waiting for an owner.' : 'Suggested: assign an owner.'}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between gap-1 text-[9px] text-muted-foreground">
                      <span>{current === 2 ? 'Source: Requests / RC-2048' : 'Review suggestion'}</span>
                      {current === 3 ? <ArrowUpRight className="size-3 text-theme-accent" /> : null}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
