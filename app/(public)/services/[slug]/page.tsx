import {
  serviceMetadata,
  serviceJsonLd,
} from "@/features/services/lib/service-seo";
import type { Metadata } from "next";

import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { ServiceDetail } from "@/features/services/components/detail/ServiceDetail";
import { getServiceBySlug } from "@/features/services/server/get-service-by-slug";
import { getVisitorCurrency } from "@/features/services/server/get-visitor-currency";
import {
  defaultLocale,
  isSupportedLocale,
  type SupportedLocale,
} from "@/i18n/config";

type ServicePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

async function getResolvedLocale(): Promise<SupportedLocale> {
  const locale = await getLocale();

  return isSupportedLocale(locale) ? locale : defaultLocale;
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;

  const [currency, locale] = await Promise.all([
    getVisitorCurrency(),
    getResolvedLocale(),
  ]);

  const service = await getServiceBySlug(slug, currency, locale);

  if (!service) {
    notFound();
  }

  return serviceMetadata(service);
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;

  const [currency, locale] = await Promise.all([
    getVisitorCurrency(),
    getResolvedLocale(),
  ]);

  const service = await getServiceBySlug(slug, currency, locale);

  if (!service) {
    notFound();
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serviceJsonLd(service) }}
      />
      <ServiceDetail service={service} />
    </>
  );
}
