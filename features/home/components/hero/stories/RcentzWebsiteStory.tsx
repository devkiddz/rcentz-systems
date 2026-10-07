'use client';

import { useHydratedReducedMotion } from '@/hooks/use-hydrated-reduced-motion';



import { useEffect, useState } from 'react';

import { RcentzPerspectiveStage } from '@/features/home/components/hero/perspective/RcentzPerspectiveStage';

const PHASE_COUNT = 5;

/*
 * Initial stillness before anything starts.
 *
 * Visitors first encounter the composition
 * as part of the page, not as an animation.
 */
const INITIAL_WAKE_DELAY = 6500;

/*
 * Once awake, the build progresses calmly.
 */
const PHASE_DURATION = 3200;

export function RcentzWebsiteStory() {
  const [phase, setPhase] = useState(0);

  const [awake, setAwake] = useState(false);

  const reduceMotion = Boolean(useHydratedReducedMotion());

  /*
   * WAKE-UP
   *
   * The page appears and remains calm first.
   * Only later does the system begin building.
   */
  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setAwake(true);
    }, INITIAL_WAKE_DELAY);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [reduceMotion]);

  /*
   * BUILD SEQUENCE
   *
   * Once all phases complete, this effect
   * naturally stops and the final system
   * remains on screen.
   */
  useEffect(() => {
    if (reduceMotion || !awake || phase >= PHASE_COUNT - 1) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setPhase(current => current + 1);
    }, PHASE_DURATION);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [awake, phase, reduceMotion]);

  const visiblePhase = reduceMotion ? PHASE_COUNT - 1 : phase;

  return <RcentzPerspectiveStage phase={visiblePhase} />;
}
