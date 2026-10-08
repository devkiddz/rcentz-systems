import type { ServiceDetail as ServiceDetailData } from '../../server/get-service-by-slug';
import { getSuggestedServices } from '../../server/get-suggested-services';

import { ServiceDeliverySection } from './ServiceDeliverySection';
import { ServiceDetailCTA } from './ServiceDetailCTA';
import { ServiceDetailHero } from './ServiceDetailHero';
import { ServiceFaqSection } from './ServiceFaqSection';
import { ServiceFeaturesOutcomesSection } from './ServiceFeaturesOutcomesSection';
import { ServiceOnboardingPreview } from './ServiceOnboardingPreview';
import { ServiceOverviewSection } from './ServiceOverviewSection';
import { ServicePricePanel } from './ServicePricePanel';
import { ServiceTechnologySection } from './ServiceTechnologySection';
import { SuggestedServicesTray } from './SuggestedServicesTray';

type ServiceDetailProps = {
  service: ServiceDetailData;
};

export async function ServiceDetail({ service }: ServiceDetailProps) {
  const suggestedServices = await getSuggestedServices({
    serviceId: service.id,
    categoryId: service.category?.id ?? null,
    limit: 8
  });

  return (
    <main className="relative">
      <ServiceDetailHero service={service} />

      <ServiceOverviewSection service={service} />

      {(service.features.length > 0 || service.outcomes.length > 0) && (
        <ServiceFeaturesOutcomesSection features={service.features} outcomes={service.outcomes} />
      )}

      {service.technologies.length > 0 && <ServiceTechnologySection service={service} />}

      {(service.deliveryMinDays ||
        service.deliveryMaxDays ||
        service.deliveryNote ||
        service.milestoneTemplates.length > 0) && <ServiceDeliverySection service={service} />}

      {(service.prices.length > 0 || service.onboardingQuestions.length > 0) && (
        <section className="relative py-20 sm:py-24">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-surface-muted/20" />

          <div className="rcentz-section relative">
            <div className="mb-10 max-w-[680px] sm:mb-12">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-theme-accent sm:text-[9px]">
                  Project direction
                </span>

                <span className="h-px w-8 bg-theme-accent/35" />
              </div>

              <h2 className="mt-4 max-w-[640px] text-[2rem] font-semibold leading-[1] tracking-[-0.05em] text-foreground sm:text-[2.8rem]">
                Understand the project cost. Then define the project.
              </h2>

              <p className="mt-5 max-w-[610px] text-[13px] leading-7 text-muted sm:text-[15px]">
                Pricing provides an initial direction. The onboarding process helps us understand the exact
                scope, workflows, integrations and requirements before a final project proposal is prepared.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr] lg:items-start lg:gap-7">
              {service.prices.length > 0 ? <ServicePricePanel service={service} /> : null}

              {service.onboardingQuestions.length > 0 ? <ServiceOnboardingPreview service={service} /> : null}
            </div>
          </div>
        </section>
      )}

      {service.faqs.length > 0 && <ServiceFaqSection service={service} />}

      {/* =========================================
          FINAL CTA
          ========================================= */}

      <section className="relative pb-20 pt-4 sm:pb-28 sm:pt-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 h-[300px] w-[680px] -translate-x-1/2 rounded-full bg-theme-accent-faint blur-3xl"
        />

        <div className="rcentz-section relative">
          <ServiceDetailCTA service={service} />
        </div>
      </section>

      {/* =========================================
          SUGGESTED SERVICES
          ========================================= */}

      {suggestedServices.length > 0 ? <SuggestedServicesTray services={suggestedServices} /> : null}
    </main>
  );
}
