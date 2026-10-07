'use client';

import { useHydratedReducedMotion } from '@/hooks/use-hydrated-reduced-motion';

import {
  BrainCircuit,
  Check,
  Code2,
  Cpu,
  Database,
  PanelsTopLeft,
  ShieldCheck,
  Sparkles,
  UserRound,
  Workflow
} from 'lucide-react';

import { motion } from 'motion/react';

const CAPABILITIES = [
  {
    label: 'Architecture',
    icon: Workflow,
    position: 'left-1/2 top-[1%] -translate-x-1/2'
  },
  {
    label: 'Interface',
    icon: PanelsTopLeft,
    position: 'right-[1%] top-1/2 -translate-y-1/2'
  },
  {
    label: 'Data',
    icon: Database,
    position: 'bottom-[1%] left-1/2 -translate-x-1/2'
  },
  {
    label: 'Logic',
    icon: Code2,
    position: 'left-[1%] top-1/2 -translate-y-1/2'
  }
] as const;

const CIRCUITS = [
  {
    id: 'architecture',
    d: 'M160 128 L160 102 L160 72 L160 48',
    electrodes: [
      [160, 104],
      [160, 77]
    ],
    delay: '0s'
  },
  {
    id: 'interface',
    d: 'M192 160 L218 160 L248 160 L274 160',
    electrodes: [
      [218, 160],
      [247, 160]
    ],
    delay: '0.55s'
  },
  {
    id: 'data',
    d: 'M160 192 L160 218 L160 248 L160 274',
    electrodes: [
      [160, 218],
      [160, 247]
    ],
    delay: '1.1s'
  },
  {
    id: 'logic',
    d: 'M128 160 L102 160 L72 160 L46 160',
    electrodes: [
      [102, 160],
      [73, 160]
    ],
    delay: '1.65s'
  }
] as const;

const NEURAL_NODES = [
  [50, 13],
  [28, 25],
  [72, 25],
  [16, 48],
  [40, 45],
  [60, 45],
  [84, 48],
  [28, 70],
  [50, 61],
  [72, 70],
  [50, 86]
] as const;

const NEURAL_EDGES = [
  [0, 1],
  [0, 2],
  [1, 3],
  [1, 4],
  [2, 5],
  [2, 6],
  [3, 7],
  [4, 7],
  [4, 8],
  [5, 8],
  [5, 9],
  [6, 9],
  [7, 10],
  [8, 10],
  [9, 10],
  [4, 5],
  [7, 8],
  [8, 9]
] as const;

