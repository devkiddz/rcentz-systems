'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useInView } from 'motion/react';
import { Pause, Play, Check, ChevronDown, Globe2, Layers3 } from 'lucide-react';
import { useHydratedReducedMotion } from '@/hooks/use-hydrated-reduced-motion';
import { RcentzBrandLogo } from '@/ui-shell/brand/RcentzBrandLogo';
import { RcentzBrandSymbol } from '@/ui-shell/brand/RcentzBrandSymbol';

function ProjectDetailPreview() {
  return (
    <div className="h-full bg-surface-subtle p-3 text-left sm:p-4">
      <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <RcentzBrandSymbol className="size-4 shrink-0" />
          <RcentzBrandLogo className="h-auto w-14 shrink-0" />
          <span className="truncate text-[10px] text-muted-foreground">/ Northstar / RC-2048</span>
        </div>
        <span className="shrink-0 rounded-full border border-border px-2 py-1 text-[9px] text-muted-foreground">Example</span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Project details</p>
          <h3 className="mt-1 text-sm font-semibold sm:text-base">Customer Operations Platform</h3>
        </div>
        <span className="shrink-0 rounded-full bg-surface-muted px-2 py-1 text-[9px]">In development</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {[['Started', '07 Oct 2026'], ['Status', 'Development'], ['Progress', '62%'], ['Target', '18 Nov 2026']].map(([label, value]) => (
          <div key={label} className="min-w-0 rounded-lg border border-border bg-background p-2">
            <p className="text-[8px] text-muted-foreground">{label}</p>
            <p className="mt-1 text-[9px] font-semibold sm:text-[10px]">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden rounded-xl border border-border bg-background p-3 sm:block">
          <p className="text-[10px] font-semibold">Application preview</p>
          <div className="mt-3 rounded-lg border border-border p-3">
            <p className="text-xs font-semibold">Northstar portal</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[['Accounts', '24'], ['Requests', '08']].map(([label, value]) => (
                <div key={label} className="rounded-md bg-surface-muted p-2">
                  <p className="text-[8px] text-muted-foreground">{label}</p>
                  <p className="mt-1 text-lg font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-2 text-[9px] text-muted-foreground">
              <p className="flex items-center gap-1.5"><Check className="size-3" aria-hidden="true" />Company accounts ready</p>
              <p className="flex items-center gap-1.5"><Layers3 className="size-3" aria-hidden="true" />Request workflow in review</p>
            </div>
          </div>
          <p className="mt-3 text-[9px] leading-4 text-muted-foreground">A working preview connected to your delivery records.</p>
        </div>
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-background p-3">
            <h4 className="text-[10px] font-semibold">Project access</h4>
            <p className="mt-1 text-[9px] text-muted-foreground">Live and technical access</p>
            <dl className="mt-3 space-y-2 text-[9px]">
              {[['Domain', 'Preview available'], ['Hosting', 'Vercel'], ['Project ID', 'RC-2048'], ['Repository', 'Connected']].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3"><dt className="text-muted-foreground">{label}</dt><dd className="font-medium">{value}</dd></div>
              ))}
            </dl>
          </div>
          <div className="rounded-xl border border-border bg-background p-3">
            <div className="flex items-center justify-between"><h4 className="text-[10px] font-semibold">Milestone health</h4><span className="text-[9px] text-muted-foreground">2 of 4 complete</span></div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-muted"><div className="h-full w-[62%] rounded-full bg-foreground/75" /></div>
            <p className="mt-2 text-[9px] text-muted-foreground">Next: request workflows and team permissions</p>
          </div>
        </div>
      </div>
      <div className="mt-3 divide-y divide-border rounded-xl border border-border bg-background">
        {['Milestone progress', 'Project scope & agreements', 'Development summary'].map(label => (
          <div key={label} className="flex items-center gap-2 px-3 py-2 text-[9px] font-medium"><ChevronDown aria-hidden="true" className="size-3 text-muted-foreground" />{label}</div>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[9px] leading-4 text-muted-foreground"><Globe2 aria-hidden="true" className="size-3 shrink-0" />Illustrative project data. Your workspace keeps delivery in view.</p>
    </div>
  );
}

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
        {[children, <ProjectDetailPreview key="project" />].map((panel, index) => (
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
