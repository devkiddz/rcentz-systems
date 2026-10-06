'use client';

import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef, type ReactNode } from 'react';

type SystemsIllustrationRevealProps = {
  children: ReactNode;
  className?: string;
  index: number;
};

export function SystemsIllustrationReveal({
  children,
  className,
  index,
}: SystemsIllustrationRevealProps) {
  const element = useRef<HTMLDivElement>(null);
  const visible = useInView(element, { once: true, amount: 0.15 });
  const reducedMotion = Boolean(useReducedMotion());

  return (
    <motion.div
      ref={element}
      className={['rcentz-illustration-column', className].filter(Boolean).join(' ')}
      initial={reducedMotion ? false : 'hidden'}
      animate={reducedMotion || visible ? 'visible' : 'hidden'}
      whileHover={visible && !reducedMotion ? 'hover' : undefined}
      variants={{
        hidden: {
          opacity: 0,
          y: 24,
          filter: 'blur(4px) brightness(1)',
        },
        visible: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px) brightness(1)',
          transition: {
            duration: reducedMotion ? 0 : 0.8,
            delay: reducedMotion ? 0 : index * 0.09,
            ease: [0.22, 1, 0.36, 1],
          },
        },
        hover: {
          y: -6,
          filter: 'blur(0px) brightness(1.08)',
          transition: {
            duration: 0.25,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}>
      {children}
    </motion.div>
  );
}