function IntelligenceCore({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div
      className={[
        'relative',
        'aspect-square',
        'w-[310px]',
        'max-w-[94vw]',
        'sm:w-[340px]',
        'lg:w-[330px]'
      ].join(' ')}>
      {/* ==========================================
          CIRCUIT BOARD
          ========================================== */}

      <svg
        aria-hidden="true"
        viewBox="0 0 320 320"
        className="absolute inset-0 size-full overflow-visible text-theme-accent">
        {/* MICRO BOARD TRACES */}

        <path
          d="M160 70 L138 70 L126 58"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.12"
        />

        <path
          d="M250 160 L250 138 L266 122"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.12"
        />

        <path
          d="M160 250 L182 250 L194 266"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.12"
        />

        <path
          d="M70 160 L70 182 L54 198"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.12"
        />

        {CIRCUITS.map(circuit => (
          <g key={circuit.id}>
            {/* MAIN TRACE */}

            <motion.path
              d={circuit.d}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              initial={{
                pathLength: 0,
                opacity: 0
              }}
              animate={{
                pathLength: 1,
                opacity: 0.38
              }}
              transition={{
                duration: 1.3,
                ease: [0.22, 1, 0.36, 1]
              }}
            />

            {/* GLOW TRACE */}

            <path d={circuit.d} fill="none" stroke="currentColor" strokeWidth="5" opacity="0.025" />

            {/* ELECTRODES */}

            {circuit.electrodes.map(([cx, cy], index) => (
              <g key={index}>
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r="4.5"
                  fill="var(--background)"
                  stroke="currentColor"
                  strokeWidth="1"
                  animate={
                    reduceMotion
                      ? undefined
                      : {
                          r: [3.5, 5.5, 3.5],
                          opacity: [0.45, 1, 0.45]
                        }
                  }
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: index * 0.25
                  }}
                />

                <circle cx={cx} cy={cy} r="1.7" fill="currentColor" />
              </g>
            ))}

            {/* ELECTRICAL CURRENT */}

            {!reduceMotion ? (
              <>
                <circle r="3.4" fill="currentColor" opacity="0.95">
                  <animateMotion dur="2.8s" begin={circuit.delay} repeatCount="indefinite" path={circuit.d} />
                </circle>

                <circle r="7" fill="currentColor" opacity="0.08">
                  <animateMotion dur="2.8s" begin={circuit.delay} repeatCount="indefinite" path={circuit.d} />
                </circle>
              </>
            ) : null}
          </g>
        ))}
      </svg>

      {/* ==========================================
          INTELLIGENCE ORBITS
          ========================================== */}

      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                rotate: 360
              }
        }
        transition={{
          duration: 42,
          repeat: Infinity,
          ease: 'linear'
        }}
        className="absolute inset-[17%] rounded-full border border-theme-accent/12">
        <span className="absolute left-1/2 top-[-4px] size-2 -translate-x-1/2 rounded-full bg-theme-accent shadow-[0_0_17px_var(--theme-accent)]" />
      </motion.div>

      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                rotate: -360
              }
        }
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear'
        }}
        className="absolute inset-[23%] rounded-full border border-dashed border-theme-accent/15"
      />

      {/* ==========================================
          AI HEART
          ========================================== */}

      <div
        className={[
          'absolute',
          'left-1/2 top-1/2',
          'size-[116px]',
          '-translate-x-1/2',
          '-translate-y-1/2',
          'overflow-hidden',
          'rounded-full',
          'border',
          'border-theme-accent/30',
          'bg-background/96',
          'shadow-2xl',
          'backdrop-blur-2xl',
          'sm:size-[126px]'
        ].join(' ')}>
        {!reduceMotion ? (
          <motion.div
            animate={{
              scale: [0.72, 1.08, 0.72],
              opacity: [0.08, 0.32, 0.08]
            }}
            transition={{
              duration: 4.2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute inset-[5%] rounded-full bg-theme-accent-soft blur-lg"
          />
        ) : null}

        {/* NEURAL NETWORK */}

        <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 size-full">
          {NEURAL_EDGES.map(([from, to], index) => {
            const start = NEURAL_NODES[from];

            const end = NEURAL_NODES[to];

            return (
              <motion.line
                key={`${from}-${to}`}
                x1={start[0]}
                y1={start[1]}
                x2={end[0]}
                y2={end[1]}
                stroke="currentColor"
                strokeWidth="0.65"
                className="text-theme-accent"
                animate={
                  reduceMotion
                    ? {
                        opacity: 0.22
                      }
                    : {
                        opacity: [0.06, index % 3 === 0 ? 0.58 : 0.22, 0.06]
                      }
                }
                transition={{
                  duration: 2 + (index % 4) * 0.35,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: index * 0.055
                }}
              />
            );
          })}

          {NEURAL_NODES.map(([cx, cy], index) => (
            <motion.circle
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              r="1.8"
              fill="currentColor"
              className="text-theme-accent"
              animate={
                reduceMotion
                  ? undefined
                  : {
                      opacity: [0.25, 1, 0.25],
                      r: [1.4, 2.2, 1.4]
                    }
              }
              transition={{
                duration: 2 + index * 0.11,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          ))}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            animate={
              reduceMotion
                ? undefined
                : {
                    scale: [1, 1.08, 1]
                  }
            }
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="flex size-11 items-center justify-center rounded-2xl border border-theme-accent/25 bg-background/88 shadow-xl">
            <BrainCircuit className="size-5 text-theme-accent" />
          </motion.span>

          <p className="mt-2 font-mono text-[6px] font-medium uppercase tracking-[0.16em] text-theme-accent">
            AI Engine
          </p>

          <div className="mt-1 flex items-end gap-[2px]">
            {[5, 9, 13, 8].map((height, index) => (
              <motion.span
                key={index}
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        height: [3, height, 3]
                      }
                }
                transition={{
                  duration: 1.4 + index * 0.18,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="w-[2px] rounded-full bg-theme-accent"
              />
            ))}
          </div>
        </div>
      </div>

      {/* ==========================================
          CAPABILITY MODULES
          ========================================== */}

      {CAPABILITIES.map(({ label, icon: Icon, position }, index) => (
        <motion.div
          key={label}
          animate={
            reduceMotion
              ? undefined
              : {
                  y: index % 2 ? [0, 2, 0] : [0, -2, 0]
                }
          }
          transition={{
            duration: 4.4 + index * 0.3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className={[
            'absolute z-50',
            position,
            'flex min-w-[94px]',
            'items-center justify-center',
            'gap-2',
            'rounded-xl',
            'border',
            'border-theme-accent/18',
            'bg-background/94',
            'px-3 py-2',
            'shadow-xl',
            'backdrop-blur-xl',
            'sm:min-w-[108px]',
            'sm:px-3.5',
            'sm:py-2.5'
          ].join(' ')}>
          <span
            className={[
              'flex size-6 shrink-0',
              'items-center justify-center',
              'rounded-lg',
              'bg-theme-accent-soft'
            ].join(' ')}>
            <Icon className="size-3 text-theme-accent" />
          </span>

          <span
            className={[
              'font-mono',
              'text-[6px]',
              'font-medium',
              'uppercase',
              'tracking-[0.08em]',
              'text-muted',
              'sm:text-[7px]'
            ].join(' ')}>
            {label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function RcentzDirection() {
  return (
    <div
      className={[
        'overflow-hidden',
        'rounded-2xl',
        'border border-border',
        'bg-background/90',
        'shadow-xl',
        'backdrop-blur-xl'
      ].join(' ')}>
      <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-theme-accent-soft">
            <UserRound className="size-3.5 text-theme-accent" />
          </span>

          <div>
            <p className="text-[9px] font-semibold">Rcentz direction</p>

            <p className="font-mono text-[5px] uppercase tracking-[0.12em] text-muted">Human intelligence</p>
          </div>
        </div>

        <span className="size-1.5 rounded-full bg-theme-accent" />
      </div>

      <div className="p-3.5">
        <p className="font-mono text-[6px] uppercase tracking-[0.12em] text-muted">Business brief</p>

        <p className="mt-1.5 text-[10px] font-medium leading-4">
          Turn the business idea into a system built around real operations.
        </p>

        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {['Context', 'Strategy', 'Decisions', 'Review'].map(item => (
            <div
              key={item}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-muted/25 px-2 py-1.5">
              <span className="size-1 rounded-full bg-theme-accent" />

              <span className="font-mono text-[5px] uppercase tracking-[0.08em] text-muted">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductionOutput({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div
      className={[
        'overflow-hidden',
        'rounded-2xl',
        'border border-border',
        'bg-background/92',
        'shadow-2xl',
        'backdrop-blur-xl'
      ].join(' ')}>
      <div className="flex h-8 items-center gap-1.5 border-b border-border px-3">
        <span className="size-1.5 rounded-full bg-border-strong" />
        <span className="size-1.5 rounded-full bg-border-strong" />
        <span className="size-1.5 rounded-full bg-border-strong" />

        <div className="ml-2 h-4 flex-1 rounded-full border border-border bg-surface-muted/30" />

        <span className="ml-1 font-mono text-[5px] uppercase tracking-[0.1em] text-theme-accent">Live</span>
      </div>

      <div className="p-3">
        <div className="overflow-hidden rounded-xl border border-border bg-surface-muted/20">
          <div className="flex h-6 items-center justify-between border-b border-border px-2.5">
            <div className="h-1.5 w-10 rounded-full bg-foreground/80" />

            <div className="flex gap-1.5">
              <span className="h-1 w-5 rounded-full bg-border-strong" />
              <span className="h-1 w-5 rounded-full bg-border-strong" />
              <span className="h-1 w-5 rounded-full bg-border-strong" />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_0.9fr] gap-2 p-2.5">
            <div>
              <div className="h-2 w-[78%] rounded-full bg-foreground/85" />

              <div className="mt-1.5 h-2 w-[58%] rounded-full bg-foreground/85" />

              <div className="mt-2.5 h-1.5 w-[84%] rounded-full bg-border" />

              <div className="mt-1 h-1.5 w-[68%] rounded-full bg-border" />

              <div className="mt-3 h-5 w-16 rounded-full bg-theme-accent" />
            </div>

            <div className="relative overflow-hidden rounded-lg border border-theme-accent/15 bg-theme-accent-faint">
              <div className="absolute inset-2 grid grid-cols-2 gap-1">
                {[PanelsTopLeft, Database, Code2, Cpu].map((Icon, index) => (
                  <motion.div
                    key={index}
                    animate={
                      reduceMotion
                        ? undefined
                        : {
                            opacity: [0.4, 1, 0.4]
                          }
                    }
                    transition={{
                      duration: 2.4 + index * 0.28,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className="flex items-center justify-center rounded-md border border-border bg-background/70">
                    <Icon className="size-2.5 text-theme-accent" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {[
            ['UI', PanelsTopLeft],
            ['Logic', Code2],
            ['Data', Database]
          ].map(([label, Icon]) => (
            <div key={label as string} className="rounded-lg border border-border bg-background/72 p-2">
              <Icon className="size-2.5 text-theme-accent" />

              <p className="mt-1.5 font-mono text-[5px] uppercase tracking-[0.08em] text-muted">
                {label as string}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between rounded-lg border border-theme-accent/20 bg-theme-accent-faint px-2.5 py-2">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-theme-accent-soft">
              <ShieldCheck className="size-3 text-theme-accent" />
            </span>

            <span className="text-[7px] font-medium">Human reviewed</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Check className="size-3 text-theme-accent" />

            <span className="font-mono text-[5px] uppercase tracking-[0.08em] text-theme-accent">
              Production
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AICollaborationStory() {
  const reduceMotion = Boolean(useHydratedReducedMotion());

  return (
    <div
      className={[
        'relative',
        'min-h-[720px]',
        'overflow-visible',
        'sm:min-h-[750px]',
        'lg:min-h-[480px]'
      ].join(' ')}>
      <div className="rcentz-grid-fade absolute inset-0 opacity-32" />

      <div
        aria-hidden="true"
        className={[
          'absolute left-1/2 top-1/2',
          'h-[540px] w-[340px]',
          '-translate-x-1/2',
          '-translate-y-1/2',
          'rounded-full',
          'bg-theme-accent-faint',
          'blur-[120px]',
          'lg:size-[480px]'
        ].join(' ')}
      />

      {/* MOBILE MAIN SIGNAL */}

      <div
        aria-hidden="true"
        className="absolute bottom-[20%] left-1/2 top-[15%] z-10 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-theme-accent/20 to-transparent lg:hidden"
      />

      {/* HUMAN DIRECTION */}

      <motion.div
        initial={
          reduceMotion
            ? false
            : {
                opacity: 0,
                x: -14
              }
        }
        animate={{
          opacity: 1,
          x: 0
        }}
        transition={{
          duration: 0.65,
          ease: [0.22, 1, 0.36, 1]
        }}
        className={[
          'absolute',
          'left-[2%] right-[2%]',
          'top-[1%]',
          'z-40',

          'lg:left-[1%]',
          'lg:right-auto',
          'lg:top-[23%]',
          'lg:w-[25%]',
          'lg:max-w-[205px]'
        ].join(' ')}>
        <RcentzDirection />
      </motion.div>

      {/* AI INTELLIGENCE BOARD */}

      <div
        className={[
          'absolute',
          'left-1/2',
          'top-[27%]',
          'z-40',
          '-translate-x-1/2',

          'lg:top-1/2',
          'lg:-translate-y-1/2'
        ].join(' ')}>
        <IntelligenceCore reduceMotion={reduceMotion} />
      </div>

      {/* INFERENCE LABEL */}

      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                opacity: [0.45, 1, 0.45]
              }
        }
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className={[
          'absolute',
          'left-1/2 top-[61%]',
          'z-50',
          '-translate-x-1/2',
          'rounded-full',
          'border',
          'border-theme-accent/20',
          'bg-background/80',
          'px-3 py-1.5',
          'backdrop-blur-xl',

          'lg:top-auto',
          'lg:bottom-[5%]'
        ].join(' ')}>
        <div className="flex items-center gap-2">
          <Sparkles className="size-2.5 text-theme-accent" />

          <span className="whitespace-nowrap font-mono text-[5px] uppercase tracking-[0.12em] text-muted sm:text-[6px]">
            Context → Reason → Generate → Refine
          </span>
        </div>
      </motion.div>

      {/* PRODUCTION OUTPUT */}

      <motion.div
        initial={
          reduceMotion
            ? false
            : {
                opacity: 0,
                x: 14
              }
        }
        animate={{
          opacity: 1,
          x: 0
        }}
        transition={{
          delay: 0.2,
          duration: 0.65,
          ease: [0.22, 1, 0.36, 1]
        }}
        className={[
          'absolute',
          'bottom-[1%]',
          'left-[2%] right-[2%]',
          'z-40',

          'lg:bottom-auto',
          'lg:left-auto',
          'lg:right-[1%]',
          'lg:top-[18%]',
          'lg:w-[28%]',
          'lg:max-w-[230px]'
        ].join(' ')}>
        <ProductionOutput reduceMotion={reduceMotion} />
      </motion.div>
    </div>
  );
}
