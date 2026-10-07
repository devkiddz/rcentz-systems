'use client';

import { useHydratedReducedMotion } from '@/hooks/use-hydrated-reduced-motion';

import { useEffect, useRef, useState } from 'react';


type InlineToolCodeProps = {
  label: string;
  code: string;
  active: boolean;
  delay: number;
};

export function InlineToolCode({
  label,
  code,
  active,
  delay
}: InlineToolCodeProps) {
  const [length, setLength] = useState(0);
  const cursor = useRef(0);
  const started = useRef(false);
  const reducedMotion = Boolean(useHydratedReducedMotion());

  useEffect(() => {
    if (!active || reducedMotion || cursor.current >= code.length) return;

    let interval: number | undefined;

    const timeout = window.setTimeout(() => {
      started.current = true;

      interval = window.setInterval(() => {
        cursor.current = Math.min(code.length, cursor.current + 3);
        setLength(cursor.current);

        if (cursor.current >= code.length) {
          window.clearInterval(interval);
        }
      }, 45);
    }, started.current ? 0 : delay);

    return () => {
      window.clearTimeout(timeout);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [active, code, delay, reducedMotion]);

  const displayed = reducedMotion ? code : code.slice(0, length);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface-raised">
      <p className="border-b border-border px-2 py-1.5 font-mono text-[clamp(7px,1.9cqw,9px)] text-muted-foreground">
        {label}
      </p>
      <pre
        aria-hidden="true"
        className="overflow-hidden whitespace-pre px-2 py-2 font-mono text-[clamp(7px,1.9cqw,9px)] leading-[14px] text-foreground">
        <code>{displayed}</code>
        {!reducedMotion && length < code.length ? (
          <span className="inline-block h-2.5 w-1 bg-theme-accent/50" />
        ) : null}
      </pre>
      <pre className="sr-only"><code>{code}</code></pre>
    </div>
  );
}
