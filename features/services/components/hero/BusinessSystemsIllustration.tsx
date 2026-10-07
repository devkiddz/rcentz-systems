'use client';

import { useHydratedReducedMotion } from '@/hooks/use-hydrated-reduced-motion';

import Image from 'next/image';

import {
  BarChart3,
  BriefcaseBusiness,
  CircleDollarSign,
  Goal,
  Menu,
  Smartphone,
  Tablet,
  TrendingUp,
  Trophy,
  Users
} from 'lucide-react';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import { motion } from 'motion/react';

const financialData = [
  { year: '2020', revenue: 1.2, expenses: 0.8, profit: 0.4 },
  { year: '2021', revenue: 2.1, expenses: 1.4, profit: 0.8 },
  { year: '2022', revenue: 3.0, expenses: 2.1, profit: 1.5 },
  { year: '2023', revenue: 3.8, expenses: 2.8, profit: 2.2 },
  { year: '2024', revenue: 4.8, expenses: 3.4, profit: 2.9 }
];

const revenueData = [
  { name: 'Software & SaaS', value: 40 },
  { name: 'Professional Services', value: 25 },
  { name: 'Products', value: 20 },
  { name: 'Consulting', value: 10 },
  { name: 'Other', value: 5 }
];

const performanceData = [
  { quarter: 'Q1', value: 20 },
  { quarter: 'Q2', value: 42 },
  { quarter: 'Q3', value: 56 },
  { quarter: 'Q4', value: 88 }
];

const pieOpacity = [1, 0.82, 0.64, 0.46, 0.28];

