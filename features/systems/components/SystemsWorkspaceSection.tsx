'use client';

import { useHydratedReducedMotion } from '@/hooks/use-hydrated-reduced-motion';

import { rcentzTypography } from '@/ui-shell/brand/rcentz-typography';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'motion/react';
import { ProjectOverviewIllustration, WORKSPACE_STORY } from './ProjectOverviewIllustration';

export function SystemsWorkspaceSection() {
  const [selected, setSelected] = useState(0);
  const [revision, setRevision] = useState(0);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);
  const [manualPause, setManualPause] = useState(false);
  const [workspacePrepared, setWorkspacePrepared] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: 0.25 });
  const reducedMotion = Boolean(useHydratedReducedMotion());
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 140, damping: 26 });
  const y = useSpring(pointerY, { stiffness: 140, damping: 26 });
  const paused = pressed || focused || manualPause;
  const story = WORKSPACE_STORY[selected];

  const prepareWorkspace = useCallback(() => {
    setWorkspacePrepared(true);
  }, []);

  const advanceStory = useCallback(() => {
    setSelected(current => (current + 1) % WORKSPACE_STORY.length);
  }, []);



  useEffect(() => {
    const release = () => setPressed(false);
    const reset = () => {
      setPressed(false);
      pointerX.set(0);
      pointerY.set(0);
    };

    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    window.addEventListener('blur', reset);

    return () => {
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
      window.removeEventListener('blur', reset);
    };
  }, [pointerX, pointerY]);

  return (
    <section
      id="how-we-work"
      aria-labelledby="systems-workspace-title"
      className="rcentz-section scroll-mt-24 border-b border-border py-12 sm:py-20">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.7fr] lg:gap-12">
        <div className="lg:pt-3">
          <p className="inline-flex h-fit w-fit self-start items-center gap-2 rounded-full border border-border bg-surface-subtle px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-theme-accent" />
            How we work
          </p>
        </div>
        <div className="min-w-0">
          <h2
            id="systems-workspace-title"
            className={rcentzTypography.className + ' font-bold tracking-normal text-2xl sm:text-3xl lg:text-4xl leading-[1.18]'}>
            <span className="block font-medium text-muted-foreground lg:pl-12">
              Your project, in view.
            </span>
            <span className="mt-2 block font-bold text-foreground">
              From first brief to launch.
            </span>
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 sm:text-base sm:leading-7 text-muted-foreground">
            Follow milestones, review working features and keep decisions
            together in your project workspace.
          </p>
        </div>
      </div>

      <div className="mt-8 grid items-center gap-8 sm:mt-12 lg:grid-cols-[0.8fr_1.7fr] lg:gap-12">
        <div className="min-w-0">
          <div role="group" aria-label="Explore the project story" className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-2">
            {WORKSPACE_STORY.map((item, index) => (
              <button
                key={item.label}
                type="button"
                aria-pressed={selected === index}
                aria-controls="systems-project-workspace"
                onClick={() => {
                  setSelected(index);
                  setRevision(current => current + 1);
                }}
                className={[
                  'flex min-h-11 shrink-0 lg:w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  selected === index
                    ? 'bg-surface-muted font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-surface-subtle'
                ].join(' ')}>
                <span className="font-mono text-[10px] text-muted-foreground">
                  0{index + 1}
                </span>
                {item.label}
                {selected === index ? (
                  <span aria-hidden="true" className="ml-auto size-1.5 rounded-full bg-theme-accent" />
                ) : null}
              </button>
            ))}
          </div>

          <div className="mt-4 lg:min-h-36">
            <h3 className={rcentzTypography.className + ' text-lg sm:text-xl font-medium leading-tight tracking-normal'}>{story.title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{story.description}</p>
          </div>
          <p className="mt-4 text-xs leading-6 text-muted-foreground">
            Three chapters. One connected project experience.
            Use the pause button to read at your own pace.
          </p>
        </div>

        <div
          ref={ref}
          className="min-w-0"
          onPointerMove={event => {
            if (event.pointerType !== 'mouse' || reducedMotion) return;
            const bounds = event.currentTarget.getBoundingClientRect();
            pointerX.set(-((event.clientX - bounds.left) / bounds.width - 0.5) * 12);
            pointerY.set(-((event.clientY - bounds.top) / bounds.height - 0.5) * 8);
          }}
          onPointerLeave={() => {
            setPressed(false);
            pointerX.set(0);
            pointerY.set(0);
          }}
          onPointerDown={event => {
            if (event.button === 0) setPressed(true);
          }}
          onPointerUp={() => setPressed(false)}
          onPointerCancel={() => setPressed(false)}
          onFocusCapture={() => setFocused(true)}
          onBlurCapture={event => {
            if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
          }}>
          <motion.div style={reducedMotion ? undefined : { x, y }}>
            <ProjectOverviewIllustration
              key={selected + "-" + revision}
              onComplete={advanceStory}
              showPreloader={!workspacePrepared}
              onPrepared={prepareWorkspace}
              selected={selected}
              paused={manualPause}
              typingPaused={!visible || (workspacePrepared && paused)}
              onTogglePause={() => {
                setFocused(false);
                setManualPause(current => !current);
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
