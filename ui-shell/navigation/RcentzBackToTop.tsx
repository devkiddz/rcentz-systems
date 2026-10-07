'use client';

import { useEffect, useState } from 'react';

import { ArrowUp } from 'lucide-react';

export function RcentzBackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 520);
    }

    handleScroll();

    window.addEventListener('scroll', handleScroll, {
      passive: true
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  function handleBackToTop() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? 'auto' : 'smooth'
    });
  }

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={handleBackToTop}
      className={[
        'fixed',
        'z-40',
        'hidden md:flex',
        'size-11',
        'items-center',
        'justify-center',
        'rounded-full',
        'border',
        'border-border/80',
        'bg-background/90',
        'text-muted',

        'backdrop-blur-xl',
        'transition-[opacity,transform,background-color,color,border-color]',
        'duration-300',
        'hover:border-border-strong',
        'hover:bg-surface-raised',
        'hover:text-foreground',

        'bottom-4',
        'right-3',
        'sm:right-4',
        'md:bottom-6',
        'md:right-6',
        visible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0'
      ].join(' ')}>
      <ArrowUp aria-hidden="true" className="size-4" />
    </button>
  );
}