export function BusinessSystemsIllustration() {
  const reduceMotion = Boolean(useHydratedReducedMotion());

  return (
    <div className="relative mx-auto w-full max-w-[760px] py-2 sm:py-3">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[48%] h-[86%] w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-theme-accent/[0.045] blur-3xl"
      />

      <div className="relative min-h-[390px] sm:min-h-[430px]">
        {/* =========================================
            TABLET — BACK LEFT
            ========================================= */}

        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  x: -16,
                  y: 10,
                  rotate: -4
                }
          }
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
            rotate: -4
          }}
          transition={{
            duration: 0.65,
            delay: 0.12,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="absolute bottom-4 left-[2%] z-30 hidden w-[185px] sm:block">
          <motion.div
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, -4, 0]
                  }
            }
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="overflow-hidden rounded-[22px] border-[4px] border-foreground/90 bg-foreground shadow-xl">
            <div className="flex h-3 items-center justify-center bg-foreground">
              <span className="size-1 rounded-full bg-background/20" />
            </div>

            <div className="overflow-hidden rounded-[14px] bg-background">
              <div className="flex h-8 items-center justify-between border-b border-border px-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="flex size-5 items-center justify-center rounded-[6px] bg-theme-accent text-[5px] font-semibold text-white">
                    BS
                  </div>

                  <span className="text-[6px] font-medium text-foreground">Business System</span>
                </div>

                <Menu className="size-3 text-muted" />
              </div>

              <div className="p-2.5">
                <p className="text-[6px] font-semibold text-foreground">Operations overview</p>

                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  <TabletMetric label="Clients" value="320" />
                  <TabletMetric label="Projects" value="36" />
                  <TabletMetric label="Revenue" value="₦8.4M" />
                  <TabletMetric label="Growth" value="+18%" />
                </div>

                <div className="mt-2 rounded-[9px] border border-border bg-surface-muted/25 p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[5px] font-medium text-foreground">Workflow</span>

                    <span className="size-1.5 rounded-full bg-theme-accent" />
                  </div>

                  <div className="mt-2 space-y-1.5">
                    <TabletWorkflow label="Client onboarding" />
                    <TabletWorkflow label="Project review" />
                    <TabletWorkflow label="Invoice approval" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* =========================================
            LAPTOP — MAIN PERSPECTIVE DEVICE
            ========================================= */}

        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 16,
                  scale: 0.97,
                  rotateX: 3,
                  rotateY: -5
                }
          }
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 3,
            rotateY: -5
          }}
          transition={{
            duration: 0.72,
            ease: [0.22, 1, 0.36, 1]
          }}
          style={{
            transformPerspective: 1200,
            transformOrigin: 'center center'
          }}
          className="absolute left-1/2 top-0 z-20 w-[86%] -translate-x-1/2 sm:w-[82%]">
          <motion.div
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, 3, 0]
                  }
            }
            transition={{
              duration: 6.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}>
            {/* Screen shell */}
            <div className="overflow-hidden rounded-[20px] border-[5px] border-foreground/90 bg-foreground shadow-2xl">
              <div className="relative flex h-4 items-center justify-center bg-foreground">
                <span className="size-1 rounded-full bg-background/25" />
              </div>

              <div className="overflow-hidden rounded-[11px] bg-background">
                {/* browser */}
                <div className="flex h-7 items-center gap-2 border-b border-border bg-surface-muted/55 px-2.5">
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="size-1.5 rounded-full bg-foreground/15" />
                    <span className="size-1.5 rounded-full bg-foreground/15" />
                    <span className="size-1.5 rounded-full bg-theme-accent/70" />
                  </div>

                  <div className="flex h-4 min-w-0 flex-1 items-center rounded-full border border-border bg-background/75 px-2">
                    <span className="truncate font-mono text-[5px] tracking-[0.05em] text-muted">
                      business.example/dashboard
                    </span>
                  </div>

                  <span className="size-1.5 shrink-0 rounded-full bg-theme-accent" />
                </div>

                {/* business dashboard */}
                <div className="bg-surface-muted/20 p-2">
                  <div className="grid grid-cols-3 gap-2">
                    <DashboardPanel title="Key Highlights" delay={0} reduceMotion={reduceMotion}>
                      <div className="mt-3 grid grid-cols-4 gap-1.5">
                        <MetricCard icon={CircleDollarSign} value="₦8.4M" label="Revenue" />

                        <MetricCard icon={Users} value="320" label="Clients" />

                        <MetricCard icon={TrendingUp} value="48%" label="Growth" />

                        <MetricCard icon={Trophy} value="92%" label="Success" />
                      </div>
                    </DashboardPanel>

                    <DashboardPanel title="Financial Overview" delay={0.08} reduceMotion={reduceMotion}>
                      <div className="mt-2 grid grid-cols-[1fr_68px] gap-2">
                        <div className="h-[105px] min-w-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={financialData}
                              margin={{
                                top: 6,
                                right: 0,
                                bottom: 0,
                                left: -28
                              }}>
                              <CartesianGrid stroke="currentColor" strokeOpacity={0.07} vertical={false} />

                              <XAxis
                                dataKey="year"
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                  fontSize: 5.5,
                                  fill: 'currentColor'
                                }}
                              />

                              <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                  fontSize: 5.5,
                                  fill: 'currentColor'
                                }}
                              />

                              <Tooltip
                                cursor={{
                                  fill: 'transparent'
                                }}
                                contentStyle={{
                                  fontSize: 8,
                                  borderRadius: 8,
                                  padding: 6
                                }}
                              />

                              <Bar
                                dataKey="revenue"
                                fill="var(--theme-accent)"
                                radius={[2, 2, 0, 0]}
                                animationDuration={reduceMotion ? 0 : 900}
                              />

                              <Bar
                                dataKey="expenses"
                                fill="var(--theme-accent)"
                                fillOpacity={0.58}
                                radius={[2, 2, 0, 0]}
                                animationDuration={reduceMotion ? 0 : 1050}
                              />

                              <Bar
                                dataKey="profit"
                                fill="var(--theme-accent)"
                                fillOpacity={0.28}
                                radius={[2, 2, 0, 0]}
                                animationDuration={reduceMotion ? 0 : 1200}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="flex min-w-0 flex-col gap-1.5">
                          <motion.div
                            initial={
                              reduceMotion
                                ? false
                                : {
                                    opacity: 0,
                                    scale: 0.92
                                  }
                            }
                            animate={{
                              opacity: 1,
                              scale: 1
                            }}
                            transition={{
                              delay: 0.5,
                              duration: 0.45
                            }}
                            className="rounded-[8px] bg-theme-accent p-2 text-white">
                            <p className="text-[5px] opacity-80">Total Revenue</p>

                            <p className="mt-1 text-[11px] font-semibold">₦8.4M</p>

                            <p className="mt-1 text-[5.5px]">+18%</p>
                          </motion.div>

                          <div className="relative min-h-[46px] overflow-hidden rounded-[7px] border border-border bg-surface-muted">
                            <div className="absolute inset-0 grid place-items-center">
                              <BarChart3 className="size-5 text-theme-accent/50" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </DashboardPanel>

                    <DashboardPanel title="Revenue Breakdown" delay={0.16} reduceMotion={reduceMotion}>
                      <div className="mt-2 grid grid-cols-[100px_1fr] items-center gap-2">
                        <div className="relative h-[105px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={revenueData}
                                dataKey="value"
                                cx="50%"
                                cy="50%"
                                innerRadius={25}
                                outerRadius={45}
                                paddingAngle={1}
                                animationDuration={reduceMotion ? 0 : 1000}>
                                {revenueData.map((item, index) => (
                                  <Cell
                                    key={item.name}
                                    fill="var(--theme-accent)"
                                    fillOpacity={pieOpacity[index]}
                                  />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>

                          <div className="pointer-events-none absolute inset-0 grid place-items-center">
                            <BarChart3 className="size-4 text-foreground" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          {revenueData.map((item, index) => (
                            <div key={item.name} className="flex items-center gap-1.5">
                              <span
                                className="size-1.5 shrink-0 rounded-full bg-theme-accent"
                                style={{
                                  opacity: pieOpacity[index]
                                }}
                              />

                              <div className="min-w-0">
                                <p className="text-[6.5px] font-semibold text-foreground">{item.value}%</p>

                                <p className="truncate text-[5px] text-muted">{item.name}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DashboardPanel>

                    <DashboardPanel title="Performance Analysis" delay={0.24} reduceMotion={reduceMotion}>
                      <div className="mt-2 grid grid-cols-[1fr_82px] gap-2">
                        <div className="h-[103px] min-w-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={performanceData}
                              margin={{
                                top: 8,
                                right: 8,
                                left: -30,
                                bottom: 0
                              }}>
                              <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.07} />

                              <XAxis
                                dataKey="quarter"
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                  fontSize: 5.5,
                                  fill: 'currentColor'
                                }}
                              />

                              <YAxis
                                domain={[0, 100]}
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                  fontSize: 5.5,
                                  fill: 'currentColor'
                                }}
                              />

                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke="var(--theme-accent)"
                                strokeWidth={1.7}
                                dot={{
                                  r: 2,
                                  fill: 'var(--theme-accent)'
                                }}
                                animationDuration={reduceMotion ? 0 : 1100}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="rounded-[8px] bg-theme-accent p-2 text-white">
                          <InsightRow label="Sales Growth" value="Up 32%" />

                          <InsightRow label="Market Share" value="Up 18%" />

                          <InsightRow label="Retention" value="Up 12%" last />
                        </div>
                      </div>
                    </DashboardPanel>

                    <DashboardPanel title="Projects & Activities" delay={0.32} reduceMotion={reduceMotion}>
                      <div className="mt-3 grid grid-cols-3 gap-1.5">
                        <ActivityCard
                          delay={0.55}
                          reduceMotion={reduceMotion}
                          icon={BriefcaseBusiness}
                          title="Planning"
                          description="Define scope and align resources."
                        />

                        <ActivityCard
                          delay={0.65}
                          reduceMotion={reduceMotion}
                          icon={Goal}
                          title="Execution"
                          description="Deliver through structured flows."
                        />

                        <ActivityCard
                          delay={0.75}
                          reduceMotion={reduceMotion}
                          icon={TrendingUp}
                          title="Evaluation"
                          description="Review outcomes and improve."
                        />
                      </div>
                    </DashboardPanel>

                    <DashboardPanel
                      title="Team & People"
                      delay={0.4}
                      reduceMotion={reduceMotion}
                      className="overflow-hidden">
                      <div className="mt-2 grid grid-cols-[0.72fr_1.28fr] gap-2">
                        <div className="min-w-0">
                          <p className="max-w-[92px] text-[5.5px] leading-[9px] text-muted">
                            Connected people working through one business system.
                          </p>

                          <div className="mt-3">
                            <p className="text-[13px] font-semibold text-foreground">50+</p>

                            <p className="text-[5px] text-muted">Team Members</p>
                          </div>

                          <div className="mt-2">
                            <p className="text-[10px] font-semibold text-foreground">10+</p>

                            <p className="text-[5px] text-muted">Departments</p>
                          </div>
                        </div>

                        <motion.div
                          animate={
                            reduceMotion
                              ? undefined
                              : {
                                  scale: [1, 1.025, 1]
                                }
                          }
                          transition={{
                            duration: 7,
                            repeat: Infinity,
                            ease: 'easeInOut'
                          }}
                          className="relative min-h-[108px] overflow-hidden rounded-[11px]">
                          <Image
                            src="/images/services/business-management/black-team-03.jpg"
                            alt="Business team collaborating"
                            fill
                            sizes="260px"
                            className="object-cover"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
                        </motion.div>
                      </div>
                    </DashboardPanel>
                  </div>
                </div>
              </div>
            </div>

            {/* laptop base */}
            <div className="mx-auto h-3 w-[97%] rounded-b-[5px] bg-foreground/90" />

            <div className="relative mx-auto h-[13px] w-full">
              <div className="absolute inset-x-0 top-0 h-[8px] rounded-b-[45%] bg-foreground/80" />

              <div className="absolute left-1/2 top-0 h-[3px] w-[16%] -translate-x-1/2 rounded-b-full bg-background/25" />
            </div>

            <div
              aria-hidden="true"
              className="mx-auto -mt-1 h-3 w-[76%] rounded-[50%] bg-foreground/10 blur-lg"
            />
          </motion.div>
        </motion.div>

        {/* =========================================
            MOBILE — FRONT RIGHT
            ========================================= */}

        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  x: 14,
                  y: 10,
                  rotate: 3
                }
          }
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
            rotate: 3
          }}
          transition={{
            duration: 0.65,
            delay: 0.18,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="absolute bottom-0 right-[3%] z-40 w-[118px] sm:right-[5%] sm:w-[132px]">
          <motion.div
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, -6, 0],
                    scale: [1, 1.015, 1]
                  }
            }
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="overflow-hidden rounded-[24px] border-[4px] border-foreground/90 bg-foreground shadow-2xl">
            <div className="flex h-3 items-center justify-center bg-foreground">
              <span className="h-1 w-6 rounded-full bg-background/20" />
            </div>

            <div className="overflow-hidden rounded-[17px] bg-background">
              <div className="flex h-7 items-center justify-between border-b border-border px-2">
                <div className="flex items-center gap-1">
                  <div className="flex size-4 items-center justify-center rounded-[5px] bg-theme-accent text-[4px] font-semibold text-white">
                    BS
                  </div>

                  <span className="text-[5px] font-medium text-foreground">Business</span>
                </div>

                <Menu className="size-2.5 text-muted" />
              </div>

              <div className="p-2">
                <p className="text-[7px] font-semibold leading-[1.05] text-foreground">Operations overview</p>

                <p className="mt-1 text-[4.5px] leading-[7px] text-muted">
                  Your business activity in one place.
                </p>

                <div className="mt-2 grid grid-cols-2 gap-1">
                  <MobileMetric label="Clients" value="320" />

                  <MobileMetric label="Growth" value="+18%" />
                </div>

                <div className="mt-2 rounded-[8px] border border-border bg-surface-muted/25 p-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[4.5px] font-medium text-foreground">Project status</span>

                    <span className="size-1.5 rounded-full bg-theme-accent" />
                  </div>

                  <div className="mt-1.5 space-y-1">
                    <MobileStatus label="Active" value="12" />

                    <MobileStatus label="Review" value="04" />

                    <MobileStatus label="Complete" value="20" />
                  </div>
                </div>

                <div className="mt-2 rounded-[8px] bg-theme-accent p-2 text-white">
                  <p className="text-[4px] opacity-75">Revenue</p>

                  <p className="mt-0.5 text-[8px] font-semibold">₦8.4M</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* =========================================
            DEVICE LABELS
            ========================================= */}

        <div className="absolute bottom-[-4px] left-1/2 z-40 hidden -translate-x-1/2 items-center gap-2 sm:flex">
          <DeviceBadge icon={Tablet} label="Tablet" />

          <DeviceBadge icon={BriefcaseBusiness} label="Business System" />

          <DeviceBadge icon={Smartphone} label="Mobile" />
        </div>
      </div>
    </div>
  );
}

