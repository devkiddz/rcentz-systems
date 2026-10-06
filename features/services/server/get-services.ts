import 'server-only';

import { cache } from 'react';

import { rcentzApiGet } from '@/server/rcentz-api/client';

export type ServiceSummary = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  type:
    | 'WEBSITE'
    | 'WEB_APP'
    | 'MOBILE_APP'
    | 'DESKTOP_APP'
    | 'SAAS'
    | 'API'
    | 'ECOMMERCE'
    | 'BRANDING'
    | 'GRAPHIC_DESIGN'
    | 'CONSULTING'
    | 'MAINTENANCE'
    | 'OTHER';
  featured: boolean;
  category: {
    name: string;
    slug: string;
  } | null;
};

export const getServices = cache(async (): Promise<ServiceSummary[]> => {
  return rcentzApiGet<ServiceSummary[]>('/api/v1/services');
});
