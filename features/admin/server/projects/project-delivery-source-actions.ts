'use server';
import { revalidatePath } from 'next/cache';
import { deliverySourceRequest, type RegisteredSource } from '@/server/rcentz-api/delivery-source-client';

export type SourceActionResult = { success: boolean; message: string; sources?: RegisteredSource[] };
const ident = (s: string) => /^[a-zA-Z0-9:_-]{1,160}$/.test(s);
const repositoryPattern = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;
const branchPattern = /^[a-zA-Z0-9][a-zA-Z0-9_./-]{0,120}$/;

export async function listProjectSources(projectId: string): Promise<SourceActionResult> {
  if (!ident(projectId)) return { success: false, message: 'Invalid project.' };
  try {
    const sources = await deliverySourceRequest<RegisteredSource[]>({ operation: 'list', projectId });
    return { success: true, message: '', sources };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Sources unavailable.' };
  }
}

export async function registerProjectSource(projectId: string, formData: FormData): Promise<SourceActionResult> {
  const repository = String(formData.get('repository') ?? '').trim();
  const branch = String(formData.get('branch') ?? 'main').trim();
  const requiredChecks = String(formData.get('requiredChecks') ?? '').split(',').map(s => s.trim()).filter(Boolean);
  const vercelProjectId = String(formData.get('vercelProjectId') ?? '').trim();
  const vercelTeamId = String(formData.get('vercelTeamId') ?? '').trim();
  if (!ident(projectId) || !repositoryPattern.test(repository) || !branchPattern.test(branch) || branch.includes('..'))
    return { success: false, message: 'Provide a valid owner/repository and branch.' };
  if ((vercelProjectId && !/^[a-zA-Z0-9_-]{1,128}$/.test(vercelProjectId)) ||
      (vercelTeamId && !/^[a-zA-Z0-9_-]{1,128}$/.test(vercelTeamId)))
    return { success: false, message: 'Invalid Vercel project or team ID.' };
  if ((!requiredChecks.length && !vercelProjectId) || requiredChecks.length > 20 || requiredChecks.some(s => s.length > 150) || new Set(requiredChecks).size !== requiredChecks.length)
    return { success: false, message: 'Supply at least one GitHub required check or a Vercel project ID. Checks must be distinct, at most 20, and up to 150 characters each.' };
  if (vercelTeamId && !vercelProjectId)
    return { success: false, message: 'Vercel team ID requires a Vercel project ID.' };
  try {
    await deliverySourceRequest({ operation: 'register', projectId, repository, branch,
      requiredChecks, vercelProjectId: vercelProjectId || null, vercelTeamId: vercelTeamId || null });
    revalidatePath(`/admin/projects/${projectId}`);
    return { success: true, message: 'Repository connected. Milestones begin from the current branch head.' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Repository connection failed.' };
  }
}

export async function setProjectSourceEnabled(projectId: string, sourceId: string, enabled: boolean): Promise<SourceActionResult> {
  if (!ident(projectId) || !ident(sourceId)) return { success: false, message: 'Invalid source.' };
  try {
    await deliverySourceRequest({ operation: enabled ? 'enable' : 'disable', projectId, sourceId });
    revalidatePath(`/admin/projects/${projectId}`);
    return { success: true, message: enabled ? 'Source enabled.' : 'Source disabled; history preserved.' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Source update failed.' };
  }
}
