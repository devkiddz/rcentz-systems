'use client';

import { useHydratedReducedMotion } from '@/hooks/use-hydrated-reduced-motion';

import { ArrowUpRight, Check, Inbox } from 'lucide-react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

const durations = [1400, 2200, 2400, 1200, 3500];

export function CustomerExperienceIllustration() {
  const panel = useRef<HTMLDivElement>(null);
  const visible = useInView(panel, { amount: 0.5 });
  const reducedMotion = Boolean(useHydratedReducedMotion());
  const [step, setStep] = useState(0);
  const current = reducedMotion ? 4 : step;

  useEffect(() => {
    if (!visible || reducedMotion) return;
    const timer = window.setTimeout(() => {
      setStep(value => (value + 1) % durations.length);
    }, durations[step]);
    return () => window.clearTimeout(timer);
  }, [visible, reducedMotion, step]);

  return (
    <div className="grid min-w-0 grid-rows-[8rem_24rem] lg:block">
      <p className="min-h-24 text-sm leading-6 text-muted-foreground lg:min-h-32">
        <span className="font-semibold text-foreground">Customer experiences.</span>{' '}
        Give customers a clear way to reach your business, with requests your
        team can act on.
      </p>

      <div
        ref={panel}
        className="relative self-center lg:mt-5 h-64 overflow-hidden rounded-xl border border-border bg-linear-to-b from-surface-raised to-surface-subtle">

        <div
          aria-hidden="true"
          className="absolute inset-x-4 top-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {[
              { color: 'bg-emerald-400', active: current === 0 || current === 4 },
              { color: 'bg-sky-400', active: current === 1 || current === 2 },
              { color: 'bg-red-400', active: current === 3 },
            ].map((indicator, index) => (
              <motion.span
                key={index}
                initial={false}
                animate={
                  reducedMotion || !indicator.active
                    ? { opacity: indicator.active ? 1 : 0.3, scale: 1 }
                    : { opacity: [0.55, 1, 0.55], scale: [1, 1.12, 1] }
                }
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                className={'size-1.5 rounded-full ' + indicator.color}
              />
            ))}
          </div>

          <span className="font-mono text-[9px] tracking-wide text-muted-foreground">
            {current === 4
              ? 'Received'
              : current === 3
                ? 'Processing...'
                : current >= 1
                  ? 'Receiving...'
                  : 'Ready'}
          </span>
        </div>

        <div aria-hidden="true" className="absolute inset-x-5 -bottom-8 top-9 rounded-xl border border-border-strong bg-background p-3">
          <AnimatePresence mode="wait" initial={false}>
            {current < 4 ? (
              <motion.div
                key="enquiry"
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.55 }}>
                <p className="text-sm font-medium">Tell us what you need</p>

                <p className="mt-2 text-[11px] text-muted-foreground">Your name</p>
                <div className="mt-1 flex h-8 items-center rounded-lg border border-border bg-background px-3 text-xs">
                  <motion.span
                    initial={false}
                    animate={{ opacity: current >= 1 ? 1 : 0 }}
                    transition={{ duration: 0.7 }}>
                    Amina
                  </motion.span>
                </div>

                <p className="mt-2 text-[11px] text-muted-foreground">What do you need?</p>
                <div className="mt-1 h-12 rounded-lg border border-border bg-background px-3 py-2 text-xs leading-5">
                  <motion.span
                    initial={false}
                    animate={{ opacity: current >= 2 ? 1 : 0 }}
                    transition={{ duration: 0.8 }}>
                    We need a workspace for our customers and team.
                  </motion.span>
                </div>

                <div className="mt-2 flex h-8 items-center justify-center gap-2 rounded-full bg-foreground text-xs font-medium text-background">
                  {current === 3 ? 'Sending enquiry...' : 'Send enquiry'}
                  <ArrowUpRight className="size-3.5" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="received"
                initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.65 }}>
                <span className="flex size-9 items-center justify-center rounded-full bg-theme-accent-soft">
                  <Check className="size-4 text-theme-accent" />
                </span>
                <p className="mt-3 text-sm font-semibold">Enquiry received.</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  A clear confirmation for your customer. An actionable request for your team.
                </p>

                <div className="mt-3 rounded-xl border border-border bg-background p-3">
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <Inbox className="size-3.5 text-theme-accent" />
                    New customer enquiry
                  </div>
                  <p className="mt-3 text-xs font-medium">Amina</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Customer and team workspace
                  </p>
                  <span className="mt-3 inline-flex rounded-full bg-theme-accent-soft px-2 py-1 text-[10px] text-theme-accent">
                    Ready for your team
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
