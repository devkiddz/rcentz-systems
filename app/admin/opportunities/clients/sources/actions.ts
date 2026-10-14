'use server';

import { revalidatePath } from 'next/cache';
import { opportunityRequest } from '@/server/opportunities/client';
import { requireOpportunityAdministrator } from '@/server/opportunities/workspace-access';

const route = '/admin/opportunities/clients/sources';
const field = (data: FormData, key: string) => String(data.get(key) ?? '').trim();
const requireNumber = (data: FormData, key: string, min: number, max: number) => {
  const text = field(data, key);
  const value = Number(text);
  if (!/^\d+$/.test(text) || !Number.isInteger(value) || value < min || value > max) throw new Error('Invalid source limit');
  return value;
};

export async function addClientSource(form: FormData) {
  await requireOpportunityAdministrator();
  const key = field(form, 'key');
  if (!/^[a-z0-9][a-z0-9-]{2,79}$/.test(key)) throw new Error('Invalid source key');
  const kind = field(form, 'kind');
  const lane = field(form, 'lane');
  const method = field(form, 'method');
  if (!['PUBLIC_RFP','PUBLIC_PROJECT_REQUEST','COMPANY_WEBSITE','BUSINESS_DIRECTORY','PARTNERSHIP_NOTICE','OTHER_PUBLIC'].includes(kind) ||
      !['DIRECT_DEMAND','PROSPECT_SIGNAL','PARTNERSHIP'].includes(lane) ||
      !['PUBLIC_FEED','OFFICIAL_API','MANUAL_REVIEW'].includes(method)) throw new Error('Invalid discovery source category');
  await opportunityRequest({
    operation: 'client:source-save', key,
    name: field(form, 'name'), homepage: field(form, 'homepage'), kind, lane, method,
    permittedEndpoint: method === 'MANUAL_REVIEW' ? null : field(form, 'permittedEndpoint'),
    cadenceMinutes: requireNumber(form, 'cadenceMinutes', 60, 43200),
    maxItemsPerRun: requireNumber(form, 'maxItemsPerRun', 1, 100),
    notes: field(form, 'notes'),
  });
  revalidatePath(route);
}

export async function updateClientSourceDecision(form: FormData) {
  await requireOpportunityAdministrator();
  const id = field(form, 'id');
  const decision = field(form, 'decision');
  if (!/^[A-Za-z0-9_-]{10,160}$/.test(id) || !['APPROVE','ENABLE','DISABLE','SUSPEND'].includes(decision) ||
      field(form, 'confirmation') !== 'REVIEWED-COMMERCIAL-SOURCE') throw new Error('Invalid source review confirmation');
  await opportunityRequest({ operation: 'client:source-decision', id, decision,
    confirm: 'REVIEWED-COMMERCIAL-SOURCE' });
  revalidatePath(route);
}