type DashboardPanelProps = {
  title: string;
  delay: number;
  reduceMotion: boolean;
  className?: string;
  children: React.ReactNode;
};

function DashboardPanel({ title, delay, reduceMotion, className = '', children }: DashboardPanelProps) {
  return (
    <motion.div
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 10
            }
      }
      animate={{
        opacity: 1,
        y: 0
      }}
      transition={{
        duration: 0.45,
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
      className={[
        'relative min-h-[152px]',
        'rounded-[13px]',
        'border border-border',
        'bg-background/92',
        'p-3',
        'shadow-sm',
        'backdrop-blur-xl',
        className
      ].join(' ')}>
      <div className="flex items-center gap-2">
        <h3 className="text-[9px] font-semibold uppercase tracking-[-0.01em] text-foreground">{title}</h3>

        <span className="h-px w-5 bg-theme-accent" />
      </div>

      {children}
    </motion.div>
  );
}

type MetricCardProps = {
  icon: typeof Users;
  value: string;
  label: string;
};

function MetricCard({ icon: Icon, value, label }: MetricCardProps) {
  return (
    <div className="min-w-0 text-center">
      <div className="mx-auto flex size-8 items-center justify-center rounded-full border border-theme-accent/20 bg-theme-accent-soft/30">
        <Icon className="size-3.5 text-theme-accent" />
      </div>

      <p className="mt-2 text-[9px] font-semibold text-foreground">{value}</p>

      <p className="mt-0.5 truncate text-[5.5px] text-muted">{label}</p>
    </div>
  );
}

