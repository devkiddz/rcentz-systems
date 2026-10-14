'use server';

import { revalidatePath } from 'next/cache';
import { opportunityRequest } from '@/server/opportunities/client';

const path = '/admin/commercial-capabilities/problems';
const value = (data: FormData, name: string) => String(data.get(name) ?? '').trim();
const entries = (data: FormData, name: string) => value(data, name).split(/\r?\n/).map(item => item.trim()).filter(Boolean);
const identifier = (data: FormData, name: string) => value(data, name);

export async function saveBusinessProblem(data: FormData) {
  const status = value(data, 'status');
  if (!['DRAFT', 'PAUSED', 'ARCHIVED'].includes(status)) throw new Error('Invalid problem status');
  const key = identifier(data, 'key');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key)) throw new Error('Use a lowercase hyphenated key');
  await opportunityRequest({
    operation: 'knowledge:problem',
    ...(value(data, 'id') ? { id: value(data, 'id') } : {}),
    key,
    title: value(data, 'title'),
    description: value(data, 'description'),
    symptoms: entries(data, 'symptoms'),
    impact: entries(data, 'impact'),
    status,
  });
  revalidatePath(path);
}

export async function saveSolutionGroup(data: FormData) {
  const key = identifier(data, 'key');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key)) throw new Error('Use a lowercase hyphenated group key');
  await opportunityRequest({
    operation: 'knowledge:group',
    ...(value(data, 'id') ? { id: value(data, 'id') } : {}),
    key,
    name: value(data, 'name'),
    description: value(data, 'description'),
  });
  revalidatePath(path);
}

export async function linkProblemSolution(data: FormData) {
  const priority = Number(value(data, 'priority') || '0');
  if (!Number.isInteger(priority) || priority < -100 || priority > 100) throw new Error('Invalid priority');
  await opportunityRequest({
    operation: 'knowledge:link',
    problemId: value(data, 'problemId'),
    solutionId: value(data, 'solutionId'),
    rationale: value(data, 'rationale'),
    qualificationCriteria: entries(data, 'qualificationCriteria'),
    priority,
  });
  revalidatePath(path);
}

export async function assignSolutionGroup(data: FormData) {
  await opportunityRequest({
    operation: 'knowledge:assign-group',
    solutionId: value(data, 'solutionId'),
    groupId: value(data, 'groupId') || null,
  });
  revalidatePath(path);
}
