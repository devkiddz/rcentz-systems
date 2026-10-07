'use client';

import { useHydratedReducedMotion } from '@/hooks/use-hydrated-reduced-motion';

import Image from 'next/image';

import { Code2, Gauge, Globe2, MonitorSmartphone } from 'lucide-react';

import { motion } from 'motion/react';

const BUILD_SIGNALS = [
  {
    icon: Code2,
    label: 'Custom development'
  },
  {
    icon: MonitorSmartphone,
    label: 'Responsive experience'
  },
  {
    icon: Gauge,
    label: 'Production focused'
  }
] as const;

export function WebDevelopmentIllustration() {
  const reduceMotion = Boolean(useHydratedReducedMotion());

  return (
    <div className="relative mx-auto w-full max-w-[580px] pt-2 sm:pt-3">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[44%] h-[78%] w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-theme-accent/[0.06] blur-3xl sm:w-[82%]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[8%] top-[12%] size-24 rounded-full bg-theme-accent/[0.05] blur-[46px] sm:size-36"
      />

      <motion.div
        initial={
          reduceMotion
            ? false
            : {
                opacity: 0,
                y: 14,
                scale: 0.985
              }
        }
        animate={{
          opacity: 1,
          y: 0,
          scale: 1
        }}
        transition={{
          duration: 0.72,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="relative">
        <div className="relative overflow-hidden rounded-[20px] border border-border bg-background/95 shadow-xl backdrop-blur-xl sm:rounded-[24px] sm:shadow-2xl">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 z-20 h-px bg-theme-accent/50" />

          <div className="relative z-10 flex h-9 items-center gap-2 border-b border-border bg-surface-muted/50 px-3 sm:h-10 sm:gap-3 sm:px-4">
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-foreground/15" />
              <span className="size-1.5 rounded-full bg-foreground/20" />
              <span className="size-1.5 rounded-full bg-theme-accent/75" />
            </div>

            <div className="flex h-5 min-w-0 flex-1 items-center rounded-full border border-border bg-background/75 px-2.5 sm:px-3">
              <Globe2 className="mr-1.5 size-2.5 shrink-0 text-theme-accent sm:mr-2" />

              <span className="truncate font-mono text-[5.5px] tracking-[0.1em] text-muted sm:text-[6px]">
                rcentz.cc
              </span>
            </div>

            <span className="hidden shrink-0 rounded-full border border-theme-accent/20 bg-theme-accent-soft px-2 py-1 font-mono text-[5.5px] uppercase tracking-[0.12em] text-theme-accent sm:inline-flex">
              Live build
            </span>
          </div>

          <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted/35 sm:aspect-[16/9]">
            <Image
              src="/services/web-development/web-development-light-desktop.webp"
              alt="Rcentz web development experience in light mode"
              fill
              priority
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 80vw, 580px"
              className="object-cover object-top dark:hidden"
            />

            <Image
              src="/services/web-development/web-development-dark-desktop.webp"
              alt="Rcentz web development experience in dark mode"
              fill
              priority
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 80vw, 580px"
              className="hidden object-cover object-top dark:block"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-theme-accent/[0.02] via-transparent to-theme-accent/[0.045]"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/20 to-transparent sm:h-20"
            />
          </div>
        </div>

        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, -4, 0]
                }
          }
          transition={{
            duration: 5.2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute -bottom-6 right-3 z-20 w-[88px] overflow-hidden rounded-[17px] border border-border bg-background p-1 shadow-xl sm:-bottom-8 sm:right-7 sm:w-[124px] sm:rounded-[20px] sm:p-1.5 sm:shadow-2xl">
          <div aria-hidden="true" className="absolute inset-x-3 top-0 z-10 h-px bg-theme-accent/50" />

          <div className="relative aspect-[9/18] overflow-hidden rounded-[13px] bg-surface-muted/35 sm:rounded-[15px]">
            <Image
              src="/services/web-development/web-development-light-mobile.webp"
              alt="Rcentz responsive web development experience in light mode"
              fill
              sizes="(max-width: 640px) 88px, 124px"
              className="object-cover object-top dark:hidden"
            />

            <Image
              src="/services/web-development/web-development-dark-mobile.webp"
              alt="Rcentz responsive web development experience in dark mode"
              fill
              sizes="(max-width: 640px) 88px, 124px"
              className="hidden object-cover object-top dark:block"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-theme-accent/[0.02] via-transparent to-theme-accent/[0.04]"
            />
          </div>
        </motion.div>

        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, -4, 0]
                }
          }
          transition={{
            duration: 4.6,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute left-2 top-12 z-30 hidden items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-2 shadow-lg backdrop-blur-xl sm:flex lg:-left-3">
          <span className="size-1.5 rounded-full bg-theme-accent" />

          <span className="font-mono text-[6px] uppercase tracking-[0.12em] text-theme-accent">
            Rcentz build
          </span>
        </motion.div>
      </motion.div>

      <div className="mt-10 grid grid-cols-1 gap-2 pr-[96px] sm:mt-14 sm:grid-cols-3 sm:pr-0">
        {BUILD_SIGNALS.map((signal, index) => {
          const Icon = signal.icon;

          return (
            <motion.div
              key={signal.label}
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 8
                    }
              }
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                duration: 0.45,
                delay: 0.55 + index * 0.12
              }}
              className="flex min-w-0 items-center gap-2.5 rounded-[13px] border border-border bg-background/70 p-2.5 backdrop-blur-lg sm:block sm:rounded-[14px] sm:p-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-theme-accent/15 bg-theme-accent-soft/50 sm:size-auto sm:justify-start sm:border-0 sm:bg-transparent">
                <Icon className="size-3.5 text-theme-accent" />
              </div>

              <p className="min-w-0 text-[8px] leading-4 text-muted sm:mt-2">{signal.label}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
