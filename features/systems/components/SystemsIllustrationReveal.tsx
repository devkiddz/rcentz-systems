'use client';

import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef, useSyncExternalStore, type ReactNode } from 'react';

type SystemsIllustrationRevealProps = {
  children: ReactNode;
  className?: string;
  index: number;
};

function subscribeDesktop(onChange: () => void) {
  const query = window.matchMedia('(min-width: 1024px)');
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function getDesktopSnapshot() {
  return window.matchMedia('(min-width: 1024px)').matches;
}

function getServerSnapshot() {
  return false;
}

export function SystemsIllustrationReveal({
  children,
  className,
  index
}: SystemsIllustrationRevealProps) {
  const element = useRef<HTMLDivElement>(null);
  const desktop = useSyncExternalStore(
    subscribeDesktop,
    getDesktopSnapshot,
    getServerSnapshot
  );
  const visible = useInView(element, { once: true, amount: 0.15 });
  const reducedMotion = Boolean(useReducedMotion());
  const revealEnabled = desktop && !reducedMotion;

  return (
    <motion.div
      ref={element}
      className={['rcentz-illustration-column', className].filter(Boolean).join(' ')}
      initial={false}
      animate={!revealEnabled || visible ? 'visible' : 'hidden'}
      whileHover={!reducedMotion && (!desktop || visible) ? 'hover' : undefined}
      variants={{
        hidden: {
          opacity: 0,
          y: 24,
          filter: 'blur(4px) brightness(1)',
          transition: { duration: 0 }
        },
        visible: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px) brightness(1)',
          transition: {
            duration: revealEnabled ? 0.8 : 0,
            delay: revealEnabled ? index * 0.09 : 0,
            ease: [0.22, 1, 0.36, 1]
          }
        },
        hover: {
          y: -6,
          filter: 'blur(0px) brightness(1.08)',
          transition: {
            duration: 0.25,
            ease: [0.22, 1, 0.36, 1]
          }
        }
      }}>
      {children}
    </motion.div>
  );
}
