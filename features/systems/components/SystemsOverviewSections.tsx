import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { rcentzTypography } from '@/ui-shell/brand/rcentz-typography';
import { projectEntryUrl } from '../lib/project-entry';
import { SystemsCallToActionSection } from './SystemsCallToActionSection';
import { SystemsRemoteSection } from './SystemsRemoteSection';
import { SystemsWorkspaceSection } from './SystemsWorkspaceSection';
import { SystemsToolsSection } from './SystemsToolsSection';
import { SystemsSolutionsSection } from './SystemsSolutionsSection';
import { SystemsPurposeSection } from './SystemsPurposeSection';

export function SystemsOverviewSections() {
  return (
    <>
      <SystemsPurposeSection />
      <SystemsSolutionsSection />
      <SystemsToolsSection />
      <SystemsWorkspaceSection />
      <SystemsRemoteSection />
      <SystemsCallToActionSection />
      <section id="pricing" aria-labelledby="systems-pricing-title" className="rcentz-section scroll-mt-24 border-b border-border py-12 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.7fr] lg:gap-12">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-subtle px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-theme-accent" />
              Scope & pricing
            </p>
          </div>
          <div>
            <h2 id="systems-pricing-title" className={rcentzTypography.className + ' text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[2.5rem]'}>
              A clear scope. An agreed project cost.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              Tell us what your business needs. We define the requirements,
              milestones and cost before development begins.
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="border-t border-border pt-4">
                <h3 className="text-base font-semibold">Build your system</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Agree the features, integrations and responsibilities that shape delivery.
                </p>
              </div>
              <div className="border-t border-border pt-4">
                <h3 className="text-base font-semibold">Plan ongoing support</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Decide what maintenance, support and future improvements your team needs.
                </p>
              </div>
            </div>
            <Link href={projectEntryUrl} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Start a project
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
