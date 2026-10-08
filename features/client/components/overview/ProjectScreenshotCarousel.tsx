"use client";

import { useState } from "react";
import Image from "next/image";

import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ImageIcon,
  Layers3,
} from "lucide-react";

import type { ClientProject } from "@/features/client/server/projects/get-client-project";

type ProjectScreenshotCarouselProps = {
  screenshots: ClientProject["media"];
  projectName: string;
  projectTagline: string;
  liveUrl?: string | null;
  compact?: boolean;
};

export function ProjectScreenshotCarousel({
  screenshots,
  projectName,
  projectTagline,
  liveUrl,
  compact = false,
}: ProjectScreenshotCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const hasScreenshots = screenshots.length > 0;
  const hasMultipleScreenshots = screenshots.length > 1;

  const activeScreenshot = hasScreenshots ? screenshots[activeIndex] : null;

  function showPrevious() {
    setActiveIndex((currentIndex) => {
      if (currentIndex === 0) {
        return screenshots.length - 1;
      }

      return currentIndex - 1;
    });
  }

  function showNext() {
    setActiveIndex((currentIndex) => {
      if (currentIndex === screenshots.length - 1) {
        return 0;
      }

      return currentIndex + 1;
    });
  }

  return (
    <div>
      <div className="group relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-background">
        {activeScreenshot ? (
          <Image
            fill
            unoptimized
            sizes="(min-width: 1280px) 34vw, 100vw"
            src={activeScreenshot.url}
            alt={
              activeScreenshot.alt ??
              activeScreenshot.caption ??
              `${projectName} project screenshot`
            }
            className="absolute inset-0 size-full object-cover object-top"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <div className="flex max-w-xs flex-col items-center px-6 text-center">
              <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-surface">
                <ImageIcon
                  aria-hidden="true"
                  className="size-5 text-muted-foreground"
                />
              </div>

              <p className="mt-4 text-sm font-semibold text-foreground">
                Project preview
              </p>

              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                Project screenshots will appear here when they are published.
              </p>
            </div>
          </div>
        )}

        {activeScreenshot && !compact ? (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10" />
        ) : null}

        <div className="absolute left-4 top-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-white backdrop-blur-md">
            <Layers3 aria-hidden="true" className="size-3 text-theme-accent" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">
              Rcentz Project
            </span>
          </div>
        </div>

        {hasMultipleScreenshots ? (
          <div className="absolute right-4 top-4 rounded-full border border-white/15 bg-black/45 px-2.5 py-1.5 text-[10px] font-semibold tabular-nums text-white backdrop-blur-md">
            {activeIndex + 1} / {screenshots.length}
          </div>
        ) : null}

        {hasMultipleScreenshots ? (
          <>
            <button
              type="button"
              onClick={showPrevious}
              aria-label="Show previous project screenshot"
              className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md transition hover:bg-black/65"
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
            </button>

            <button
              type="button"
              onClick={showNext}
              aria-label="Show next project screenshot"
              className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md transition hover:bg-black/65"
            >
              <ChevronRight aria-hidden="true" className="size-4" />
            </button>
          </>
        ) : null}

        <div
          className={
            compact
              ? "sr-only"
              : "absolute inset-x-0 bottom-0 px-5 pb-7 sm:px-6 sm:pb-8"
          }
        >
          <div className="max-w-lg">
            <h3 className="text-xl font-semibold tracking-[-0.04em] text-white sm:text-2xl">
              {projectName}
            </h3>

            <p className="mt-2 max-w-md text-xs leading-5 text-white/70 sm:text-sm">
              {projectTagline}
            </p>
          </div>
        </div>
      </div>

      {hasMultipleScreenshots ? (
        <div className="mt-3 flex justify-center gap-1.5">
          {screenshots.map((screenshot, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={screenshot.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show screenshot ${index + 1}`}
                aria-current={isActive ? "true" : undefined}
                className={
                  isActive
                    ? "h-1.5 w-5 rounded-full bg-theme-accent transition-all"
                    : "h-1.5 w-1.5 rounded-full bg-border-strong transition-all hover:bg-muted-foreground"
                }
              />
            );
          })}
        </div>
      ) : null}

      {liveUrl ? (
        <a
          href={liveUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background text-xs font-semibold text-foreground transition-colors hover:bg-surface-muted"
        >
          View Project
          <ExternalLink aria-hidden="true" className="size-3.5" />
        </a>
      ) : null}
    </div>
  );
}
