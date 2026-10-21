import 'server-only';
import { createHmac, randomUUID } from 'node:crypto';
import { requireAdmin } from '@/features/auth/server/require-admin';

const path = '/api/v1/internal/systems/project-governance';
import type { ProjectMilestoneMutationInput } from '@/features/admin/server/projects/project-milestone-actions';
export type GovernanceOperation =
  | {operation:'governance:read';projectId:string}
  | {operation:'milestone:create';input:ProjectMilestoneMutationInput}
  | {operation:'milestone:update';milestoneId:string;input:ProjectMilestoneMutationInput}
  | {operation:'milestone:delete';projectId:string;milestoneId:string}
  | {operation:'criterion:create';milestoneId:string;criterion:{title:string;description?:string|null;required:boolean;sortOrder:number}}
  | {operation:'criterion:update';milestoneId:string;criterionId:string;criterion:{title:string;description?:string|null;required:boolean;sortOrder:number}}
  | {operation:'criterion:verify';milestoneId:string;criterionId:string;verified:boolean;evidence:Record<string,unknown>|null}
  | {operation:'milestone:review';milestoneId:string;decision:'APPROVED'|'REJECTED';expectedRevision:number;reason?:string}
  | {operation:'project:override';projectId:string;percent:number;reason:string};

export async function governanceRequest<T>(payload: GovernanceOperation): Promise<T> {
  const user = await requireAdmin();
  const secret = process.env.RCENTZ_SYSTEMS_API_SECRET;
  const base = process.env.RCENTZ_API_URL;
  if (!secret || secret.length < 32 || !base) throw new Error('Governance API connection not configured');
  const url = new URL(base);
  if (url.username || url.password || url.search || url.hash ||
      (url.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' && url.protocol === 'http:' && ['localhost','127.0.0.1'].includes(url.hostname))))
    throw new Error('Invalid governance API connection');
  const body = JSON.stringify(payload);
  const issuedAt = String(Date.now());
  const nonce = randomUUID();
  const signature = createHmac('sha256', secret).update(JSON.stringify([
    'rcentz-api:v1', 'POST', path, 'systems', user.id, issuedAt, nonce, body,
  ])).digest('hex');
  const response = await fetch(new URL(path, url), {
    method: 'POST', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(20000),
    headers: { 'Content-Type': 'application/json', 'x-rcentz-app': 'systems',
      'x-rcentz-subject': user.id, 'x-rcentz-issued-at': issuedAt,
      'x-rcentz-nonce': nonce, 'x-rcentz-signature': signature }, body,
  });
  const value: unknown = await response.json();
  if (!response.ok || !value || typeof value !== 'object' || !('success' in value) || value.success !== true || !('data' in value))
    throw new Error('Governance API request rejected');
  return value.data as T;
}
