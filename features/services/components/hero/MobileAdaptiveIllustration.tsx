'use client';

import { useHydratedReducedMotion } from '@/hooks/use-hydrated-reduced-motion';

import {
  ArrowRight,
  BarChart3,
  Check,
  Menu,
  Monitor,
  Smartphone,
  Tablet,
  Users
} from 'lucide-react';

import { motion } from 'motion/react';

const EXPERIENCE_SIGNALS = [
  {
    icon: Monitor,
    label: 'Desktop'
  },
  {
    icon: Tablet,
    label: 'Tablet'
  },
  {
    icon: Smartphone,
    label: 'Mobile'
  }
] as const;

export function MobileAdaptiveIllustration() {
  const reduceMotion = Boolean(useHydratedReducedMotion());

  return (
    <div className="relative mx-auto w-full max-w-[680px] py-2 sm:py-3">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[45%] h-[82%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-theme-accent/[0.06] blur-3xl"
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
        className="relative min-h-[360px] sm:min-h-[390px]">
        {/* =========================================
            DESKTOP
            ========================================= */}

        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, 3, 0]
                }
          }
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute left-0 top-5 w-[70%] overflow-hidden rounded-[21px] border border-border bg-background/95 shadow-xl backdrop-blur-xl">
          <div className="flex h-9 items-center gap-2 border-b border-border bg-surface-muted/45 px-3">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-foreground/15" />
              <span className="size-1.5 rounded-full bg-foreground/15" />
              <span className="size-1.5 rounded-full bg-theme-accent/60" />
            </div>

            <div className="ml-1 flex h-5 min-w-0 flex-1 items-center rounded-full border border-border bg-background/70 px-2.5">
              <span className="truncate font-mono text-[5px] tracking-[0.1em] text-muted">
                northstar.example
              </span>
            </div>

            <Monitor className="size-3 text-theme-accent" />
          </div>

          <div className="grid min-h-[235px] grid-cols-[68px_1fr]">
            <div className="border-r border-border bg-surface-muted/30 p-2.5">
              <div className="flex size-7 items-center justify-center rounded-[8px] bg-theme-accent text-[7px] font-semibold text-white">
                NS
              </div>

              <div className="mt-5 space-y-2">
                <DesktopNavItem active label="Home" />
                <DesktopNavItem label="Services" />
                <DesktopNavItem label="Insights" />
                <DesktopNavItem label="Contact" />
              </div>
            </div>

            <div className="min-w-0 p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[5px] uppercase tracking-[0.13em] text-theme-accent">
                    Digital Growth
                  </p>

                  <h3 className="mt-1.5 max-w-[185px] text-[12px] font-semibold leading-[1.05] tracking-[-0.035em] text-foreground">
                    Better experiences for growing businesses.
                  </h3>

                  <p className="mt-2 max-w-[210px] text-[6px] leading-3 text-muted">
                    Build stronger customer relationships with clear services, useful insights and better
                    digital interactions.
                  </p>
                </div>

                <button
                  type="button"
                  tabIndex={-1}
                  className="shrink-0 rounded-full bg-theme-accent px-2.5 py-1.5 text-[5.5px] font-medium text-white">
                  Get started
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <DesktopFeature icon={Users} title="Customers" value="2.4k" />

                <DesktopFeature icon={BarChart3} title="Growth" value="+18%" />

                <DesktopFeature icon={Check} title="Projects" value="124" />
              </div>

              <div className="mt-3 grid grid-cols-[1.15fr_0.85fr] gap-2">
                <div className="rounded-[10px] border border-border bg-surface-muted/30 p-2.5">
                  <p className="text-[6px] font-medium text-foreground">Latest activity</p>

                  <div className="mt-2 space-y-2">
                    <ActivityItem title="Website consultation" meta="New enquiry" />

                    <ActivityItem title="Customer onboarding" meta="Completed" />
                  </div>
                </div>

                <div className="rounded-[10px] border border-theme-accent/15 bg-theme-accent-soft/25 p-2.5">
                  <p className="text-[6px] font-medium text-foreground">This month</p>

                  <div className="mt-3 flex h-12 items-end gap-1">
                    {[32, 52, 40, 68, 48, 78, 62].map((height, index) => (
                      <motion.span
                        key={index}
                        initial={
                          reduceMotion
                            ? false
                            : {
                                height: '10%'
                              }
                        }
                        animate={{
                          height: `${height}%`
                        }}
                        transition={{
                          duration: 0.7,
                          delay: 0.45 + index * 0.08,
                          ease: [0.22, 1, 0.36, 1]
                        }}
                        className="flex-1 rounded-t-sm bg-theme-accent/55"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* =========================================
            DESKTOP → TABLET
            ========================================= */}

        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, 4, 0]
                }
          }
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute left-[53%] top-[28%] z-20 hidden items-center gap-1.5 rounded-full border border-theme-accent/20 bg-background/95 px-2 py-1.5 shadow-lg backdrop-blur-xl sm:flex">
          <ArrowRight className="size-3 text-theme-accent" />

          <span className="font-mono text-[4.5px] uppercase tracking-[0.1em] text-theme-accent">Adapt</span>
        </motion.div>

        {/* =========================================
            TABLET
            ========================================= */}

        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, -4, 0],
                  rotate: [-1, 0, -1]
                }
          }
          transition={{
            duration: 5.4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.25
          }}
          className="absolute bottom-3 left-[37%] z-30 hidden w-[220px] overflow-hidden rounded-[22px] border border-border bg-background p-1.5 shadow-2xl sm:block">
          <div className="relative overflow-hidden rounded-[17px] border border-border bg-background">
            <div className="flex h-8 items-center justify-between border-b border-border px-2.5">
              <div className="flex items-center gap-1.5">
                <div className="flex size-5 items-center justify-center rounded-[6px] bg-theme-accent text-[5px] font-semibold text-white">
                  NS
                </div>

                <span className="text-[6px] font-medium text-foreground">Northstar</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[4.5px] text-muted">Services</span>

                <Menu className="size-2.5 text-muted" />
              </div>
            </div>

            <div className="p-3">
              <p className="font-mono text-[4.5px] uppercase tracking-[0.11em] text-theme-accent">
                Digital Growth
              </p>

              <h4 className="mt-1.5 max-w-[150px] text-[10px] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground">
                Better experiences for growing businesses.
              </h4>

              <p className="mt-1.5 max-w-[170px] text-[5px] leading-[9px] text-muted">
                Useful services, focused insights and a cleaner experience across every interaction.
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <TabletCard icon={Users} title="Customers" value="2.4k" />

                <TabletCard icon={BarChart3} title="Growth" value="+18%" />
              </div>

              <div className="mt-2 rounded-[9px] border border-border bg-surface-muted/25 p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[5px] font-medium text-foreground">Latest activity</span>

                  <span className="rounded-full bg-theme-accent-soft px-1.5 py-0.5 text-[4px] text-theme-accent">
                    Live
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  <div className="rounded-[6px] border border-border bg-background/70 p-1.5">
                    <p className="truncate text-[4.5px] text-foreground">Consultation</p>

                    <p className="mt-0.5 text-[4px] text-muted">New enquiry</p>
                  </div>

                  <div className="rounded-[6px] border border-border bg-background/70 p-1.5">
                    <p className="truncate text-[4.5px] text-foreground">Onboarding</p>

                    <p className="mt-0.5 text-[4px] text-muted">Completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* =========================================
            TABLET → MOBILE
            ========================================= */}

        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, 4, 0]
                }
          }
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5
          }}
          className="absolute bottom-[34%] right-[15%] z-30 hidden items-center gap-1 rounded-full border border-theme-accent/20 bg-background/95 px-2 py-1.5 shadow-lg backdrop-blur-xl sm:flex">
          <ArrowRight className="size-2.5 text-theme-accent" />
        </motion.div>

        {/* =========================================
            MOBILE
            ========================================= */}

        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, -6, 0],
                  scale: [1, 1.012, 1]
                }
          }
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute bottom-0 right-[7%] z-40 w-[125px] overflow-hidden rounded-[24px] border border-theme-accent/20 bg-background p-1.5 shadow-2xl sm:right-[9%] sm:w-[140px]">
          <div className="relative overflow-hidden rounded-[19px] border border-border bg-background">
            <div className="flex h-7 items-center justify-between border-b border-border px-2.5">
              <div className="flex items-center gap-1.5">
                <div className="flex size-4 items-center justify-center rounded-[5px] bg-theme-accent text-[4.5px] font-semibold text-white">
                  NS
                </div>

                <span className="text-[5.5px] font-medium text-foreground">Northstar</span>
              </div>

              <Menu className="size-2.5 text-muted" />
            </div>

            <div className="p-2.5">
              <p className="font-mono text-[4px] uppercase tracking-[0.1em] text-theme-accent">
                Digital Growth
              </p>

              <h4 className="mt-1.5 text-[8.5px] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground">
                Better experiences for growing businesses.
              </h4>

              <p className="mt-1.5 text-[4.8px] leading-[8px] text-muted">
                Focused services and useful insights wherever your customers are.
              </p>

              <button
                type="button"
                tabIndex={-1}
                className="mt-2.5 w-full rounded-full bg-theme-accent py-1.5 text-[5px] font-medium text-white">
                Get started
              </button>

              <div className="mt-3 grid grid-cols-2 gap-1.5">
                <div className="rounded-[8px] border border-border bg-surface-muted/30 p-2">
                  <Users className="size-2.5 text-theme-accent" />

                  <p className="mt-1 text-[7px] font-semibold text-foreground">2.4k</p>

                  <p className="text-[4.5px] text-muted">Customers</p>
                </div>

                <div className="rounded-[8px] border border-theme-accent/15 bg-theme-accent-soft/30 p-2">
                  <BarChart3 className="size-2.5 text-theme-accent" />

                  <p className="mt-1 text-[7px] font-semibold text-foreground">+18%</p>

                  <p className="text-[4.5px] text-muted">Growth</p>
                </div>
              </div>

              <div className="mt-2 rounded-[8px] border border-border bg-surface-muted/25 p-2">
                <span className="text-[4.5px] font-medium text-foreground">Recent activity</span>

                <p className="mt-1 truncate text-[4px] text-muted">Website consultation</p>
              </div>
            </div>
          </div>

          <motion.span
            animate={
              reduceMotion
                ? undefined
                : {
                    opacity: [0.2, 0.8, 0.2],
                    scale: [0.7, 1.25, 0.7]
                  }
            }
            transition={{
              duration: 2.6,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute bottom-[31%] right-3 size-2 rounded-full border border-theme-accent bg-theme-accent/25"
          />
        </motion.div>
      </motion.div>

      {/* =========================================
          DEVICE STORY
          ========================================= */}

      <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-5">
        {EXPERIENCE_SIGNALS.map((signal, index) => {
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
                duration: 0.42,
                delay: 0.5 + index * 0.12
              }}
              className="rounded-[13px] border border-border bg-background/70 p-2.5 backdrop-blur-lg sm:p-3">
              <Icon className="size-3.5 text-theme-accent" />

              <p className="mt-2 text-[7px] leading-4 text-muted sm:text-[8px]">{signal.label}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

type DesktopNavItemProps = {
  label: string;
  active?: boolean;
};

function DesktopNavItem({ label, active = false }: DesktopNavItemProps) {
  return (
    <div
      className={[
        'rounded-[6px]',
        'px-1.5',
        'py-1.5',
        'text-[5px]',
        active ? 'bg-theme-accent-soft text-theme-accent' : 'text-muted'
      ].join(' ')}>
      {label}
    </div>
  );
}

type DesktopFeatureProps = {
  icon: typeof Users;
  title: string;
  value: string;
};

function DesktopFeature({ icon: Icon, title, value }: DesktopFeatureProps) {
  return (
    <div className="rounded-[10px] border border-border bg-background/70 p-2.5">
      <div className="flex items-center justify-between gap-2">
        <Icon className="size-3 text-theme-accent" />

        <span className="text-[8px] font-semibold text-foreground">{value}</span>
      </div>

      <p className="mt-2 text-[5.5px] text-muted">{title}</p>
    </div>
  );
}

type TabletCardProps = {
  icon: typeof Users;
  title: string;
  value: string;
};

function TabletCard({ icon: Icon, title, value }: TabletCardProps) {
  return (
    <div className="rounded-[8px] border border-border bg-background/70 p-2">
      <div className="flex items-center justify-between gap-2">
        <Icon className="size-2.5 text-theme-accent" />

        <span className="text-[6.5px] font-semibold text-foreground">{value}</span>
      </div>

      <p className="mt-1.5 text-[4.5px] text-muted">{title}</p>
    </div>
  );
}

type ActivityItemProps = {
  title: string;
  meta: string;
};

function ActivityItem({ title, meta }: ActivityItemProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="size-1.5 shrink-0 rounded-full bg-theme-accent" />

      <div className="min-w-0">
        <p className="truncate text-[5.5px] text-foreground">{title}</p>

        <p className="text-[4.5px] text-muted">{meta}</p>
      </div>
    </div>
  );
}
