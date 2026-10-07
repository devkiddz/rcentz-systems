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
      <section
        id="work"
        aria-labelledby="systems-work-title"
        className="rcentz-section scroll-mt-24 border-b border-border py-12 sm:py-16">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Work</p>
            <h2 id="systems-work-title" className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              See the work behind the approach.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Explore selected applications, interfaces and product work in Dennis?s portfolio.
            </p>
          </div>
          <a
            href="https://dennis.rcentz.cc"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-border px-5 text-sm font-medium hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            View selected work
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        </div>
      </section>

      <section
        id="pricing"
        aria-labelledby="systems-pricing-title"
        className="rcentz-section scroll-mt-24 py-12 sm:py-16">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Pricing</p>
        <h2 id="systems-pricing-title" className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
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
