import 'server-only';

import { cache } from 'react';

import type { SupportedLocale } from '@/i18n/config';
import { RcentzApiError, rcentzApiGet } from '@/server/rcentz-api/client';
import type { ServiceSummary } from './get-services';
import type { SupportedServiceCurrency } from './get-visitor-currency';

export type ServiceDetail = Omit<ServiceSummary, 'category'> & {
  description: string | null;
  deliveryMinDays: number | null;
  deliveryMaxDays: number | null;
  deliveryNote: string | null;
  publishedAt: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
  } | null;
  prices: {
    id: string;
    currency: string;
    priceFrom: string | number;
    priceTo: string | number | null;
  }[];
  technologies: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    category: string | null;
    description: string | null;
    purpose: string | null;
    rationale: string | null;
    featured: boolean;
    sortOrder: number;
  }[];
  features: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    expectedOutcome: string | null;
    featured: boolean;
    sortOrder: number;
  }[];
  outcomes: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    sortOrder: number;
  }[];
  milestoneTemplates: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    purpose: string | null;
    expectedOutcome: string | null;
    minDays: number | null;
    maxDays: number | null;
    sortOrder: number;
  }[];
  faqs: {
    id: string;
    slug: string;
    question: string;
    answer: string;
    featured: boolean;
    sortOrder: number;
  }[];
  onboardingQuestions: {
    id: string;
    key: string;
    label: string;
    helpText: string | null;
    placeholder: string | null;
    type:
      | 'SHORT_TEXT'
      | 'LONG_TEXT'
      | 'NUMBER'
      | 'URL'
      | 'EMAIL'
      | 'PHONE'
      | 'BOOLEAN'
      | 'SINGLE_SELECT'
      | 'MULTI_SELECT'
      | 'DATE';
    required: boolean;
    sortOrder: number;
    options: {
      id: string;
      value: string;
      label: string;
      description: string | null;
      sortOrder: number;
    }[];
  }[];
  media: {
    id: string;
    url: string;
    alt: string | null;
    caption: string | null;
    width: number | null;
    height: number | null;
    sortOrder: number;
  }[];
  seo: {
    title: string | null;
    description: string | null;
    keywords: string | null;
    canonicalUrl: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImage: string | null;
    robots: string;
  } | null;
};

export const getServiceBySlug = cache(
  async (
    slug: string,
    currency: SupportedServiceCurrency,
    locale: SupportedLocale,
  ): Promise<ServiceDetail | null> => {
    const query = new URLSearchParams({ currency, locale });

    try {
      return await rcentzApiGet<ServiceDetail>(
        `/api/v1/services/${encodeURIComponent(slug)}?${query}`,
      );
    } catch (error) {
      if (
        error instanceof RcentzApiError &&
        error.status === 404 &&
        error.code === 'SERVICE_NOT_FOUND'
      ) {
        return null;
      }

      throw error;
    }
  },
);
