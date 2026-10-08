'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useInView } from 'motion/react';
import { Pause, Play } from 'lucide-react';
import { useHydratedReducedMotion } from '@/hooks/use-hydrated-reduced-motion';
import { SystemsProjectDashboardPreview } from './SystemsProjectDashboardPreview';

export function SystemsProjectPreviewCarousel({ children, header }: { children: ReactNode; header: ReactNode }) {
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const visible = useInView(ref, { amount: 0.2 });
  const reducedMotion = useHydratedReducedMotion();

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const resize = () => setScale(element.clientWidth / 1040);
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || paused || focused || reducedMotion) return;
    const timeout = window.setTimeout(() => setSelected(current => 1 - current), selected === 0 ? 6500 : 8500);
    return () => window.clearTimeout(timeout);
  }, [visible, paused, focused, reducedMotion, selected]);

  return (
    <div ref={ref} role="region" aria-label="Website to project workspace preview" aria-roledescription="carousel"
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div ref={canvas} id="systems-cta-preview" className="relative aspect-[1132/710] overflow-hidden">
        {[<div key="website" className="flex h-[652px] w-[1040px] flex-col" style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>{header}{children}</div>, <SystemsProjectDashboardPreview key="project" />].map((panel, index) => (
          <motion.div key={index} style={{ pointerEvents: selected === index ? 'auto' : 'none' }}
            className="absolute inset-0 min-w-0" aria-hidden={selected !== index} inert={selected !== index}
            initial={false} animate={{ opacity: selected === index ? 1 : 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.65 }}>
            {panel}
          </motion.div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
        <div role="group" aria-label="Choose preview" className="flex gap-1">
          {['Website', 'Project details'].map((label, index) => (
            <button key={label} type="button" aria-pressed={selected === index} aria-controls="systems-cta-preview"
              onClick={() => setSelected(index)}
              className={['min-h-9 rounded-full px-3 text-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', selected === index ? 'bg-surface-muted font-medium' : 'text-muted-foreground'].join(' ')}>{label}</button>
          ))}
        </div>
        <button type="button" aria-label={paused ? 'Play preview carousel' : 'Pause preview carousel'} aria-pressed={paused}
          onClick={() => { setFocused(false); setPaused(current => !current); }}
          className="flex size-9 items-center justify-center rounded-full border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {paused ? <Play aria-hidden="true" className="size-3" /> : <Pause aria-hidden="true" className="size-3" />}
        </button>
      </div>
    </div>
  );
}
