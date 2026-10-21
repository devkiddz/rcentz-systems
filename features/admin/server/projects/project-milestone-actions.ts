'use server';
import { revalidatePath } from 'next/cache';
import { governanceRequest } from '@/server/rcentz-api/governance-client';
export type ProjectMilestoneMutationResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export type ProjectMilestoneMutationInput = {
  projectId: string;

  title: string;
  slug: string;

  description: string;
  purpose: string;
  expectedOutcome: string;

  status: string;
  priority: string;
  visibility: string;

  progress: number;
  sortOrder: number;

  startedAt: string;
  dueDate: string;

  completionNotes: string;
};

function refresh(projectId: string) {
  revalidatePath('/admin/projects');
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath('/dashboard/projects');
  revalidatePath(`/dashboard/projects/${projectId}`);
}

function fail(error: unknown): ProjectMilestoneMutationResult {
  // The API intentionally does not expose detailed membership or database errors.
  return { success: false, error: error instanceof Error ? error.message : 'Milestone request failed' };
}

export async function createAdminProjectMilestone(input: ProjectMilestoneMutationInput): Promise<ProjectMilestoneMutationResult> {
  try {
    const result = await governanceRequest<ProjectMilestoneMutationResult>({ operation: 'milestone:create', input });
    if (result.success) refresh(input.projectId);
    return result;
  } catch (error) { return fail(error); }
}

export async function updateAdminProjectMilestone(milestoneId: string, input: ProjectMilestoneMutationInput): Promise<ProjectMilestoneMutationResult> {
  try {
    const result = await governanceRequest<ProjectMilestoneMutationResult>({ operation: 'milestone:update', milestoneId, input });
    if (result.success) refresh(input.projectId);
    return result;
  } catch (error) { return fail(error); }
}

export async function deleteAdminProjectMilestone(projectId: string, milestoneId: string): Promise<ProjectMilestoneMutationResult> {
  try {
    const result = await governanceRequest<ProjectMilestoneMutationResult>({ operation: 'milestone:delete', projectId, milestoneId });
    if (result.success) refresh(projectId);
    return result;
  } catch (error) { return fail(error); }
}
