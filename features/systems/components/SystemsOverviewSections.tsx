import { rcentzTypography } from '@/ui-shell/brand/rcentz-typography';
import { SystemsCallToActionSection } from './SystemsCallToActionSection';
import { SystemsRemoteSection } from './SystemsRemoteSection';
import { SystemsWorkspaceSection } from './SystemsWorkspaceSection';
import { SystemsToolsSection } from './SystemsToolsSection';
import { SystemsSolutionsSection } from './SystemsSolutionsSection';
import { SystemsPurposeSection } from './SystemsPurposeSection';
import { ArrowUpRight } from 'lucide-react';


const quoteUrl = 'mailto:dennis@rcentz.cc?subject=Rcentz%20Systems%20quote%20enquiry';

export function SystemsOverviewSections() {
  return (
    <>
      <SystemsPurposeSection />

      <SystemsSolutionsSection />

      <SystemsToolsSection />

      <SystemsWorkspaceSection />

      <div className="relative isolate">
        <SystemsRemoteSection />

        <div className="relative bg-background">
      <SystemsCallToActionSection />

      <section
        id="pricing"
        aria-labelledby="systems-pricing-title"
        className="rcentz-section scroll-mt-24 py-12 sm:py-16">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Pricing</p>
        <h2 id="systems-pricing-title" className={rcentzTypography.className + ' mt-3 font-bold tracking-normal text-[1.75rem] sm:text-4xl lg:text-[2.75rem] leading-[1.18]'}>
          Start with the scope. Agree the investment.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Your workflows, integrations and delivery requirements shape the quote.
          We agree the scope and milestones before development begins.
        </p>
        <div className="mt-6 grid max-w-3xl gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-border p-5">
            <h3 className="text-base font-semibold">Build your system</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Define the application, its requirements and a clear delivery plan.
            </p>
          </div>
          <div className="rounded-2xl border border-border p-5">
            <h3 className="text-base font-semibold">Plan ongoing support</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Discuss maintenance and improvements alongside your operational needs.
            </p>
          </div>
        </div>
        <a
          href={quoteUrl}
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Get a quote
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </a>
      </section>
        </div>
      </div>
    </>
  );
}
