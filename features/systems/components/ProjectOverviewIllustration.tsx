'use client';

import { useHydratedReducedMotion } from '@/hooks/use-hydrated-reduced-motion';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Circle, FileText, Globe2, Pause, Play } from 'lucide-react';

export const WORKSPACE_STORY = [
  {
    label: 'Plan & agree',
    title: 'Turn your brief into a clear delivery plan.',
    description: 'Review the requirements, agree the scope and see the milestones that will guide your project.',
    status: 'Scope review',
    progress: 25,
    duration: 7000,
    milestone: 'Confirm requirements and delivery scope',
    update: 'Your approval moves the project into development.',
    tasks: ['Business requirements reviewed', 'Delivery scope ready for approval', 'Development begins after approval']
  },
  {
    label: 'Build & review',
    title: 'See the application taking shape.',
    description: 'Follow development, explore the latest preview and give feedback while your system is being built.',
    status: 'Development',
    progress: 62,
    duration: 9000,
    milestone: 'Customer workspace and team workflows',
    update: 'A new preview is ready for your review.',
    tasks: ['Company accounts completed', 'Request workflows in development', 'Team permissions awaiting review']
  },
  {
    label: 'Launch & support',
    title: 'Go live with the work behind you in view.',
    description: 'Review the completed milestones, find your handover records and keep support connected to your project.',
    status: 'Delivered',
    progress: 100,
    duration: 7500,
    milestone: 'Production release and handover',
    update: 'Your application is live. Support stays connected.',
    tasks: ['Production release completed', 'Handover records available', 'Ongoing support connected']
  }
] as const;


type SequenceSlot = {
  text: string;
  start: number;
  end: number;
};

const SequenceContext = createContext<{
  slots: SequenceSlot[];
  elapsed: number;
  reducedMotion: boolean;
}>({ slots: [], elapsed: 0, reducedMotion: false });

function buildSequence(selected: number) {
  const story = WORKSPACE_STORY[selected];
  const texts = [
    'Northstar workspace',
    'Customer application / RC-2048',
    'Your project',
    story.status,
    'Customer workspace',
    '__progress__',
    selected === 2 ? 'All milestones completed' : selected === 1
      ? '2 of 4 milestones completed' : '1 of 4 milestones completed',
    selected === 2 ? 'Latest milestone' : 'Current milestone',
    story.milestone,
    ...story.tasks,
    selected === 0 ? 'Your next decision' : selected === 1
      ? 'Preview & review' : 'Records & support',
    ...(selected === 0 ? [
      'Approve the delivery scope.',
      '<ComputedText text="Review what we are building, the agreed milestones and the responsibilities on both sides." />',
      'Business requirements',
      'Ready',
      'Scope and delivery plan',
      'Ready'
    ] : selected === 1 ? [
      'Application preview',
      'Northstar portal',
      'Accounts',
      '24',
      'Requests',
      '08',
      'Company access / Request tracking',
      '<ComputedText text="Explore completed features and share feedback before the next milestone." />'
    ] : [
      'Production application live',
      'Application handover',
      'Available',
      'Release record',
      'Available',
      'Support workspace',
      'Available',
      '<ComputedText text="Keep delivery records, support requests and future improvements together." />'
    ]),
    story.update
  ];

  let end = 0;
  return texts.map(text => {
    const start = end + 180;
    end = start + (text === '__progress__' ? 1400 : Math.max(240, text.length * 22));
    return { text, start, end };
  });
}

