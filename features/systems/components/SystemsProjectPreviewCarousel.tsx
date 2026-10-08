'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useInView } from 'motion/react';
import { Pause, Play } from 'lucide-react';
import { useHydratedReducedMotion } from '@/hooks/use-hydrated-reduced-motion';
import { SystemsProjectDashboardPreview } from './SystemsProjectDashboardPreview';

export function SystemsProjectPreviewCarousel({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: 0.2 });
  const reducedMotion = useHydratedReducedMotion();

  useEffect(() => {
    if (!visible || paused || focused || reducedMotion) return;
    const timeout = window.setTimeout(() => setSelected(current => 1 - current), selected === 0 ? 6500 : 8500);
    return () => window.clearTimeout(timeout);
  }, [visible, paused, focused, reducedMotion, selected]);

  return (
    <div ref={ref} role="region" aria-label="Website to project workspace preview" aria-roledescription="carousel"
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div id="systems-cta-preview" className="grid min-h-[510px] sm:min-h-[480px]">
        {[children, <SystemsProjectDashboardPreview key="project" />].map((panel, index) => (
          <motion.div key={index} style={{ gridArea: '1 / 1', pointerEvents: selected === index ? 'auto' : 'none' }}
            className="min-w-0" aria-hidden={selected !== index} inert={selected !== index}
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
