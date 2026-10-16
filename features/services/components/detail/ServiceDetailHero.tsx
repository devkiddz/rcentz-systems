import { serviceProjectHref } from '../../lib/catalogue';
import Link from 'next/link';

import { ArrowLeft, ArrowRight, BadgeCheck, MessageSquareText } from 'lucide-react';

import { getTranslations } from 'next-intl/server';

import type { ServiceDetail } from '../../server/get-service-by-slug';

import { ServiceCategoryHeroIllustration } from './ServiceCategoryHeroIllustration';
import { ServiceDetailMeta } from './ServiceDetailMeta';

type ServiceDetailHeroProps = {
  service: ServiceDetail;
};

export async function ServiceDetailHero({ service }: ServiceDetailHeroProps) {
  const t = await getTranslations('ServiceDetailHero');

  const requestHref = serviceProjectHref(service.slug);

  return (
    <section className="relative isolate overflow-hidden px-3 pb-14 pt-2 sm:px-4 sm:pb-18 sm:pt-3 lg:px-8 lg:pb-20 lg:pt-4">
      {/* =========================================
          ENVIRONMENT
          ========================================= */}

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60 rcentz-grid-fade" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-10 h-[360px] w-[620px] -translate-x-1/2 rounded-full bg-theme-accent-faint blur-3xl sm:h-[420px] sm:w-[760px] lg:h-[520px] lg:w-[980px]"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1180px]">
        {/* =========================================
            BACK
            ========================================= */}

        <Link
          href="/services"
          className="group inline-flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.15em] text-muted transition-colors hover:text-foreground">
          <ArrowLeft className="size-3 transition-transform duration-300 group-hover:-translate-x-0.5" />

          {t('backToServices')}
        </Link>

        {/* =========================================
            HERO GRID
            ========================================= */}

        <div className="mt-5 grid items-center gap-8 sm:mt-6 sm:gap-10 lg:mt-8 lg:grid-cols-2 lg:gap-12 xl:gap-14">
          {/* =======================================
              LEFT: CONTENT
              ======================================= */}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {service.category ? (
                <span className="rounded-full border border-theme-accent/15 bg-theme-accent-soft px-3 py-1.5 font-mono text-[7px] uppercase tracking-[0.14em] text-theme-accent">
                  {service.category.name}
                </span>
              ) : null}

              <ServiceDetailMeta service={service} />
            </div>

            <p className="mt-6 font-mono text-[8px] uppercase tracking-[0.18em] text-muted sm:text-[9px] sm:tracking-[0.2em]">
              {t('serviceBy')}
            </p>

            <h1 className="mt-3 max-w-[620px] text-[2.35rem] font-semibold leading-[0.96] tracking-[-0.058em] text-foreground sm:text-[3.25rem] lg:text-[3.7rem] xl:text-[4.15rem]">
              {service.name}
            </h1>

            {service.shortDescription ? (
              <h2 className="mt-5 max-w-[640px] text-[17px] font-medium leading-[1.24] tracking-[-0.03em] text-foreground/82 sm:text-[20px] lg:text-[22px]">
                {service.shortDescription}
              </h2>
            ) : null}

            {service.description ? (
              <p className="mt-5 max-w-[640px] text-[13px] leading-7 text-muted sm:text-[14px] sm:leading-7 lg:text-[15px]">
                {service.description}
              </p>
            ) : null}

            {/* =========================================
                ACTIONS
                ========================================= */}

            <div className="mt-8 flex flex-wrap items-center gap-2.5">
              <Link
                href={requestHref}
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-[12px] font-medium text-primary-foreground transition-[opacity,transform] hover:opacity-90 active:scale-[0.98]">
                {t('requestService')}

                <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>

              <Link
                href={requestHref}
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-background/60 px-5 text-[12px] font-medium text-foreground backdrop-blur-xl transition-[background-color,border-color,transform] hover:border-theme-accent/25 hover:bg-theme-accent-soft active:scale-[0.98]">
                <MessageSquareText className="size-3.5 text-theme-accent" />

                {t('customOffer')}
              </Link>
            </div>

            {service.featured ? (
              <div className="mt-5">
                <span className="inline-flex items-center gap-1.5 font-mono text-[7px] uppercase tracking-[0.12em] text-theme-accent">
                  <BadgeCheck className="size-3" />

                  {t('featuredService')}
                </span>
              </div>
            ) : null}
          </div>

          {/* =======================================
              RIGHT: ILLUSTRATION
              ======================================= */}

          <div className="min-w-0">
            <div className="relative mx-auto w-full max-w-none">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-[6%] rounded-[40px] bg-theme-accent-faint blur-3xl"
              />

              <div className="relative flex min-h-[320px] items-center justify-center sm:min-h-[410px] lg:min-h-[500px] xl:min-h-[560px]">
                <div className="w-full origin-center scale-[1.08] sm:scale-[1.12] lg:scale-[1.14] xl:scale-[1.18]">
                  <ServiceCategoryHeroIllustration
                    categorySlug={service.category?.slug}
                    categoryName={service.category?.name}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
