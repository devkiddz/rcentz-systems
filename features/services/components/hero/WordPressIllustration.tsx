'use client';

import { useHydratedReducedMotion } from '@/hooks/use-hydrated-reduced-motion';

import Image from 'next/image';

import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Database,
  FileText,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart
} from 'lucide-react';

import { motion } from 'motion/react';

const PRESERVED_ITEMS = [
  {
    icon: FileText,
    label: 'Content'
  },
  {
    icon: Database,
    label: 'Data'
  },
  {
    icon: ShieldCheck,
    label: 'Business value'
  }
] as const;

const COMMERCE_VIEWS = [
  {
    label: 'Storefront',
    src: '/portfolio/screenshots/shelsea-commerce/02-store-desktop.webp'
  },
  {
    label: 'Product experience',
    src: '/portfolio/screenshots/shelsea-commerce/04-store-detail-desktop.webp'
  },
  {
    label: 'Orders',
    src: '/portfolio/screenshots/shelsea-commerce/03-orders-desktop.webp'
  }
] as const;

const MARKETING_BLOCKS = [
  'Grow your business with a professional website built to make a strong first impression. Present your services clearly, build trust with customers, and make it easier for people to take action.',
  'Turn your website into a reliable part of your business. Showcase your products, answer customer questions, and create a smoother path from discovery to enquiry or purchase.',
  'Reach more customers with a website designed for modern devices and real user behaviour. Keep your content clear, your message focused, and your business accessible wherever people find you.'
] as const;

