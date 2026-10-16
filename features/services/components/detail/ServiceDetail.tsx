import Link from "next/link";
import { ArrowLeft, ArrowRight, Layers3, CalendarDays } from "lucide-react";
import { getCurrentUser } from "@/features/auth/server/get-current-user";
import { cookies } from "next/headers";
import type { ServiceDetail as ServiceDetailData } from "../../server/get-service-by-slug";
import {
  openServiceChoice,
  SERVICE_CHOICE_COOKIE,
} from "../../server/selection-token";
import { ServiceConfigurator } from "../selection/ServiceConfigurator";
import { ServicePricePanel } from "./ServicePricePanel";
const panel = "rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6";
export async function ServiceDetail({
  service,
}: {
  service: ServiceDetailData;
}) {
  const user = await getCurrentUser();
  const choice =
    user?.status === "ACTIVE"
      ? openServiceChoice(
          (await cookies()).get(SERVICE_CHOICE_COOKIE)?.value,
          user.id,
          process.env.BETTER_AUTH_SECRET || "",
        )
      : null;
  const initialChoice =
    choice?.serviceSlug === service.slug
      ? {
          ...choice,
          featureSlugs: choice.featureSlugs.filter((slug) =>
            service.features.some((f) => f.slug === slug),
          ),
        }
      : undefined;
  return (
    <div className="rcentz-section space-y-6 py-6 sm:py-10">
      <Link
        href="/services"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        All services
      </Link>
      <header className={panel}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-theme-accent-faint px-3 py-1 text-xs font-medium text-theme-accent">
            {service.category?.name || "Business solutions"}
          </span>
          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            Service overview
          </span>
        </div>
        <h1 className="mt-4 max-w-4xl break-words text-3xl font-semibold tracking-tight sm:text-4xl">
          {service.name}
        </h1>
        {service.shortDescription ? (
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            {service.shortDescription}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-border pt-5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Layers3 aria-hidden="true" className="size-4" />
            {service.features.length} available features
          </span>
          <span className="inline-flex items-center gap-2">
            <CalendarDays aria-hidden="true" className="size-4" />
            {service.deliveryMinDays && service.deliveryMaxDays
              ? `${service.deliveryMinDays}–${service.deliveryMaxDays} days · scope dependent`
              : "Timeline confirmed after review"}
          </span>
          <a
            href="#configure"
            className="inline-flex min-h-11 items-center gap-2 font-medium text-foreground"
          >
            {user?.status === "ACTIVE"
              ? "Choose your features"
              : "Explore features"}
            <ArrowRight aria-hidden="true" className="size-4" />
          </a>
        </div>
      </header>
      <div className="grid items-start gap-6 xl:grid-cols-2">
        <div className="min-w-0 space-y-6">
          <section className={panel}>
            <h2 className="text-lg font-semibold">What this service can do</h2>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">
              {service.description ||
                service.shortDescription ||
                "We shape the service around your business requirements."}
            </p>
            {service.outcomes.length ? (
              <ul className="mt-5 space-y-3">
                {service.outcomes.map((outcome) => (
                  <li key={outcome.id} className="rounded-xl bg-muted/30 p-4">
                    <h3 className="text-sm font-medium">{outcome.title}</h3>
                    {outcome.description ? (
                      <p className="mt-2 text-xs leading-6 text-muted-foreground">
                        {outcome.description}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
          {service.milestoneTemplates.length || service.deliveryNote ? (
            <section className={panel}>
              <h2 className="text-lg font-semibold">
                How delivery takes shape
              </h2>
              {service.deliveryNote ? (
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {service.deliveryNote}
                </p>
              ) : null}
              <ol className="mt-4 space-y-4">
                {service.milestoneTemplates.map((m, i) => (
                  <li key={m.id} className="flex gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-xs">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-medium">{m.title}</h3>
                      <p className="mt-1 text-xs leading-6 text-muted-foreground">
                        {m.description || m.purpose || m.expectedOutcome}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
          {service.prices.length ? (
            <ServicePricePanel service={service} />
          ) : (
            <section className={panel}>
              <h2 className="text-lg font-semibold">
                Pricing follows your scope
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Choose the features you need and share your budget during
                onboarding. We will review the requirements before preparing a
                proposal.
              </p>
            </section>
          )}
          {service.faqs.length ? (
            <section className={panel}>
              <h2 className="text-lg font-semibold">
                Questions before you start
              </h2>
              <div className="mt-4 divide-y divide-border">
                {service.faqs.map((faq) => (
                  <details key={faq.id} className="py-4">
                    <summary className="cursor-pointer text-sm font-medium">
                      {faq.question}
                    </summary>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}
        </div>
        <div className="min-w-0">
          <ServiceConfigurator
            key={service.slug}
            slug={service.slug}
            features={service.features.map(
              ({ slug, name, description, expectedOutcome }) => ({
                slug,
                name,
                description,
                expectedOutcome,
              }),
            )}
            canConfigure={user?.status === "ACTIVE"}
            initialChoice={initialChoice}
          />
        </div>
      </div>
    </div>
  );
}
