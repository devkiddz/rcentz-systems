import { RcentzNavigation } from '@/ui-shell/navigation/RcentzNavigation';
import { SystemsProjectPreviewCarousel } from './SystemsProjectPreviewCarousel';
import { projectEntryUrl } from '@/features/systems/lib/project-entry';
import { rcentzTypography } from '@/ui-shell/brand/rcentz-typography';
import { RcentzBrandLogo } from '@/ui-shell/brand/RcentzBrandLogo';
import Link from 'next/link';
import { ArrowUpRight, Grid2X2 } from 'lucide-react';
import { RcentzGithubIcon } from '@/ui-shell/brand/RcentzGithubIcon';



export function SystemsCallToActionSection() {
  return (
    <section
      id="start-project"
      aria-labelledby="systems-cta-title"
      className="rcentz-section overflow-hidden border-b border-border py-12 sm:py-20 lg:py-28">
      <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-12">
        <h2
          id="systems-cta-title"
          className={rcentzTypography.className + ' max-w-3xl lg:col-start-2 font-extrabold tracking-normal text-3xl sm:text-4xl lg:text-[2.5rem] leading-[1.18]'}>
          Your next business move.
          <span className="block">Built into software.</span>
        </h2>

        <div className="self-center lg:col-start-1 lg:row-start-2">
          <p className="max-w-sm text-2xl font-medium leading-snug tracking-tight sm:text-3xl">
            Your business has a way of working.
            <span className="block text-muted-foreground">
              Give it software that works with it.
            </span>
          </p>

          <p className="mt-10 text-sm text-muted-foreground">Capabilities</p>
          <ul className="mt-3 space-y-2 text-sm font-semibold leading-6">
            <li>Customer portals</li>
            <li>Business workflows</li>
            <li>Connected information</li>
            <li>Remote delivery and support</li>
          </ul>
        </div>

        <div className="relative min-w-0 lg:col-start-2 lg:row-start-2">
          <div className="relative rounded-xl border border-border bg-background">
            <div className="flex h-12 items-center justify-between gap-3 border-b border-border px-3">
              <div className="flex min-w-0 items-center gap-4">
                <RcentzBrandLogo className="h-auto w-14 shrink-0 sm:w-16" />
                <div className="hidden xl:block"><RcentzNavigation compact /></div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <a
                  href="https://github.com/devkiddz/rcentz-systems"
                  aria-label="Rcentz Systems on GitHub"
                  className="inline-flex min-h-9 items-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <RcentzGithubIcon aria-hidden="true" className="size-3.5" />
                </a>
                <a
                  href="https://products.rcentz.cc"
                  aria-label="Explore Rcentz products"
                  className="hidden min-h-9 items-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex">
                  <Grid2X2 aria-hidden="true" className="size-3.5" />
                </a>
                <Link
                  href={projectEntryUrl}
                  className="inline-flex min-h-9 items-center rounded-full bg-foreground px-3 text-[9px] font-medium text-background hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  Start a project
                </Link>
              </div>
            </div>

            <SystemsProjectPreviewCarousel>
            <div className="relative flex h-full min-h-[510px] flex-col justify-center px-4 pb-12 pt-10 text-center sm:min-h-[480px] sm:px-6 sm:pb-14 sm:pt-12">
              <p className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">
                Digital infrastructure, built around you
              </p>

              <h3 className={rcentzTypography.className + ' mx-auto mt-5 max-w-lg text-xl font-medium leading-tight tracking-normal sm:text-2xl xl:text-3xl'}>
                Your business. Your workflows.
                <span className="block">One connected system.</span>
              </h3>

              <p className="mx-auto mt-4 max-w-sm text-[10px] leading-[18px] text-muted-foreground">
                Connect your customers, team and information with
                software built around the way your business works.
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Link
                  href={projectEntryUrl}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-foreground px-3 text-[10px] font-medium text-background hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  Start a project
                  <ArrowUpRight aria-hidden="true" className="size-3" />
                </Link>
                <Link
                  href="/#how-we-work"
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-3 text-[10px] font-medium hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  Explore the workspace
                </Link>
              </div>

              <div className="mx-auto mt-9 grid max-w-sm grid-cols-3 gap-4">
                {[
                  ['Plan', 'Clear scope and milestones'],
                  ['Build', 'Working previews and reviews'],
                  ['Launch', 'Handover and connected support']
                ].map(([title, detail]) => (
                  <div key={title}>
                    <p className="text-base font-medium tracking-tight text-muted-foreground sm:text-lg">
                      {title}
                    </p>
                    <p className="mt-1.5 text-[9px] leading-4 text-muted-foreground">
                      {detail}
                    </p>
                  </div>
                ))}
              </div>


            </div>
            </SystemsProjectPreviewCarousel>
          </div>
        </div>
      </div>
    </section>
  );
}