function MarketingTypewriter() {
  const [blockIndex, setBlockIndex] = useState(0);
  const [characterIndex, setCharacterIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentBlock = MARKETING_BLOCKS[blockIndex];

  useEffect(() => {
    const complete = characterIndex === currentBlock.length;

    const empty = characterIndex === 0;

    let delay = isDeleting ? 10 : 18;

    if (complete && !isDeleting) {
      delay = 2600;
    }

    if (empty && isDeleting) {
      delay = 500;
    }

    const timer = window.setTimeout(() => {
      if (complete && !isDeleting) {
        setIsDeleting(true);
        return;
      }

      if (empty && isDeleting) {
        setIsDeleting(false);

        setBlockIndex(current => (current === MARKETING_BLOCKS.length - 1 ? 0 : current + 1));

        return;
      }

      setCharacterIndex(current =>
        isDeleting ? Math.max(0, current - 1) : Math.min(currentBlock.length, current + 1)
      );
    }, delay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [characterIndex, currentBlock, isDeleting]);

  return (
    <div className="min-h-[92px]">
      <p className="text-[6.5px] leading-[1.7] text-muted sm:text-[7px]">
        {currentBlock.slice(0, characterIndex)}

        <motion.span
          animate={{
            opacity: [1, 0, 1]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity
          }}
          className="ml-0.5 inline-block h-2.5 w-px bg-theme-accent align-middle"
        />
      </p>
    </div>
  );
}

export function WordPressIllustration() {
  const reduceMotion = Boolean(useHydratedReducedMotion());

  return (
    <div className="relative mx-auto w-full max-w-[680px] py-2 sm:py-3">
      {/* =========================================
          ATMOSPHERE
          ========================================= */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[82%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-theme-accent/[0.065] blur-3xl"
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
        {/* =========================================
            MAIN TRANSFORMATION
            ========================================= */}

        <div className="grid gap-3 sm:grid-cols-[0.64fr_auto_1.36fr] sm:items-center sm:gap-3">
          {/* =======================================
              WORDPRESS SOURCE
              ======================================= */}

          <motion.div
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, 3, 0]
                  }
            }
            transition={{
              duration: 5.4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="overflow-hidden rounded-[18px] border border-border bg-background/90 shadow-lg backdrop-blur-xl">
            <div className="flex h-9 items-center gap-2 border-b border-border bg-surface-muted/50 px-3">
              <div className="flex gap-1.5">
                <span className="size-1.5 rounded-full bg-foreground/15" />
                <span className="size-1.5 rounded-full bg-foreground/15" />
                <span className="size-1.5 rounded-full bg-theme-accent/45" />
              </div>

              <span className="font-mono text-[5.5px] uppercase tracking-[0.11em] text-muted">
                WordPress source
              </span>
            </div>

            <div className="space-y-2.5 p-3">
              <div className="flex items-center gap-2 rounded-[11px] border border-border bg-surface-muted/35 p-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background">
                  <span className="font-serif text-[13px] font-semibold text-foreground">W</span>
                </div>

                <div className="min-w-0">
                  <p className="text-[7px] font-medium text-foreground">Existing website</p>

                  <p className="mt-0.5 font-mono text-[5px] uppercase tracking-[0.1em] text-muted">
                    CMS · Content
                  </p>
                </div>
              </div>

              <div className="rounded-[11px] border border-border bg-background/60 p-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="size-3 text-theme-accent" />

                  <span className="text-[6px] text-muted">Marketing content</span>
                </div>

                <div className="mt-2 rounded-[8px] border border-border/70 bg-surface-muted/35 p-2.5">
                  <MarketingTypewriter />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div className="rounded-[9px] border border-border bg-surface-muted/35 p-2">
                  <Database className="size-3 text-theme-accent" />

                  <p className="mt-1.5 text-[5.5px] text-muted">Data</p>
                </div>

                <div className="rounded-[9px] border border-border bg-surface-muted/35 p-2">
                  <RefreshCw className="size-3 text-theme-accent" />

                  <p className="mt-1.5 text-[5.5px] text-muted">Structure</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* =======================================
              MIGRATION SIGNAL
              ======================================= */}

          <div className="hidden flex-col items-center gap-2 sm:flex">
            <motion.div
              animate={
                reduceMotion
                  ? undefined
                  : {
                      x: [0, 5, 0],
                      scale: [1, 1.05, 1]
                    }
              }
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="flex size-10 items-center justify-center rounded-full border border-theme-accent/20 bg-theme-accent-soft shadow-sm">
              <ArrowRight className="size-4 text-theme-accent" />
            </motion.div>

            <span className="font-mono text-[5px] uppercase tracking-[0.11em] text-theme-accent">
              Modernize
            </span>
          </div>

          {/* =======================================
              COMMERCE SYSTEM
              ======================================= */}

          <div className="relative min-h-[330px] overflow-hidden rounded-[22px] border border-theme-accent/20 bg-background shadow-xl backdrop-blur-xl">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 z-30 h-px bg-theme-accent/55" />

            {/* Header */}
            <div className="relative z-20 flex h-10 items-center justify-between border-b border-border bg-theme-accent-soft/25 px-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-3.5 text-theme-accent" />

                <div>
                  <p className="text-[7px] font-medium text-foreground">Modern commerce experience</p>

                  <p className="font-mono text-[5px] uppercase tracking-[0.1em] text-muted">
                    Store · Checkout · Orders
                  </p>
                </div>
              </div>

              <span className="rounded-full border border-theme-accent/20 bg-theme-accent-soft px-2 py-1 font-mono text-[5px] uppercase tracking-[0.1em] text-theme-accent">
                Modern
              </span>
            </div>

            {/* Real commerce content */}
            <div className="relative p-3 sm:p-4">
              <div className="relative min-h-[215px] sm:min-h-[230px]">
                {COMMERCE_VIEWS.map((view, index) => (
                  <motion.div
                    key={view.label}
                    animate={
                      reduceMotion
                        ? undefined
                        : {
                            y: [index * 7, index * 7 - 5, index * 7],
                            rotate: [
                              index === 0 ? -2 : index === 1 ? 0 : 2,
                              index === 0 ? -1 : index === 1 ? 0.5 : 1,
                              index === 0 ? -2 : index === 1 ? 0 : 2
                            ]
                          }
                    }
                    transition={{
                      duration: 5 + index * 0.6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: index * 0.35
                    }}
                    className={[
                      'absolute',
                      'overflow-hidden',
                      'rounded-[14px]',
                      'border',
                      'border-border',
                      'bg-background',
                      'shadow-lg',
                      index === 0
                        ? 'left-0 top-5 z-10 w-[68%]'
                        : index === 1
                          ? 'right-0 top-0 z-20 w-[70%]'
                          : 'bottom-0 left-[12%] z-30 w-[74%]'
                    ].join(' ')}>
                    <div className="relative aspect-[16/9] overflow-hidden bg-surface-muted">
                      <Image
                        src={view.src}
                        alt={view.label}
                        fill
                        sizes="(max-width: 640px) 70vw, 320px"
                        className="object-cover object-top"
                      />

                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-theme-accent/[0.015] via-transparent to-theme-accent/[0.05]"
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-border bg-background/90 px-2 py-1.5">
                      <span className="text-[5.5px] font-medium text-foreground">{view.label}</span>

                      <span className="size-1.5 rounded-full bg-theme-accent" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Flow */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                <CommerceStep icon={ShoppingBag} label="Browse" delay={0} reduceMotion={reduceMotion} />

                <CommerceStep icon={ShoppingCart} label="Checkout" delay={0.55} reduceMotion={reduceMotion} />

                <CommerceStep icon={PackageCheck} label="Orders" delay={1.1} reduceMotion={reduceMotion} />
              </div>

              {/* Moving system pulse */}
              <div className="mt-3 overflow-hidden rounded-full bg-foreground/10">
                <motion.div
                  animate={
                    reduceMotion
                      ? {
                          x: '0%'
                        }
                      : {
                          x: ['-100%', '335%']
                        }
                  }
                  transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="h-1 w-[24%] rounded-full bg-theme-accent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =========================================
            MOBILE TRANSITION
            ========================================= */}

        <div className="my-3 flex items-center justify-center gap-2 sm:hidden">
          <motion.div
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, 3, 0]
                  }
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}>
            <ArrowRight className="size-3.5 rotate-90 text-theme-accent" />
          </motion.div>

          <span className="font-mono text-[6px] uppercase tracking-[0.12em] text-theme-accent">
            Modernize
          </span>
        </div>

        {/* =========================================
            PRESERVED VALUE
            ========================================= */}

        <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-5">
          {PRESERVED_ITEMS.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.label}
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
                  duration: 0.42,
                  delay: 0.5 + index * 0.12
                }}
                className="rounded-[13px] border border-border bg-background/70 p-2.5 backdrop-blur-lg sm:p-3">
                <Icon className="size-3.5 text-theme-accent" />

                <p className="mt-2 text-[7px] leading-4 text-muted sm:text-[8px]">Preserve {item.label}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

type CommerceStepProps = {
  icon: typeof ShoppingBag;
  label: string;
  delay: number;
  reduceMotion: boolean;
};

function CommerceStep({ icon: Icon, label, delay, reduceMotion }: CommerceStepProps) {
  return (
    <motion.div
      animate={
        reduceMotion
          ? undefined
          : {
              scale: [1, 1.04, 1],
              y: [0, -2, 0]
            }
      }
      transition={{
        duration: 3.2,
        repeat: Infinity,
        ease: 'easeInOut',
        delay
      }}
      className="flex items-center gap-2 rounded-[10px] border border-theme-accent/15 bg-theme-accent-soft/30 p-2">
      <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-background/75">
        <Icon className="size-3 text-theme-accent" />
      </div>

      <span className="truncate text-[6px] text-muted">{label}</span>
    </motion.div>
  );
}
