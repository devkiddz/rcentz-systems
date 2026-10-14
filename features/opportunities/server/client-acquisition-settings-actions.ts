'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { opportunityRequest } from '@/server/opportunities/client';
import { requireOpportunityAdministrator } from '@/server/opportunities/workspace-access';

const route = '/admin/opportunities/clients/settings';
const keys = ['regions', 'industries', 'engagementTypes', 'preferredSources', 'businessProblems'] as const;

export async function saveClientAcquisitionSettings(form: FormData) {
  await requireOpportunityAdministrator();
  const data: Record<string, string[]> = {};
  for (const key of keys) {
    const raw = form.get(key);
    if (typeof raw !== 'string' || raw.length > 3000) throw new Error('Invalid acquisition settings.');
    const values = raw.split(',').map((value) => value.trim()).filter(Boolean);
    if (values.length > 24 || values.some((value) => value.length > 120)) throw new Error('Each list accepts at most 24 entries of 120 characters.');
    data[key] = [...new Set(values)];
  }
  const score = form.get('minimumScore');
  if (typeof score !== 'string' || !/^(?:100|[0-9]{1,2})$/.test(score)) throw new Error('Minimum score must be between 0 and 100.');
  const includeUnpriced = form.get('includeUnpriced') === 'on';
  const requireBudget = form.get('requireBudget') === 'on';
  if (includeUnpriced && requireBudget) throw new Error('Budget preferences conflict. Select only one.');
  await opportunityRequest({
    operation: 'client:settings',
    ...data,
    includeUnpriced,
    requireBudget,
    minimumScore: Number(score),
    discoveryEnabled: false,
  });
  revalidatePath(route);
  revalidatePath('/admin/opportunities/clients');
  redirect(`${route}?saved=1`);
}
