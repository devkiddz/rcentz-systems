'use client';

import { GlobeSphere } from './GlobeSphere';

import {
  Boxes,
  BriefcaseBusiness,
  Layers3,
  ShoppingBag
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

const PRODUCT_NODES = [
  {
    label: 'Commerce',
    meta: 'Transactions',
    icon: ShoppingBag,
    desktopLeft: '16%',
    desktopTop: '17%',
    mobileLeft: '25%',
    mobileTop: '24%'
  },
  {
    label: 'Projects',
    meta: 'Operations',
    icon: Layers3,
    desktopLeft: '84%',
    desktopTop: '17%',
    mobileLeft: '75%',
    mobileTop: '24%'
  },
  {
    label: 'Services',
    meta: 'Business',
    icon: BriefcaseBusiness,
    desktopLeft: '16%',
    desktopTop: '77%',
    mobileLeft: '25%',
    mobileTop: '76%'
  },
  {
    label: 'Platforms',
    meta: 'Products',
    icon: Boxes,
    desktopLeft: '84%',
    desktopTop: '77%',
    mobileLeft: '75%',
    mobileTop: '76%'
  }
] as const;

const FIRST_CARD_DELAY = 900;
const CARD_RELEASE_DELAY = 2100;

type GlobeCardProps = {
  node: (typeof PRODUCT_NODES)[number];
  index: number;
  visibleActiveNode: number;
  reduceMotion: boolean;
  mobile?: boolean;
};

function ProductCard({
  node,
  index,
  visibleActiveNode,
  reduceMotion,
  mobile = false
}: GlobeCardProps) {
  const Icon = node.icon;
  const visible = index <= visibleActiveNode;
  const current = index === visibleActiveNode;

  const finalLeft = mobile ? node.mobileLeft : node.desktopLeft;
  const finalTop = mobile ? node.mobileTop : node.desktopTop;

  return (
    <motion.div
      initial={false}
      animate={{
        left: visible ? finalLeft : '50%',
        top: visible ? finalTop : '50%',
        opacity: visible ? 1 : 0,
        scale: current ? 1.04 : visible ? 1 : 0.3
      }}
      transition={{
        left: {
          duration: 1.3,
          ease: [0.22, 1, 0.36, 1]
        },
        top: {
          duration: 1.3,
          ease: [0.22, 1, 0.36, 1]
        },
        opacity: {
          duration: 0.55
        },
        scale: {
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1]
        }
      }}
      className="absolute z-40 -translate-x-1/2 -translate-y-1/2">
      <div
        className={[
          'relative',
          'flex items-center gap-2.5',
          'rounded-xl',
          'border',
          current ? 'border-theme-accent/40' : 'border-border',
          'bg-background/92',
          'shadow-xl',
          'backdrop-blur-2xl',
          mobile
            ? 'w-[44vw] min-w-[138px] max-w-[168px] px-3 py-2.5'
            : 'min-w-[158px] gap-3 px-3.5 py-3'
        ].join(' ')}>
        <motion.span
          animate={
            current && !reduceMotion
              ? {
                  scale: [0.8, 1.4, 0.8],
                  opacity: [0.4, 1, 0.4]
                }
              : undefined
          }
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute -bottom-[5px] left-1/2 size-2 -translate-x-1/2 rounded-full bg-theme-accent shadow-[0_0_16px_var(--theme-accent)]"
        />

        <span
          className={[
            'flex shrink-0 items-center justify-center rounded-lg bg-theme-accent-soft',
            mobile ? 'size-8' : 'size-9'
          ].join(' ')}>
          <Icon className={mobile ? 'size-3.5 text-theme-accent' : 'size-4 text-theme-accent'} />
        </span>

        <div className="min-w-0">
          <p className={mobile ? 'truncate text-[9px] font-medium' : 'text-[10px] font-medium'}>{node.label}</p>
          <p
            className={[
              'mt-1 truncate font-mono uppercase tracking-[0.11em] text-muted',
              mobile ? 'text-[5px]' : 'text-[6px]'
            ].join(' ')}>
            {node.meta}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function RcentzGlobeStory() {
  const [activeNode, setActiveNode] = useState(-1);
  const reduceMotion = Boolean(useReducedMotion());

  useEffect(() => {
    if (reduceMotion || activeNode >= PRODUCT_NODES.length - 1) {
      return;
    }

    const timeout = window.setTimeout(
      () => {
        setActiveNode(current => current + 1);
      },
      activeNode === -1 ? FIRST_CARD_DELAY : CARD_RELEASE_DELAY
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [activeNode, reduceMotion]);

  const visibleActiveNode = reduceMotion ? PRODUCT_NODES.length - 1 : activeNode;

  return (
    <div className="relative min-h-[720px] overflow-visible lg:min-h-[390px]">
      {/* =====================================================
          GLOBE
          Mobile owns the screen; desktop keeps current scale.
          ===================================================== */}

      <div
        className={[
          'absolute',
          'left-1/2 top-[50%]',
          'aspect-square',
          'w-[112vw] max-w-[420px]',
          '-translate-x-1/2 -translate-y-1/2',
          'lg:top-1/2',
          'lg:size-[450px]',
          'lg:max-w-none'
        ].join(' ')}>
        {/* AMBIENT LIGHT */}
        <div
          aria-hidden="true"
          className="absolute inset-[7%] rounded-full bg-theme-accent-faint blur-[80px]"
        />

        {/* SPHERE */}
        <div className="absolute inset-0 overflow-hidden rounded-full border border-theme-accent/18">
          <GlobeSphere />

          <svg
            aria-hidden="true"
            viewBox="0 0 520 520"
            className="absolute inset-0 size-full text-theme-accent">
            <ellipse
              cx="260"
              cy="260"
              rx="225"
              ry="62"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.7"
              opacity="0.14"
            />
            <ellipse
              cx="260"
              cy="260"
              rx="225"
              ry="132"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.7"
              opacity="0.1"
            />
            <ellipse
              cx="260"
              cy="260"
              rx="82"
              ry="225"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.7"
              opacity="0.12"
            />
            <ellipse
              cx="260"
              cy="260"
              rx="148"
              ry="225"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.7"
              opacity="0.08"
            />
          </svg>

          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,transparent_28%,var(--background)_122%)] opacity-30" />
        </div>

        {/* HORIZONTAL ORBIT */}
        <motion.div
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute left-1/2 top-1/2 h-[48%] w-[113%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-theme-accent/20">
          <span className="absolute right-[8%] top-[7%] size-2.5 rounded-full bg-theme-accent shadow-[0_0_24px_var(--theme-accent)]" />
        </motion.div>

        {/* VERTICAL ORBIT */}
        <motion.div
          animate={reduceMotion ? undefined : { rotate: -360 }}
          transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
          className="absolute left-1/2 top-1/2 h-[108%] w-[44%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-theme-accent/14"
        />
      </div>

      {/* =====================================================
          RCENTZ CORE
          ===================================================== */}

      <div className="absolute left-1/2 top-[50%] z-30 -translate-x-1/2 -translate-y-1/2 lg:top-1/2">
        <motion.div
          animate={reduceMotion ? undefined : { scale: [1, 1.035, 1] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex size-[118px] flex-col items-center justify-center rounded-full border border-transparent bg-transparent sm:size-[124px] lg:size-[132px]">
          <motion.span
            animate={
              reduceMotion
                ? undefined
                : {
                    scale: [0.92, 1.18, 0.92],
                    opacity: [0.1, 0.42, 0.1]
                  }
            }
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-[-13px] rounded-full border border-theme-accent/22"
          />

          <div className="relative flex flex-col items-center">
            <p className="bg-gradient-to-r from-foreground via-theme-accent to-theme-accent-strong bg-clip-text text-[13px] font-semibold leading-none tracking-[-0.035em] text-transparent lg:text-[14px]">
              Rcentz Core
            </p>

            <p className="mt-1 font-mono text-[5px] uppercase leading-none tracking-[0.13em] text-muted lg:text-[6px]">
              One foundation
            </p>

            <div className="mt-2 flex items-center gap-1.5">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-theme-accent opacity-30" />
                <span className="relative inline-flex size-1.5 rounded-full bg-theme-accent" />
              </span>

              <span className="font-mono text-[5px] uppercase leading-none tracking-[0.1em] text-muted lg:text-[6px]">
                ecosystem active
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* =====================================================
          MOBILE PRODUCT RELEASES
          Each card leaves the exact Core center and settles.
          ===================================================== */}

      <div className="absolute inset-0 lg:hidden">
        {PRODUCT_NODES.map((node, index) => (
          <ProductCard
            key={node.label}
            node={node}
            index={index}
            visibleActiveNode={visibleActiveNode}
            reduceMotion={reduceMotion}
            mobile
          />
        ))}
      </div>

      {/* =====================================================
          DESKTOP PRODUCT RELEASES — CURRENT POSITIONS
          ===================================================== */}

      <div className="absolute inset-0 hidden lg:block">
        {PRODUCT_NODES.map((node, index) => (
          <ProductCard
            key={node.label}
            node={node}
            index={index}
            visibleActiveNode={visibleActiveNode}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>

      {/* MOBILE CORE AXIS */}
      <div
        aria-hidden="true"
        className="absolute bottom-[17%] left-1/2 top-[17%] z-10 w-px -translate-x-1/2 bg-theme-accent/10 lg:hidden">
        {!reduceMotion ? (
          <motion.span
            animate={{ top: ['10%', '90%'], opacity: [0, 0.8, 0] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'linear' }}
            className="absolute left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-theme-accent shadow-[0_0_12px_var(--theme-accent)]"
          />
        ) : null}
      </div>

      {/* =====================================================
          CONCLUSION
          ===================================================== */}

      {visibleActiveNode === PRODUCT_NODES.length - 1 ? (
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.25, duration: 0.7 }}
          className="absolute bottom-[2%] left-1/2 z-50 -translate-x-1/2 text-center lg:bottom-[1%]">
          <p className="font-mono text-[6px] uppercase tracking-[0.16em] text-muted">Rcentz ecosystem</p>
          <p className="mt-1 text-[9px] font-medium text-theme-accent">All systems connected.</p>
        </motion.div>
      ) : null}
    </div>
  );
}
