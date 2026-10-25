import 'server-only';

import {
  validateCommercialOverview,
  type Prospect
} from '@/features/opportunities/commercial-types';
import { opportunityRequest } from '@/server/opportunities/client';

export type CommercialPreview = {
  available: boolean;
  total: number;
  prospects: Pick<
    Prospect,
    'id' | 'businessName' | 'summary' | 'state' |
    'source' | 'country' | 'updatedAt'
  >[];
};

export async function getCommercialPreview(
  authorized: boolean
): Promise<CommercialPreview> {
  const unavailable: CommercialPreview = {
    available: false,
    total: 0,
    prospects: []
  };

  if (!authorized) return unavailable;

  try {
    const data = validateCommercialOverview(
      await opportunityRequest({
        operation: 'client:list',
        page: 1
      })
    );

    return {
      available: true,
      total: data.total,
      prospects: data.prospects.slice(0, 5).map(prospect => ({
        id: prospect.id,
        businessName: prospect.businessName,
        summary: prospect.summary,
        state: prospect.state,
        source: prospect.source,
        country: prospect.country,
        updatedAt: prospect.updatedAt
      }))
    };
  } catch (error) {
    console.warn(
      '[Admin Overview] Opportunity Feed unavailable:',
      error instanceof Error ? error.name : 'Unknown error'
    );
    return unavailable;
  }
}
