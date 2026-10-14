import type { ReactNode } from 'react';
import { requireOpportunityAdministrator } from '@/server/opportunities/workspace-access';
export const dynamic = 'force-dynamic';
export default async function OpportunitiesLayout({children}: {children: ReactNode}) {
  await requireOpportunityAdministrator();
  return children;
}