function ComputedText({
  text,
  occurrence = 0
}: {
  text: string;
  occurrence?: number;
}) {
  const { slots, elapsed, reducedMotion } = useContext(SequenceContext);
  const slot = slots.filter(item => item.text === text)[occurrence];
  const progress = reducedMotion || !slot
    ? 1
    : Math.max(0, Math.min(1, (elapsed - slot.start) / (slot.end - slot.start)));
  const length = Math.floor(text.length * progress);

  return (
    <span className="relative block">
      <span aria-hidden="true" className="invisible block">{text}</span>
      <span aria-hidden="true" className="absolute inset-0">
        {text.slice(0, length)}
        {progress > 0 && progress < 1 ? (
          <span className="ml-0.5 inline-block h-3 w-px bg-theme-accent align-middle" />
        ) : null}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}

function SequenceRow({
  text,
  children,
  className,
  as = 'div'
}: {
  text: string;
  children: ReactNode;
  className: string;
  as?: 'div' | 'li';
}) {
  const { slots, elapsed, reducedMotion } = useContext(SequenceContext);
  const slot = slots.find(item => item.text === text);
  const progress = reducedMotion || !slot
    ? 1
    : Math.max(0, Math.min(1, (elapsed - slot.start) / 280));
  const eased = 1 - Math.pow(1 - progress, 3);
  const Tag = as;

  return (
    <Tag
      className={className}
      style={{
        opacity: eased,
        visibility: progress === 0 ? 'hidden' : 'visible',
        transform: 'translateY(' + ((1 - eased) * 10) + 'px)'
      }}>
      {children}
    </Tag>
  );
}

function ProgressRing({ progress }: { progress: number }) {
  const { slots, elapsed, reducedMotion } = useContext(SequenceContext);
  const slot = slots.find(item => item.text === '__progress__');
  const fraction = reducedMotion || !slot ? 1
    : Math.max(0, Math.min(1, (elapsed - slot.start) / (slot.end - slot.start)));
  const displayed = Math.round(progress * fraction);

  return (
    <div
      role="img"
      aria-label={progress + '% example project progress'}
      className="relative flex size-20 shrink-0 items-center justify-center rounded-full"
      style={{
        background: 'conic-gradient(var(--theme-accent) ' + displayed + '%, var(--border) 0)'
      }}>
      <div className="absolute inset-1 rounded-full bg-surface-raised" />
      <span className="relative text-xl font-semibold">{displayed}%</span>
    </div>
  );
}

export function ProjectOverviewIllustration({
  selected,
  paused,
  onTogglePause,
  typingPaused,
  onComplete,
  showPreloader,
  onPrepared
}: {
  selected: number;
  paused: boolean;
  onTogglePause: () => void;
  typingPaused: boolean;
  onComplete: () => void;
  showPreloader: boolean;
  onPrepared: () => void;
}) {
  const story = WORKSPACE_STORY[selected];
  const reducedMotion = Boolean(useHydratedReducedMotion());
  const [elapsed, setElapsed] = useState(0);
  const completed = useRef(false);
  const loadingClock = useRef(1200);
  const track = useRef<HTMLDivElement>(null);
  const scrollPhase = useRef(-1);
  const loading = showPreloader && !reducedMotion;
  const slots = buildSequence(selected);

  useEffect(() => {
    if (!showPreloader) return;

    if (reducedMotion) {
      onPrepared();
      return;
    }

    if (typingPaused) return;

    const started = performance.now();
    const timeout = window.setTimeout(onPrepared, loadingClock.current);

    return () => {
      window.clearTimeout(timeout);
      loadingClock.current = Math.max(
        0,
        loadingClock.current - (performance.now() - started)
      );
    };
  }, [showPreloader, typingPaused, reducedMotion, onPrepared]);
  const finishAt = slots[slots.length - 1].end + 3000;
  const secondPanelTitle = selected === 0 ? 'Your next decision'
    : selected === 1 ? 'Preview & review' : 'Records & support';
  const secondPanelStart = slots.find(item => item.text === secondPanelTitle)?.start ?? 0;

  useEffect(() => {
    if (typingPaused || !window.matchMedia('(max-width: 639px)').matches) return;

    const phase = reducedMotion ? 0 : elapsed >= secondPanelStart - 400 ? 1 : 0;
    if (scrollPhase.current === phase) return;

    const element = track.current;
    const first = element?.children[0] as HTMLElement | undefined;
    const second = element?.children[1] as HTMLElement | undefined;
    if (!element || !first || !second) return;

    scrollPhase.current = phase;
    element.scrollTo({
      left: phase === 0 ? 0 : second.offsetLeft - first.offsetLeft,
      behavior: reducedMotion || phase === 0 ? 'auto' : 'smooth'
    });
  }, [elapsed, secondPanelStart, typingPaused, reducedMotion]);

  useEffect(() => {
    if (loading || typingPaused || reducedMotion || elapsed >= finishAt) return;

    const interval = window.setInterval(() => {
      setElapsed(current => Math.min(finishAt, current + 40));
    }, 40);

    return () => window.clearInterval(interval);
  }, [loading, typingPaused, reducedMotion, finishAt, elapsed]);

  useEffect(() => {
    if (loading || typingPaused || reducedMotion || elapsed < finishAt || completed.current) return;
    completed.current = true;
    onComplete();
  }, [loading, elapsed, finishAt, typingPaused, reducedMotion, onComplete]);

  return (
    <SequenceContext.Provider value={{ slots, elapsed, reducedMotion }}>
    <div
      id="systems-project-workspace"
      aria-busy={loading}
      className="relative overflow-hidden rounded-2xl border border-border-strong bg-surface-subtle">
      {loading ? (
        <div
          role="status"
          aria-label="Preparing example workspace"
          className="absolute inset-0 z-10 overflow-hidden bg-surface-subtle">
          <span className="sr-only">Preparing example workspace</span>

          <div aria-hidden="true" className="h-full">
            <div className="flex items-center gap-3 border-b border-border bg-background px-4 py-4 sm:px-5">
              <div className="size-8 shrink-0 rounded-lg bg-surface-muted" />
              <div className="space-y-2">
                <div className="h-3.5 w-36 rounded-md bg-surface-muted" />
                <div className="h-2.5 w-44 rounded-md bg-surface-muted" />
              </div>
            </div>

            <div className="flex h-[360px] gap-3 overflow-hidden p-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:p-4">
              {[0, 1].map(panel => (
                <div
                  key={panel}
                  className="w-[88%] min-w-0 shrink-0 rounded-xl border border-border bg-surface-raised p-4 sm:w-auto">
                  <div className="h-3 w-28 rounded-md bg-surface-muted" />

                  {panel === 0 ? (
                    <div className="mt-5 flex items-center gap-4">
                      <div className="size-20 shrink-0 rounded-full border-[5px] border-border" />
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="h-3 w-4/5 rounded-md bg-surface-muted" />
                        <div className="h-2.5 w-3/5 rounded-md bg-surface-muted" />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 space-y-3">
                      <div className="h-4 w-4/5 rounded-md bg-surface-muted" />
                      <div className="h-2.5 w-full rounded-md bg-surface-muted" />
                      <div className="h-2.5 w-3/4 rounded-md bg-surface-muted" />
                    </div>
                  )}

                  <div className="mt-6 space-y-3">
                    {[0, 1, 2].map(row => (
                      <div key={row} className="flex items-center gap-3 rounded-lg bg-surface-subtle px-3 py-3">
                        <div className="size-3 shrink-0 rounded bg-surface-muted" />
                        <div
                          className="h-2.5 rounded-md bg-surface-muted"
                          style={{ width: row === 1 ? '58%' : '76%' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <div className="h-2.5 w-3/5 rounded-md bg-surface-muted" />
              <div className="size-10 rounded-full border border-border" />
            </div>
          </div>

          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-1/2"
            style={{
              background: 'linear-gradient(90deg, transparent, var(--foreground), transparent)',
              opacity: 0.035
            }}
            animate={{ x: typingPaused ? '-100%' : ['-100%', '220%'] }}
            transition={{
              duration: 2.4,
              repeat: typingPaused ? 0 : Infinity,
              ease: 'linear'
            }}
          />
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-3 border-b border-border bg-background px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-sm font-semibold text-background">
            N
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold"><ComputedText text="Northstar workspace" /></p>
            <p className="text-xs text-muted-foreground"><ComputedText text="Customer application / RC-2048" /></p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-border px-2 py-1 text-[10px] text-muted-foreground">
          Example
        </span>
      </div>

      <div className="relative h-[360px]">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            ref={track}
            key={selected}
            initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : -6 }}
            transition={{ duration: reducedMotion ? 0 : 0.3 }}
            className="absolute inset-0 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain p-3 [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:p-4 [&::-webkit-scrollbar]:hidden">
            <section className="w-[88%] min-w-0 shrink-0 snap-start rounded-xl border border-border bg-surface-raised p-4 sm:w-auto">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold"><ComputedText text="Your project" /></h3>
                <span className="rounded-full bg-surface-muted px-2 py-1 text-[10px] font-medium">
                  <ComputedText text={story.status} />
                </span>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <ProgressRing progress={story.progress} />
                <div className="min-w-0">
                  <p className="text-base font-semibold"><ComputedText text="Customer workspace" /></p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    <ComputedText text={selected === 2 ? 'All milestones completed' : selected === 1 ? '2 of 4 milestones completed' : '1 of 4 milestones completed'} />
                  </p>
                </div>
              </div>

              <p className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground">
                <ComputedText text={selected === 2 ? 'Latest milestone' : 'Current milestone'} />
              </p>
              <p className="mt-1 text-sm font-medium leading-5"><ComputedText key={story.milestone} text={story.milestone} /></p>

              <ul className="mt-3 space-y-2">
                {story.tasks.map((task, index) => (
                  <SequenceRow as="li" key={task} text={task} className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                    {selected === 2 || index === 0
                      ? <Check aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-theme-accent" />
                      : <Circle aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />}
                    <ComputedText text={task} />
                  </SequenceRow>
                ))}
              </ul>
            </section>

            <section className="w-[88%] min-w-0 shrink-0 snap-start rounded-xl border border-border bg-surface-raised p-4 sm:w-auto">
              <h3 className="text-sm font-semibold">
                <ComputedText text={selected === 0 ? 'Your next decision' : selected === 1 ? 'Preview & review' : 'Records & support'} />
              </h3>

              {selected === 0 ? (
                <>
                  <p className="mt-4 text-base font-semibold"><ComputedText text="Approve the delivery scope." /></p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Review what we are building, the agreed milestones and the responsibilities on both sides.
                  </p>
                  <div className="mt-4 space-y-3">
                    {['Business requirements', 'Scope and delivery plan'].map((label, index) => (
                      <SequenceRow key={label} text={label} className="flex items-center gap-2 rounded-lg bg-surface-subtle px-3 py-2.5">
                        <FileText aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                        <span className="text-xs font-medium"><ComputedText text={label} /></span>
                        <span className="ml-auto text-[10px] text-muted-foreground"><ComputedText text="Ready" occurrence={index} /></span>
                      </SequenceRow>
                    ))}
                  </div>
                </>
              ) : selected === 1 ? (
                <>
                  <div className="mt-4 overflow-hidden rounded-lg border border-border">
                    <div className="flex items-center gap-2 bg-surface-subtle px-3 py-2 text-[10px] text-muted-foreground">
                      <Globe2 aria-hidden="true" className="size-3" />
                      <ComputedText text="Application preview" />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold"><ComputedText text="Northstar portal" /></p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="rounded-md bg-surface-muted p-2">
                          <p className="text-[10px] text-muted-foreground"><ComputedText text="Accounts" /></p>
                          <p className="mt-1 text-lg font-semibold"><ComputedText text="24" /></p>
                        </div>
                        <div className="rounded-md bg-surface-muted p-2">
                          <p className="text-[10px] text-muted-foreground"><ComputedText text="Requests" /></p>
                          <p className="mt-1 text-lg font-semibold"><ComputedText text="08" /></p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground"><ComputedText text="Company access / Request tracking" /></p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    Explore completed features and share feedback before the next milestone.
                  </p>
                </>
              ) : (
                <>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium">
                    <span aria-hidden="true" className="size-2 rounded-full bg-theme-accent" />
                    <ComputedText text="Production application live" />
                  </div>
                  <div className="mt-4 space-y-3">
                    {['Application handover', 'Release record', 'Support workspace'].map((label, index) => (
                      <SequenceRow key={label} text={label} className="flex items-center gap-2 rounded-lg bg-surface-subtle px-3 py-2.5">
                        <Check aria-hidden="true" className="size-4 shrink-0 text-theme-accent" />
                        <span className="text-xs font-medium"><ComputedText text={label} /></span>
                        <span className="ml-auto text-[10px] text-muted-foreground"><ComputedText text="Available" occurrence={index} /></span>
                      </SequenceRow>
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    Keep delivery records, support requests and future improvements together.
                  </p>
                </>
              )}
            </section>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
        <p className="min-w-0 flex-1 text-xs leading-5 text-muted-foreground"><ComputedText key={story.update} text={story.update} /></p>
        <button
          type="button"
          onClick={onTogglePause}
          aria-label={paused ? 'Resume project story' : 'Pause project story'}
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {paused
            ? <Play aria-hidden="true" className="size-3.5" />
            : <Pause aria-hidden="true" className="size-3.5" />}
        </button>
      </div>
    </div>
    </SequenceContext.Provider>
  );
}
