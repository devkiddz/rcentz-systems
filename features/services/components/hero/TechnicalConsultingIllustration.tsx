'use client';

import { useHydratedReducedMotion } from '@/hooks/use-hydrated-reduced-motion';

import { useState } from 'react';

import { AnimatePresence, motion } from 'motion/react';

import {
  ArrowDown,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  GitBranch,
  Globe2,
  Layers3,
  Lightbulb,
  Lock,
  Search,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Workflow,
  Zap
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

interface OptionType {
  id: string;
  icon: LucideIcon;
  title: string;
  meta: string;
  architecture: {
    title: string;
    description: string;
    techStack: string[];
    blocks: Array<{
      icon: LucideIcon;
      title: string;
      text: string;
      highlighted?: boolean;
    }>;
  };
}

const CONSULTING_OPTIONS: OptionType[] = [
  {
    id: 'website',
    icon: Globe2,
    title: 'Marketing & Web',
    meta: 'Public experience',
    architecture: {
      title: 'High-Performance SSR Content Hub',
      description:
        'Edge-rendered Next.js system with automated SEO, dynamic CMS integration, and optimized asset delivery.',
      techStack: ['Next.js App Router', 'Tailwind CSS', 'CMS / MDX', 'Edge CDN'],
      blocks: [
        {
          icon: Code2,
          title: 'Edge UI',
          text: 'Server-rendered UI & micro-interactions'
        },
        {
          icon: Zap,
          title: 'Core Web Vitals',
          text: 'Sub-second LCP & responsive asset pipeline'
        },
        {
          icon: Database,
          title: 'Headless CMS',
          text: 'Structured content API & webhooks'
        },
        {
          icon: Workflow,
          title: 'Analytics Engine',
          text: 'Privacy-focused tracking & event capture'
        },
        {
          icon: GitBranch,
          title: 'Static / SSR System',
          text: 'Production-ready web platform',
          highlighted: true
        }
      ]
    }
  },
  {
    id: 'saas',
    icon: Layers3,
    title: 'SaaS Platform',
    meta: 'Accounts & workflows',
    architecture: {
      title: 'Modular SaaS Application Architecture',
      description:
        'Multi-tenant architecture with RBAC authentication, asynchronous background workers, and persistent PostgreSQL data.',
      techStack: ['Next.js App Router', 'Better Auth / Clerk', 'PostgreSQL / Prisma', 'Redis Queues'],
      blocks: [
        {
          icon: Code2,
          title: 'Client Workspace',
          text: 'Interactive stateful dashboard & views'
        },
        {
          icon: Lock,
          title: 'Auth & RBAC',
          text: 'Session management & permission gates'
        },
        {
          icon: Database,
          title: 'Relational DB',
          text: 'PostgreSQL schema with Prisma ORM'
        },
        {
          icon: Cpu,
          title: 'Task Workers',
          text: 'Redis background job processing'
        },
        {
          icon: ShieldCheck,
          title: 'Scalable SaaS Core',
          text: 'Multi-tenant product engine',
          highlighted: true
        }
      ]
    }
  },
  {
    id: 'mobile',
    icon: Smartphone,
    title: 'Mobile Product',
    meta: 'Device-first journey',
    architecture: {
      title: 'Cross-Platform Native & API Backend',
      description:
        'Mobile-first application backed by REST/GraphQL endpoints, offline caching, and push notifications.',
      techStack: ['React Native / Expo', 'REST & GraphQL API', 'Redis Cache', 'Push Gateway'],
      blocks: [
        {
          icon: Smartphone,
          title: 'Native Shell',
          text: 'Fluid gesture-driven mobile UI'
        },
        {
          icon: Server,
          title: 'API Gateway',
          text: 'Secured REST & GraphQL endpoints'
        },
        {
          icon: Database,
          title: 'Offline Cache',
          text: 'Local SQLite state synchronization'
        },
        {
          icon: Workflow,
          title: 'Push Gateway',
          text: 'Automated push & event channels'
        },
        {
          icon: GitBranch,
          title: 'Cross-Platform System',
          text: 'Mobile-first ecosystem',
          highlighted: true
        }
      ]
    }
  }
];

export function TechnicalConsultingIllustration() {
  const reduceMotion = Boolean(useHydratedReducedMotion());

  const [selectedOptionId, setSelectedOptionId] = useState<string>('saas');

  const activeOption =
    CONSULTING_OPTIONS.find(option => option.id === selectedOptionId) ?? CONSULTING_OPTIONS[1];

  return (
    <div className="relative mx-auto w-full max-w-[740px] py-1 sm:py-2">
      {/* =========================================
          AMBIENT BACKGROUND
          ========================================= */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[48%] h-[82%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-theme-accent/[0.055] blur-3xl"
      />

      <motion.div
        initial={
          reduceMotion
            ? false
            : {
                opacity: 0,
                y: 12,
                scale: 0.99
              }
        }
        animate={{
          opacity: 1,
          y: 0,
          scale: 1
        }}
        transition={{
          duration: 0.55,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="relative min-h-[500px] w-full">
        {/* =========================================
            PHASE 01 — BUSINESS STRATEGY
            ========================================= */}

        <FloatingCard
          reduceMotion={reduceMotion}
          delay={0.04}
          className="mx-auto w-[210px] rounded-[14px] border border-border bg-background/95 p-3 shadow-md backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-[9px] border border-theme-accent/20 bg-theme-accent-soft">
              <Lightbulb className="size-3.5 text-theme-accent" />
            </div>

            <div className="min-w-0">
              <p className="font-mono text-[6px] uppercase tracking-[0.12em] text-theme-accent">Phase 01</p>

              <p className="text-[9px] font-semibold text-foreground">Business Strategy</p>

              <p className="text-[7px] leading-3 text-muted">Identify goals & scope</p>
            </div>
          </div>
        </FloatingCard>

        <FlowArrow reduceMotion={reduceMotion} />

        {/* =========================================
            PHASE 02 — DISCOVERY
            ========================================= */}

        <FloatingCard
          reduceMotion={reduceMotion}
          delay={0.1}
          className="mx-auto w-[330px] rounded-[16px] border border-border bg-background/95 p-3 shadow-lg backdrop-blur-xl sm:w-[360px]">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-[9px] border border-theme-accent/20 bg-theme-accent-soft">
                <Search className="size-3.5 text-theme-accent" />
              </div>

              <div className="min-w-0">
                <p className="font-mono text-[6px] uppercase tracking-[0.12em] text-theme-accent">Phase 02</p>

                <p className="text-[10px] font-semibold text-foreground">Technical Discovery</p>

                <p className="mt-0.5 text-[7px] leading-3 text-muted">
                  Data, users, scale and technical constraints.
                </p>
              </div>
            </div>

            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-theme-accent" />
          </div>

          <div className="mt-2 grid grid-cols-3 gap-1.5">
            <MiniTag label="Data" />
            <MiniTag label="Journeys" />
            <MiniTag label="Scale" />
          </div>
        </FloatingCard>

        <FlowArrow reduceMotion={reduceMotion} />

        {/* =========================================
            PHASE 03 — PRODUCT DIRECTION
            ========================================= */}

        <div className="relative z-20 grid grid-cols-3 gap-2">
          {CONSULTING_OPTIONS.map((option, index) => {
            const Icon = option.icon;

            const isSelected = option.id === selectedOptionId;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedOptionId(option.id)}
                className="min-w-0 text-left focus:outline-none">
                <FloatingCard
                  reduceMotion={reduceMotion}
                  delay={0.16 + index * 0.05}
                  className={[
                    'relative h-full rounded-[14px] border p-2.5',
                    'transition-[border-color,background-color,transform,box-shadow]',
                    'duration-300',
                    'backdrop-blur-xl',
                    isSelected
                      ? [
                          'border-theme-accent',
                          'bg-theme-accent-soft/30',
                          'shadow-md',
                          'ring-1 ring-theme-accent'
                        ].join(' ')
                      : [
                          'border-border',
                          'bg-background/85',
                          'hover:border-border-strong',
                          'hover:bg-background'
                        ].join(' ')
                  ].join(' ')}>
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={[
                        'flex size-7 shrink-0 items-center justify-center rounded-[8px] border',
                        isSelected
                          ? 'border-theme-accent bg-theme-accent text-white'
                          : 'border-theme-accent/15 bg-theme-accent-soft text-theme-accent'
                      ].join(' ')}>
                      <Icon className="size-3.5" />
                    </div>

                    {isSelected ? (
                      <span className="rounded-full bg-theme-accent/15 px-1.5 py-0.5 font-mono text-[5px] font-semibold uppercase tracking-[0.08em] text-theme-accent">
                        Active
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 text-[8px] font-semibold text-foreground sm:text-[9px]">
                    {option.title}
                  </p>

                  <p className="mt-0.5 text-[6px] leading-3 text-muted">{option.meta}</p>
                </FloatingCard>
              </button>
            );
          })}
        </div>

        {/* =========================================
            FLOW CONNECTOR
            ========================================= */}

        <div aria-hidden="true" className="relative mx-auto h-6 w-[70%]">
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 border-l border-dashed border-border" />

          <div className="absolute left-0 top-1/2 h-px w-full border-t border-dashed border-border" />

          <span className="absolute left-0 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-border" />

          <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-theme-accent" />

          <span className="absolute right-0 top-1/2 size-1.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-border" />
        </div>

        {/* =========================================
            PHASE 04 — ARCHITECTURE
            ========================================= */}

        <FloatingCard
          reduceMotion={reduceMotion}
          delay={0.32}
          className="relative overflow-hidden rounded-[18px] border border-theme-accent/25 bg-background/95 p-3.5 shadow-xl backdrop-blur-xl sm:p-4">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-theme-accent/60 to-transparent"
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeOption.id}
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 5
                    }
              }
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={
                reduceMotion
                  ? undefined
                  : {
                      opacity: 0,
                      y: -5
                    }
              }
              transition={{
                duration: 0.22
              }}>
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-theme-accent text-white shadow-sm">
                    <Sparkles className="size-4" />
                  </div>

                  <div className="min-w-0">
                    <span className="font-mono text-[5.5px] font-semibold uppercase tracking-[0.12em] text-theme-accent">
                      Recommended Architecture
                    </span>

                    <h4 className="mt-0.5 text-[10px] font-semibold leading-4 text-foreground sm:text-[11px]">
                      {activeOption.architecture.title}
                    </h4>

                    <p className="mt-0.5 max-w-[430px] text-[7px] leading-3 text-muted">
                      {activeOption.architecture.description}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1 rounded-full border border-theme-accent/20 bg-theme-accent-soft/60 px-2 py-1 font-mono text-[5.5px] font-medium text-theme-accent">
                  <CheckCircle2 className="size-2.5" />

                  <span>Optimal</span>
                </div>
              </div>

              {/* Tech Stack */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1">
                <span className="mr-1 font-mono text-[5.5px] uppercase tracking-[0.08em] text-muted">
                  Stack
                </span>

                {activeOption.architecture.techStack.map(tech => (
                  <span
                    key={tech}
                    className="rounded-[5px] border border-border bg-surface-muted/35 px-1.5 py-0.5 font-mono text-[6px] font-medium text-foreground">
                    {tech}
                  </span>
                ))}
              </div>

              {/* Solution Blocks */}
              <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-5">
                {activeOption.architecture.blocks.map((block, index) => (
                  <SolutionBlock
                    key={block.title}
                    icon={block.icon}
                    title={block.title}
                    text={block.text}
                    reduceMotion={reduceMotion}
                    delay={0.38 + index * 0.04}
                    highlighted={block.highlighted}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </FloatingCard>
      </motion.div>
    </div>
  );
}

function FloatingCard({
  children,
  className,
  reduceMotion,
  delay
}: {
  children: React.ReactNode;
  className: string;
  reduceMotion: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 8,
              scale: 0.99
            }
      }
      animate={{
        opacity: 1,
        y: 0,
        scale: 1
      }}
      transition={{
        duration: 0.38,
        delay
      }}
      className={className}>
      {children}
    </motion.div>
  );
}

function MiniTag({ label }: { label: string }) {
  return (
    <div className="rounded-[6px] border border-border bg-surface-muted/25 px-1.5 py-1 text-center">
      <span className="font-mono text-[6px] text-muted">{label}</span>
    </div>
  );
}

function SolutionBlock({
  icon: Icon,
  title,
  text,
  reduceMotion,
  delay,
  highlighted = false
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  reduceMotion: boolean;
  delay: number;
  highlighted?: boolean;
}) {
  return (
    <motion.div
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 6
            }
      }
      animate={{
        opacity: 1,
        y: 0
      }}
      transition={{
        duration: 0.3,
        delay
      }}
      className={[
        'flex min-h-[94px] flex-col rounded-[10px] border p-2 text-left',
        highlighted
          ? ['col-span-2', 'border-theme-accent/30', 'bg-theme-accent-soft/40', 'sm:col-auto'].join(' ')
          : ['border-border', 'bg-surface-muted/18'].join(' ')
      ].join(' ')}>
      <div
        className={[
          'flex size-6 items-center justify-center rounded-[7px]',
          highlighted ? 'bg-theme-accent text-white' : 'bg-theme-accent-soft text-theme-accent'
        ].join(' ')}>
        <Icon className="size-3" />
      </div>

      <p className="mt-1.5 text-[7px] font-semibold leading-3 text-foreground">{title}</p>

      <p className="mt-0.5 text-[5.5px] leading-[9px] text-muted">{text}</p>

      {highlighted ? (
        <div className="mt-auto flex items-center gap-1 pt-1.5 font-mono text-[5px] font-medium text-theme-accent">
          <CheckCircle2 className="size-2.5" />

          <span>System Output</span>
        </div>
      ) : null}
    </motion.div>
  );
}

function FlowArrow({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <motion.div
      aria-hidden="true"
      animate={
        reduceMotion
          ? undefined
          : {
              y: [0, 2, 0]
            }
      }
      transition={{
        duration: 1.8,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className="flex h-5 items-center justify-center text-theme-accent">
      <ArrowDown className="size-3" />
    </motion.div>
  );
}
