'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Layers3,
  Package,
  Pause,
  Play
} from 'lucide-react';
import { useHydratedReducedMotion } from '@/hooks/use-hydrated-reduced-motion';
import { rcentzMenuProducts } from './rcentz-menu-products';

function ProductIllustration({ slug }: { slug: string }) {
  const commerce = ['waffi', 'aj-logik', 'shelsea-commerce'].includes(slug);
  const heading = commerce
    ? 'Discover your next find'
    : slug === 'jobman'
      ? 'Find work. Share your skills.'
      : slug === 'hotel-management'
        ? 'Guest operations'
        : slug === 'real-estate'
          ? 'Your property workspace'
          : 'Your connected workspace';
  return (
    <div
      aria-hidden="true"
      className="rounded-lg border border-border bg-background p-3"
    >
      <div className="mb-3 flex items-center gap-2 border-b border-border pb-2">
        <Layers3 className="size-3.5 text-theme-accent" />
        <span className="text-[10px] font-semibold">{heading}</span>
        <span className="ml-auto h-1 w-7 rounded-full bg-border" />
      </div>
      {commerce ? (
        <div className="grid grid-cols-3 gap-2">
          {['Explore', 'Discover', 'Save'].map((label) => (
            <div key={label} className="rounded-md border border-border p-2">
              <div className="flex h-12 items-center justify-center rounded bg-surface-muted">
                <Package className="size-5 text-muted-foreground" />
              </div>
              <p className="mt-2 text-[9px] font-medium">{label}</p>
              <div className="mt-2 h-1 w-2/3 rounded-full bg-border" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-[1fr_2fr] gap-2">
          <div className="space-y-2 rounded-md bg-surface-subtle p-2">
            {['Overview', 'Activity', 'Records'].map((label) => (
              <p key={label} className="text-[9px] text-muted-foreground">
                {label}
              </p>
            ))}
          </div>
          <div className="space-y-2">
            {(slug === 'jobman'
              ? [
                  'Your professional profile',
                  'Roles & opportunities',
                  'Saved applications'
                ]
              : [
                  'Keep information together',
                  'Follow the latest activity',
                  'Manage your next steps'
                ]
            ).map((label) => (
              <div
                key={label}
                className="rounded-md border border-border px-2 py-2 text-[9px]"
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function RcentzProductsMenu({ onNavigate }: { onNavigate: () => void }) {
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const reducedMotion = useHydratedReducedMotion();
  const product = rcentzMenuProducts[selected];

  useEffect(() => {
    if (paused || interacting || reducedMotion) return;
    const timer = window.setInterval(() => {
      if (!document.hidden)
        setSelected((current) => (current + 1) % rcentzMenuProducts.length);
    }, 4800);
    return () => window.clearInterval(timer);
  }, [paused, interacting, reducedMotion, selected]);

  return (
    <div className="grid gap-5 p-4 sm:grid-cols-[1.1fr_1fr] sm:p-5">
      <section
        aria-label="Product previews"
        aria-roledescription="carousel"
        className="min-w-0"
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') setInteracting(true);
        }}
        onPointerLeave={() => setInteracting(false)}
        onFocusCapture={() => setInteracting(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setInteracting(false);
        }}
      >
        <p className="mb-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Inside the ecosystem
        </p>
        <div className="overflow-hidden rounded-xl border border-border bg-surface-subtle">
          <div
            className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${selected * 100}%)` }}
          >
            {rcentzMenuProducts.map((item, index) => (
              <div
                key={item.slug}
                aria-hidden={selected !== index}
                className="w-full min-w-0 shrink-0 p-3"
              >
                <ProductIllustration slug={item.slug} />
                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{item.name}</p>
                  <span className="text-[9px] capitalize text-muted-foreground">
                    {item.stage}
                  </span>
                </div>
                <p className="mt-2 line-clamp-3 min-h-12 text-xs leading-4 text-muted-foreground">
                  {item.summary}
                </p>
                <Link
                  href={item.href}
                  tabIndex={selected === index ? 0 : -1}
                  onClick={onNavigate}
                  className="mt-2 inline-flex min-h-9 items-center gap-2 text-xs font-medium"
                >
                  Explore {item.name}
                  <ArrowUpRight aria-hidden="true" className="size-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-[9px] text-muted-foreground">
            Interface illustration · {selected + 1}/{rcentzMenuProducts.length}
          </p>
          <div className="flex gap-1">
            <button
              type="button"
              aria-label="Previous product preview"
              onClick={() =>
                setSelected(
                  (current) =>
                    (current + rcentzMenuProducts.length - 1) %
                    rcentzMenuProducts.length
                )
              }
              className="flex size-9 items-center justify-center rounded-md hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <button
              type="button"
              aria-label={
                paused ? 'Play product previews' : 'Pause product previews'
              }
              aria-pressed={paused}
              onClick={() => setPaused((current) => !current)}
              className="flex size-9 items-center justify-center rounded-md hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              {paused ? (
                <Play className="size-3" />
              ) : (
                <Pause className="size-3" />
              )}
            </button>
            <button
              type="button"
              aria-label="Next product preview"
              onClick={() =>
                setSelected(
                  (current) => (current + 1) % rcentzMenuProducts.length
                )
              }
              className="flex size-9 items-center justify-center rounded-md hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
        <p className="sr-only">Current preview: {product.name}</p>
      </section>
      <section aria-label="Rcentz product links" className="min-w-0">
        <p className="mb-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Explore our products
        </p>
        <ul className="grid grid-cols-2 gap-1 sm:grid-cols-1">
          {rcentzMenuProducts.map((item, index) => (
            <li key={item.slug}>
              <Link
                href={item.href}
                onClick={onNavigate}
                onMouseEnter={() => setSelected(index)}
                onFocus={() => setSelected(index)}
                className={[
                  'flex min-h-11 items-center justify-between gap-2 rounded-lg px-2.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  selected === index
                    ? 'bg-surface-muted font-medium'
                    : 'text-muted-foreground hover:bg-surface-subtle hover:text-foreground'
                ].join(' ')}
              >
                {item.name}
                <ArrowUpRight aria-hidden="true" className="size-3 shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="https://products.rcentz.cc"
          onClick={onNavigate}
          className="mt-3 inline-flex min-h-11 items-center gap-2 border-t border-border pt-2 text-xs font-medium"
        >
          All Rcentz products
          <ArrowUpRight className="size-3" />
        </Link>
      </section>
    </div>
  );
}
