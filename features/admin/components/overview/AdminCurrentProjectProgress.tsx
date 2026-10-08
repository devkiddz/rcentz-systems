'use client';

import { useState } from 'react';

import Link from 'next/link';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import { ArrowLeft, ArrowRight, CircleDot } from 'lucide-react';

import type { ActiveProjectMonitor } from '@/features/admin/server/overview/get-active-project-monitors';

import { ProjectMonitorCard } from '@/features/dashboard/components/projects/ProjectMonitorCard';

type AdminCurrentProjectProgressProps = {
  projects: ActiveProjectMonitor[];
};

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split('_')
    .map(statusPart => statusPart.charAt(0).toUpperCase() + statusPart.slice(1))
    .join(' ');
}

export function AdminCurrentProjectProgress({ projects }: AdminCurrentProjectProgressProps) {
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);

  const [slideDirection, setSlideDirection] = useState(1);

  const reduceMotion = useReducedMotion();

  if (projects.length === 0) {
    return (
      <section className="flex min-h-[460px] items-center justify-center rounded-[18px] border border-border bg-background">
        <div className="text-center">
          <CircleDot aria-hidden="true" className="mx-auto size-5 text-theme-accent" />

          <p className="mt-3 text-sm font-medium text-foreground">No active projects</p>

          <p className="mt-1 text-[11px] text-muted">Active project monitoring will appear here.</p>
        </div>
      </section>
    );
  }

  const safeProjectIndex = Math.min(activeProjectIndex, projects.length - 1);

  const currentProject = projects[safeProjectIndex];

  const hasMultipleProjects = projects.length > 1;

  function showPreviousProject() {
    setSlideDirection(-1);

    setActiveProjectIndex(currentIndex => (currentIndex === 0 ? projects.length - 1 : currentIndex - 1));
  }

  function showNextProject() {
    setSlideDirection(1);

    setActiveProjectIndex(currentIndex => (currentIndex === projects.length - 1 ? 0 : currentIndex + 1));
  }

  return (
    <section className="flex max-h-[920px] min-h-[760px] flex-col overflow-hidden rounded-[18px] border border-border bg-background">
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold tracking-[-0.025em] text-foreground">
              {currentProject.name}
            </p>

            <span className="rounded-full bg-theme-accent-faint px-2 py-0.5 text-[9px] font-medium text-theme-accent">
              {formatStatus(currentProject.status)}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-2">
            <span className="text-[10px] text-muted">Active project health monitor</span>

            <span className="size-1 rounded-full bg-border" />

            <span className="text-[10px] font-medium text-foreground">{projects.length} active</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center rounded-xl border border-border bg-surface-raised p-0.5">
            <button
              type="button"
              onClick={showPreviousProject}
              disabled={!hasMultipleProjects}
              aria-label="Previous active project"
              className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-foreground disabled:cursor-default disabled:opacity-35">
              <ArrowLeft aria-hidden="true" className="size-3.5" />
            </button>

            <span className="min-w-12 px-1 text-center text-[9px] font-medium tabular-nums text-muted">
              {safeProjectIndex + 1}
              {' / '}
              {projects.length}
            </span>

            <button
              type="button"
              onClick={showNextProject}
              disabled={!hasMultipleProjects}
              aria-label="Next active project"
              className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-foreground disabled:cursor-default disabled:opacity-35">
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </button>
          </div>

          <Link
            href={`/admin/projects/${currentProject.id}`}
            className="flex items-center gap-1 text-[10px] text-muted transition-colors hover:text-foreground">
            Open
            <ArrowRight aria-hidden="true" className="size-3" />
          </Link>
        </div>
      </div>

      <div className="min-h-0 max-h-[700px] flex-1 overflow-y-auto p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentProject.id}
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    x: slideDirection > 0 ? 22 : -22
                  }
            }
            animate={{
              opacity: 1,
              x: 0
            }}
            exit={
              reduceMotion
                ? {
                    opacity: 1,
                    x: 0
                  }
                : {
                    opacity: 0,
                    x: slideDirection > 0 ? -22 : 22
                  }
            }
            transition={{
              duration: reduceMotion ? 0 : 0.2,

              ease: 'easeOut'
            }}>
            <ProjectMonitorCard project={currentProject} />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
