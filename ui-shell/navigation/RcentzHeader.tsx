'use client';

import { RcentzBrandLogo } from '../brand/RcentzBrandLogo';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { RcentzGithubIcon } from '../brand/RcentzGithubIcon';
import { useEffect, useRef, useState } from 'react';

import { RcentzThemeControl } from '../theme/RcentzThemeControl';
import { RcentzLanguageControl } from './RcentzLanguageControl';
import { RcentzNavigation } from './RcentzNavigation';
import { RcentzStartProjectAction } from './RcentzStartProjectAction';

export function RcentzHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 24);
    const frame = requestAnimationFrame(updateScroll);
    window.addEventListener('scroll', updateScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateScroll);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        menuButton.current?.focus();
      }
    }

    const desktop = window.matchMedia('(min-width: 1024px)');
    function handleResize() {
      if (desktop.matches) setMobileOpen(false);
    }

    document.addEventListener('keydown', handleKey);
    desktop.addEventListener('change', handleResize);

    return () => {
      document.removeEventListener('keydown', handleKey);
      desktop.removeEventListener('change', handleResize);
    };
  }, [mobileOpen]);

  function closeMobileNavigation() {
    setMobileOpen(false);
  }

  return (
    <>
      <div aria-hidden="true" className="h-16" />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-[var(--content-max)] px-[var(--content-gutter)]">
          <div
            className={[
              'flex items-center justify-between gap-4 transition-[height] duration-200 motion-reduce:transition-none',
              scrolled ? 'h-14' : 'h-16',
            ].join(' ')}>
            <Link
              href="/"
              onClick={closeMobileNavigation}
              aria-label="Rcentz Systems home"
              className="flex shrink-0 items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <RcentzBrandLogo className="h-auto w-20 shrink-0 sm:w-24" />
            </Link>

            <div className="hidden min-w-0 flex-1 lg:block">
              <RcentzNavigation />
            </div>

            <div className="hidden shrink-0 items-center gap-3 lg:flex">
              <a
                href="https://github.com/devkiddz/rcentz-systems"
                aria-label="Rcentz Systems on GitHub"
                className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <RcentzGithubIcon aria-hidden="true" className="size-4" />
              </a>
              <RcentzLanguageControl />
              <RcentzThemeControl />
              <RcentzStartProjectAction compact={scrolled} />
            </div>

            <div className="flex shrink-0 items-center gap-1 lg:hidden">
              <RcentzLanguageControl />
              <button
                ref={menuButton}
                type="button"
                aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
                aria-expanded={mobileOpen}
                aria-controls="rcentz-mobile-navigation"
                onClick={() => setMobileOpen(open => !open)}
                className="flex size-10 items-center justify-center rounded-lg text-foreground hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {mobileOpen
                  ? <X aria-hidden="true" className="size-5" />
                  : <Menu aria-hidden="true" className="size-5" />}
              </button>
            </div>
          </div>

          <div
            id="rcentz-mobile-navigation"
            hidden={!mobileOpen}
            className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border py-3 lg:hidden">
            {mobileOpen ? (
              <>
                <RcentzNavigation mobile onNavigate={closeMobileNavigation} />
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
                  <RcentzThemeControl mobile />
                  <div className="min-w-0 flex-1">
                    <RcentzStartProjectAction mobile onNavigate={closeMobileNavigation} />
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </header>
    </>
  );
}
