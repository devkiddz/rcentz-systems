import { serviceProjectHref } from '../../lib/catalogue';
import Link from 'next/link';

import { ArrowRight, MessagesSquare, Sparkles, WandSparkles } from 'lucide-react';

import { getTranslations } from 'next-intl/server';

import type { ServiceDetail } from '../../server/get-service-by-slug';

type ServiceDetailCTAProps = {
  service: ServiceDetail;
};

export async function ServiceDetailCTA({ service }: ServiceDetailCTAProps) {
  const t = await getTranslations('ServiceDetailCTA');

  const requestHref = serviceProjectHref(service.slug);

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-border bg-background px-6 py-10 sm:px-9 sm:py-12 lg:px-12 lg:py-14">
      {/* =========================================
          ENVIRONMENT
          ========================================= */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 size-[300px] rounded-full bg-theme-accent-faint blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-24 size-[320px] rounded-full bg-theme-accent-faint blur-3xl"
      />

      <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
        {/* =========================================
            COPY
            ========================================= */}

        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-full border border-theme-accent/15 bg-theme-accent-soft">
              <WandSparkles className="size-3.5 text-theme-accent" />
            </div>

            <p className="font-mono text-[8px] uppercase tracking-[0.17em] text-theme-accent sm:text-[9px]">
              {t('eyebrow')}
            </p>

            <span className="h-px w-8 bg-theme-accent/30" />
          </div>

          <h2 className="mt-5 max-w-[720px] text-[2.2rem] font-semibold leading-[0.98] tracking-[-0.055em] text-foreground sm:text-[3rem] lg:text-[3.4rem]">
            {t('title')}
          </h2>

          <p className="mt-5 max-w-[660px] text-[12px] leading-7 text-muted sm:text-[14px] sm:leading-8">
            {t('description')}
          </p>

          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-3.5 text-theme-accent" />

              <span className="text-[9px] text-muted sm:text-[10px]">{t('structuredOnboarding')}</span>
            </div>

            <div className="flex items-center gap-2">
              <Sparkles className="size-3.5 text-theme-accent" />

              <span className="text-[9px] text-muted sm:text-[10px]">{t('scopeReview')}</span>
            </div>

            <div className="flex items-center gap-2">
              <Sparkles className="size-3.5 text-theme-accent" />

              <span className="text-[9px] text-muted sm:text-[10px]">{t('finalQuote')}</span>
            </div>
          </div>
        </div>

        {/* =========================================
            ACTIONS
            ========================================= */}

        <div className="flex min-w-[210px] flex-col gap-3 sm:flex-row lg:flex-col">
          <Link
            href={requestHref}
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-[10px] font-medium text-primary-foreground transition-[opacity,transform] duration-200 hover:opacity-85 active:scale-[0.98]">
            {t('requestService')}

            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>

          <Link
            href={requestHref}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-background px-5 text-[10px] font-medium text-foreground transition-[border-color,background-color,transform] duration-200 hover:border-theme-accent/25 hover:bg-theme-accent-soft active:scale-[0.98]">
            <MessagesSquare className="size-3.5 text-theme-accent" />

            {t('customOffer')}
          </Link>

          <p className="px-2 text-center font-mono text-[6px] uppercase tracking-[0.11em] text-muted">
            {t('reviewBeforeCommitment')}
          </p>
        </div>
      </div>
    </section>
  );
}
