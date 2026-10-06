import 'server-only';

import { cache } from 'react';

import { rcentzApiGet } from '@/server/rcentz-api/client';
import type { ServiceSummary } from './get-services';

export type ServiceCardSummary = Omit<ServiceSummary, 'category'>;

export type ServiceCategorySummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  services: ServiceCardSummary[];
};

export const getServiceCategories = cache(
  async (): Promise<ServiceCategorySummary[]> => {
    return rcentzApiGet<ServiceCategorySummary[]>(
      '/api/v1/services/categories'
    );
  }
);
