import 'server-only';
import { governanceRequest } from './governance-client';
export type DeliverySnapshot = {
  milestones: Array<{ id: string; milestoneId: string; key: string; phase: string; completionSha: string | null;
    milestone: { title: string; status: string; completedAt: string | null };
    source: { repository: string; branch: string }; _count: { commits: number };
    observations: Array<{ snapshot: unknown; createdAt: string }> }>;
  nextCursor: string | null;
  sources: Array<{ id: string; repository: string; branch: string; lastSyncedAt: string | null; lastError: string | null; _count: { commits: number } }>;
};
export type DeliveryCommits = { commits: Array<{ id: string; sha: string; message: string; committedAt: string }>; nextCursor: string | null };
export function readDelivery(projectId: string, cursor?: string) {
  return governanceRequest<DeliverySnapshot>({ operation: 'delivery:read', projectId, cursor });
}
export function readDeliveryCommits(projectId: string, milestoneId: string, cursor?: string) {
  return governanceRequest<DeliveryCommits>({ operation: 'delivery:commits', projectId, milestoneId, cursor });
}