type InsightRowProps = {
  label: string;
  value: string;
  last?: boolean;
};

function InsightRow({ label, value, last = false }: InsightRowProps) {
  return (
    <div className={['py-1.5', !last ? 'border-b border-white/15' : ''].join(' ')}>
      <p className="text-[5px] opacity-75">{label}</p>

      <p className="mt-0.5 text-[6px] font-medium">{value}</p>
    </div>
  );
}

type ActivityCardProps = {
  delay: number;
  reduceMotion: boolean;
  icon: typeof Goal;
  title: string;
  description: string;
};

function ActivityCard({ delay, reduceMotion, icon: Icon, title, description }: ActivityCardProps) {
  return (
    <motion.div
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
        duration: 0.4,
        delay
      }}
      className="rounded-[9px] border border-border bg-background/70 p-2 text-center">
      <div className="mx-auto flex size-7 items-center justify-center rounded-full bg-theme-accent">
        <Icon className="size-3 text-white" />
      </div>

      <p className="mt-2 text-[6.5px] font-medium text-foreground">{title}</p>

      <p className="mt-1 text-[5px] leading-[8px] text-muted">{description}</p>
    </motion.div>
  );
}

type TabletMetricProps = {
  label: string;
  value: string;
};

function TabletMetric({ label, value }: TabletMetricProps) {
  return (
    <div className="rounded-[8px] border border-border bg-surface-muted/25 p-2">
      <p className="text-[7px] font-semibold text-foreground">{value}</p>

      <p className="mt-0.5 text-[4.5px] text-muted">{label}</p>
    </div>
  );
}

function TabletWorkflow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-[6px] border border-border bg-background/70 px-1.5 py-1">
      <span className="size-1.5 rounded-full bg-theme-accent" />

      <span className="truncate text-[4.5px] text-muted">{label}</span>
    </div>
  );
}

type MobileMetricProps = {
  label: string;
  value: string;
};

function MobileMetric({ label, value }: MobileMetricProps) {
  return (
    <div className="rounded-[7px] border border-border bg-surface-muted/25 p-1.5">
      <p className="text-[6.5px] font-semibold text-foreground">{value}</p>

      <p className="mt-0.5 text-[4px] text-muted">{label}</p>
    </div>
  );
}

function MobileStatus({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[4px] text-muted">{label}</span>

      <span className="text-[4.5px] font-medium text-foreground">{value}</span>
    </div>
  );
}

function DeviceBadge({ icon: Icon, label }: { icon: typeof Tablet; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-border bg-background/85 px-2.5 py-1.5 shadow-sm backdrop-blur-xl">
      <Icon className="size-2.5 text-theme-accent" />

      <span className="font-mono text-[5px] uppercase tracking-[0.1em] text-muted">{label}</span>
    </div>
  );
}
