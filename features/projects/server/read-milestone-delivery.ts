'use server';
import { createHmac, randomUUID } from 'node:crypto';
import { getCurrentUser } from '@/features/auth/server/get-current-user';
export type DeliveryActivityEvent = {
  id: string; sha: string; message: string; committedAt: string;
  milestoneKey: string | null;
  kind: 'milestone-start' | 'milestone-complete' | 'milestone-seal' | 'milestone-reopen' | 'milestone-cancel' | 'release' | 'commit';
  candidateKey: string | null; version: string | null; prerelease: boolean; issue: string | null;
};
export type MilestoneDelivery = {
  managed: boolean; phase: string | null; repository: string | null; branch: string | null;
  commits: Array<{ id: string; sha: string; message: string; committedAt: string }>;
  /** B2 API fields: privileged, optional until the API is deployed. */
  activityTimeline?: DeliveryActivityEvent[];
  activityTimelineTruncated?: boolean;
  sourceId?: string;
  targetDeliveryMilestoneId?: string;
  unassignedActivity?: Array<{id:string;sha:string;message:string;committedAt:string;issue:string|null}>;
  nextCursor: string | null;
  evidence: { checks: Array<{ name: string; state: string }>; deployment: { id: string; state: string; url: string | null } | null; observedAt: string } | null;
};
export async function readMilestoneDelivery(projectId: string, milestoneId: string, cursor?: string): Promise<{ data: MilestoneDelivery | null; error: string | null }> {
  const valid = (x: unknown) => typeof x === 'string' && /^[a-zA-Z0-9:_-]{1,160}$/.test(x);
  if (!valid(projectId) || !valid(milestoneId) || (cursor !== undefined && !valid(cursor))) return { data: null, error: 'Invalid project or milestone.' };
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== 'ACTIVE') throw new Error('Authentication required');
    const secret = process.env.RCENTZ_SYSTEMS_API_SECRET, base = process.env.RCENTZ_API_URL;
    if (!secret || secret.length < 32 || !base) throw new Error('Connection unavailable');
    const url = new URL(base), path = '/api/v1/internal/systems/project-delivery';
    if (url.username || url.password || url.search || url.hash || (url.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' && url.protocol === 'http:' && ['localhost','127.0.0.1'].includes(url.hostname)))) throw new Error('Invalid connection');
    const body = JSON.stringify({ projectId, milestoneId, cursor }), issuedAt = String(Date.now()), nonce = randomUUID();
    const signature = createHmac('sha256', secret).update(JSON.stringify(['rcentz-api:v1','POST',path,'systems',user.id,issuedAt,nonce,body])).digest('hex');
    const response = await fetch(new URL(path, url), { method: 'POST', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000),
      headers: { 'Content-Type': 'application/json', 'x-rcentz-app': 'systems', 'x-rcentz-subject': user.id, 'x-rcentz-issued-at': issuedAt, 'x-rcentz-nonce': nonce, 'x-rcentz-signature': signature }, body });
    const result = await response.json();
    if (!response.ok || result?.success !== true || !Array.isArray(result.data?.commits)) throw new Error('Read rejected');
    return { data: result.data as MilestoneDelivery, error: null };
  } catch { return { data: null, error: 'Commit activity is unavailable. Please retry or contact your project administrator.' }; }
}
