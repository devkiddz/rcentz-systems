'use client';

import { useHydratedReducedMotion } from '@/hooks/use-hydrated-reduced-motion';

import Image from 'next/image';
import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  Code2,
  Gauge,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tablet,
  Wrench
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

const REPAIR_SIGNALS = [
  { icon: Gauge, label: 'Faster', meta: 'Performance' },
  { icon: Smartphone, label: 'Responsive', meta: 'All devices' },
  { icon: ShieldCheck, label: 'Updated', meta: 'Security' }
] as const;

export function MaintenanceModernizationIllustration() {
  const reduceMotion = Boolean(useHydratedReducedMotion());
  const [activeTab, setActiveTab] = useState<'before' | 'after'>('after');
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative mx-auto w-full max-w-[720px] py-2 sm:py-3">
      {/* AMBIENT BACKGROUND GLOW */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[49%] h-[82%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-theme-accent/[0.065] blur-3xl"
      />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        className="relative min-h-[390px] sm:min-h-[420px]">
        {/* =========================================
            WEBSITE PANEL — MAIN INTERACTIVE BOARD
            ========================================= */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: 18, rotate: 4 }}
          animate={{ opacity: 1, x: 0, rotate: 2 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformPerspective: 1100, transformOrigin: 'center' }}
          className="absolute left-[21%] top-[19%] z-20 w-[63%] sm:left-[20%] sm:w-[66%]">
          <motion.div
            animate={
              reduceMotion
                ? undefined
                : {
                    rotateY: isHovered ? 0 : [-2, 1, -2],
                    y: isHovered ? -2 : [0, -3, 0]
                  }
            }
            transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="overflow-hidden rounded-[18px] border-[4px] border-foreground/85 bg-background shadow-2xl transition-shadow duration-300 hover:shadow-theme-accent/10">
            {/* BROWSER CHROME WITH VIEW TOGGLE */}
            <div className="flex h-9 items-center justify-between border-b border-border bg-surface-muted/50 px-3">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-red-500/80" />
                <span className="size-2 rounded-full bg-yellow-500/80" />
                <span className="size-2 rounded-full bg-emerald-500/80" />
              </div>

              {/* VIEW SWITCHER TABS */}
              <div className="flex rounded-full border border-border bg-background/80 p-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('before')}
                  className={`rounded-full px-2 py-0.5 font-mono text-[5.5px] uppercase tracking-wider transition-colors ${
                    activeTab === 'before'
                      ? 'bg-foreground/10 text-foreground font-semibold'
                      : 'text-muted hover:text-foreground'
                  }`}>
                  Legacy
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('after')}
                  className={`rounded-full px-2 py-0.5 font-mono text-[5.5px] uppercase tracking-wider transition-colors ${
                    activeTab === 'after'
                      ? 'bg-theme-accent text-white font-semibold'
                      : 'text-muted hover:text-foreground'
                  }`}>
                  Modern
                </button>
              </div>
            </div>

            {/* DYNAMIC VIEW COMPARISON */}
            <div className="relative min-h-[210px] p-3">
              <AnimatePresence mode="wait">
                {activeTab === 'before' ? (
                  <motion.div
                    key="before-view"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[6px] uppercase tracking-[0.12em] text-muted">
                        Status: Critical Backlog
                      </span>
                      <AlertTriangle className="size-3.5 text-amber-500" />
                    </div>

                    <div className="rounded-[8px] border border-border bg-surface-muted/40 p-2.5">
                      <div className="h-2 w-[55%] rounded bg-foreground/20" />
                      <div className="mt-2 h-1.5 w-[85%] rounded bg-foreground/10" />
                      <div className="mt-1.5 h-1.5 w-[70%] rounded bg-foreground/10" />

                      <div className="mt-3 grid grid-cols-2 gap-1.5">
                        <div className="h-9 rounded border border-dashed border-border bg-foreground/[0.02]" />
                        <div className="h-9 rounded border border-dashed border-border bg-foreground/[0.02]" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <LegacyIssue label="High LCP / Unoptimized Bundle" />
                      <LegacyIssue label="Broken Responsive Viewports" />
                      <LegacyIssue label="Deprecated API Dependencies" />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="after-view"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="relative">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[6px] font-semibold uppercase tracking-[0.12em] text-theme-accent">
                        Status: Optimized Platform
                      </span>
                      <span className="flex items-center gap-1 rounded-full bg-theme-accent-soft px-2 py-0.5 font-mono text-[5px] font-medium text-theme-accent">
                        <Check className="size-2" />
                        100% Operational
                      </span>
                    </div>

                    <div className="mt-2 rounded-[8px] border border-theme-accent/20 bg-background p-2.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold text-foreground">Next.js App Router</p>
                        <Sparkles className="size-3 text-theme-accent" />
                      </div>

                      <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                        <ModernStat value="99" label="Performance" />
                        <ModernStat value="100" label="SEO / Mobile" />
                        <ModernStat value="A+" label="Security" />
                      </div>

                      {/* PERFORMANCE GRAPH ANIMATION */}
                      <div className="mt-3 flex h-8 items-end gap-1.5">
                        {[40, 55, 48, 72, 65, 88, 98].map((height, index) => (
                          <motion.span
                            key={index}
                            initial={reduceMotion ? false : { height: '10%' }}
                            animate={{ height: `${height}%` }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className="flex-1 rounded-t-sm bg-theme-accent/75"
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* CENTRAL REFRESH BADGE */}
          <motion.button
            type="button"
            onClick={() => setActiveTab(prev => (prev === 'before' ? 'after' : 'before'))}
            animate={reduceMotion ? undefined : { scale: [1, 1.08, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            title="Toggle Inspection Mode"
            className="absolute left-1/2 top-[52%] flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-theme-accent/30 bg-background shadow-xl hover:border-theme-accent">
            <RefreshCw className="size-3.5 text-theme-accent transition-transform duration-500 hover:rotate-180" />
          </motion.button>
        </motion.div>

        {/* =========================================
            TECHNICIAN HERO ILLUSTRATION LAYER
            ========================================= */}
        <motion.div
          animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[-10px] left-[26%] z-40 h-[400px] w-[285px] sm:left-[28%] sm:h-[430px] sm:w-[310px]">
          <Image
            src="/images/services/modernization/maintenance-technician.webp"
            alt="Technician maintaining modern digital architecture"
            fill
            sizes="310px"
            priority
            className="object-contain object-bottom"
          />
        </motion.div>

        {/* =========================================
            FLOATING REPAIR SIGNALS (RIGHT SIDE)
            ========================================= */}
        <div className="absolute right-0 top-[2%] z-50 space-y-2">
          {REPAIR_SIGNALS.map((signal, index) => {
            const Icon = signal.icon;

            return (
              <motion.div
                key={signal.label}
                initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + index * 0.12, duration: 0.45 }}
                className="flex w-[125px] items-center gap-2 rounded-[11px] border border-border bg-background/95 p-2 shadow-lg backdrop-blur-xl">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-theme-accent-soft">
                  <Icon className="size-3.5 text-theme-accent" />
                </div>

                <div className="min-w-0">
                  <p className="text-[6.5px] font-semibold text-foreground">{signal.label}</p>
                  <p className="text-[5px] text-muted">{signal.meta}</p>
                </div>

                <Check className="ml-auto size-3 shrink-0 text-theme-accent" />
              </motion.div>
            );
          })}
        </div>

        {/* =========================================
            FLOATING ISSUES WARNING CARD (LEFT SIDE)
            ========================================= */}
        <motion.div
          animate={reduceMotion ? undefined : { y: [0, 4, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-[1%] top-[29%] z-50 w-[122px] rounded-[12px] border border-border bg-background/95 p-2.5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="size-3 text-amber-500" />
            <span className="font-mono text-[6px] font-semibold uppercase tracking-wider text-foreground">
              Audit Signals
            </span>
          </div>

          <div className="mt-2 space-y-1">
            <IssueLine label="Slow page loads" />
            <IssueLine label="Mobile layout errors" />
            <IssueLine label="Outdated dependencies" />
          </div>
        </motion.div>

        {/* =========================================
            TOOLBOX WIDGET
            ========================================= */}
        <motion.div
          animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-3 left-[10%] z-50">
          <div className="relative flex h-[58px] w-[90px] items-end justify-center rounded-[10px] border border-border bg-foreground/90 p-2 shadow-xl">
            <div className="absolute -top-3 left-1/2 h-5 w-9 -translate-x-1/2 rounded-t-[7px] border-x-2 border-t-2 border-foreground/80" />

            <span className="flex size-7 items-center justify-center rounded-full border border-white/15 bg-black/40">
              <span className="text-[10px] font-bold text-white">R</span>
            </span>

            <motion.div
              animate={reduceMotion ? undefined : { rotate: [-6, 6, -6] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -right-3 -top-3 flex size-8 items-center justify-center rounded-[8px] border border-border bg-background shadow-lg">
              <Wrench className="size-3.5 text-theme-accent" />
            </motion.div>

            <motion.div
              animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              className="absolute -bottom-2 -left-4 flex size-8 items-center justify-center rounded-[8px] border border-border bg-background shadow-lg">
              <Code2 className="size-3.5 text-theme-accent" />
            </motion.div>
          </div>
        </motion.div>

        {/* =========================================
            CROSS-DEVICE PREVIEW BADGES
            ========================================= */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.45 }}
          className="absolute bottom-0 right-[1%] z-50 flex items-end gap-2">
          {/* TABLET PREVIEW */}
          <motion.div
            animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            className="hidden w-[88px] rounded-[10px] border-[3px] border-foreground/80 bg-foreground p-1 shadow-lg sm:block">
            <div className="rounded-[6px] bg-background p-1.5">
              <div className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-theme-accent" />
                <span className="text-[4px] font-semibold text-foreground">Responsive</span>
              </div>
              <div className="mt-1.5 h-2 w-[65%] rounded bg-foreground/10" />
              <div className="mt-1.5 grid grid-cols-2 gap-1">
                <div className="h-8 rounded bg-theme-accent-soft" />
                <div className="h-8 rounded bg-surface-muted" />
              </div>
            </div>
          </motion.div>

          {/* MOBILE PREVIEW */}
          <motion.div
            animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-[48px] rounded-[10px] border-[3px] border-foreground/85 bg-foreground p-1 shadow-xl">
            <div className="rounded-[6px] bg-background p-1.5">
              <span className="block size-1.5 rounded-full bg-theme-accent" />
              <p className="mt-1 text-[4.5px] font-semibold leading-[1.05] text-foreground">
                Mobile
                <br />
                Ready
              </p>
              <div className="mt-2 h-2 rounded-full bg-theme-accent" />
            </div>
          </motion.div>
        </motion.div>

        {/* FLOATING TABLET ICON */}
        <motion.div
          animate={reduceMotion ? undefined : { y: [0, -5, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-[21%] top-[3%] z-50 hidden size-9 items-center justify-center rounded-[10px] border border-border bg-background/90 shadow-lg sm:flex">
          <Tablet className="size-4 text-theme-accent" />
        </motion.div>
      </motion.div>
    </div>
  );
}

function LegacyIssue({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="size-1 rounded-full bg-amber-500" />
      <span className="text-[5px] font-medium text-muted">{label}</span>
    </div>
  );
}

function IssueLine({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="size-1 rounded-full bg-foreground/25" />
      <span className="text-[5px] text-muted">{label}</span>
    </div>
  );
}

function ModernStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[5px] border border-border bg-surface-muted/30 p-1.5 text-center">
      <p className="text-[6.5px] font-semibold text-foreground">{value}</p>
      <p className="mt-0.5 text-[4px] text-muted">{label}</p>
    </div>
  );
}
