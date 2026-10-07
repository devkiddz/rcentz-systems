import { rcentzTypography } from '@/ui-shell/brand/rcentz-typography';
import { SystemsIllustrationReveal } from './SystemsIllustrationReveal';
import { IntelligentCollaborationIllustration } from './IntelligentCollaborationIllustration';
import { DatabaseIllustration } from './DatabaseIllustration';
import { ComputingIllustration } from './ComputingIllustration';
import { BusinessDataStream } from './BusinessDataStream';
import { CustomerExperienceIllustration } from './CustomerExperienceIllustration';

export function SystemsPurposeSection() {
  return (
    <section
      id="systems-purpose"
      aria-labelledby="systems-purpose-title"
      className="rcentz-section scroll-mt-24 border-b border-border pb-12 pt-24 sm:pb-16 sm:pt-32 lg:pb-20 lg:pt-40">
      <div className="grid gap-6 lg:grid-cols-[1fr_3fr] lg:gap-12">
        <div className="lg:pt-3">
          <p className="inline-flex h-fit w-fit self-start items-center gap-2 rounded-full border border-border bg-surface-subtle px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-theme-accent" />
          Why Rcentz Systems
        </p>

        </div>

        <div className="min-w-0">
          <h2
            id="systems-purpose-title"
            className={rcentzTypography.className + ' font-bold tracking-normal text-[1.75rem] sm:text-4xl lg:text-[2.75rem] leading-[1.18]'}>
            <span className="block font-medium text-muted-foreground lg:pl-12">
              Building digital infrastructure
            </span>
            <span className="mt-1 block font-semibold text-foreground">
              around your business.
            </span>
          </h2>

          <p className="mt-6 max-w-3xl text-base leading-7 text-muted-foreground">
            We bring your ideas, processes and information together into applications
            that help people access your services, coordinate their work and keep
            your business moving.
          </p>
        </div>
      </div>
      <div
        role="region"
        aria-label="Digital infrastructure illustrations"
        tabIndex={0}
        className="mt-24 rcentz-purpose-carousel flex h-[36rem] w-full min-w-0 snap-x snap-mandatory items-start gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain pb-4 [scrollbar-width:none] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:mt-28 lg:mt-44 lg:grid lg:h-auto lg:grid-cols-5 lg:gap-5 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
        <SystemsIllustrationReveal index={0} className="w-[88%] min-w-0 shrink-0 snap-start lg:w-auto lg:pt-0">
          <BusinessDataStream />
        </SystemsIllustrationReveal>
        <SystemsIllustrationReveal index={1} className="w-[88%] min-w-0 shrink-0 snap-start lg:w-auto lg:pt-16">
          <CustomerExperienceIllustration />
        </SystemsIllustrationReveal>
        <SystemsIllustrationReveal index={2} className="w-[88%] min-w-0 shrink-0 snap-start lg:w-auto lg:pt-32">
          <ComputingIllustration />
        </SystemsIllustrationReveal>
        <SystemsIllustrationReveal index={3} className="w-[88%] min-w-0 shrink-0 snap-start lg:-mt-16 lg:w-auto">
          <DatabaseIllustration />
        </SystemsIllustrationReveal>
        <SystemsIllustrationReveal index={4} className="w-[88%] min-w-0 shrink-0 snap-start lg:w-auto lg:pt-20">
          <IntelligentCollaborationIllustration />
        </SystemsIllustrationReveal>
      </div>
    </section>
  );
}
