import 'server-only';

import { cache } from 'react';

import { getServiceCategories } from './get-service-categories';
import { getServices, type ServiceSummary } from './get-services';

type GetSuggestedServicesOptions = {
  serviceId: string;
  categoryId?: string | null;
  limit?: number;
};

export type SuggestedService = Omit<ServiceSummary, 'category'> & {
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export const getSuggestedServices = cache(
  async ({
    serviceId,
    categoryId,
    limit = 8,
  }: GetSuggestedServicesOptions): Promise<SuggestedService[]> => {
    if (!Number.isInteger(limit) || limit <= 0) {
      return [];
    }

    const [services, categories] = await Promise.all([
      getServices(),
      getServiceCategories(),
    ]);

    const categoriesBySlug = new Map(
      categories.map(category => [category.slug, category]),
    );

    const catalogue: SuggestedService[] = services
      .filter(service => service.id !== serviceId)
      .map(service => {
        const category = service.category
          ? categoriesBySlug.get(service.category.slug)
          : undefined;

        if (service.category && !category) {
          throw new Error('Service catalogue category is missing');
        }

        return {
          ...service,
          category: category
            ? {
                id: category.id,
                name: category.name,
                slug: category.slug,
              }
            : null,
        };
      });

    return catalogue
      .sort((left, right) => {
        const leftMatches = Boolean(categoryId && left.category?.id === categoryId);
        const rightMatches = Boolean(categoryId && right.category?.id === categoryId);

        return (
          Number(rightMatches) - Number(leftMatches) ||
          Number(right.featured) - Number(left.featured) ||
          left.name.localeCompare(right.name, 'en')
        );
      })
      .slice(0, limit);
  },
);
