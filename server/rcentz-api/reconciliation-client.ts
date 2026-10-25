import 'server-only';
import { createHmac, randomUUID } from 'node:crypto';
import { requireAdmin } from '@/features/auth/server/require-admin';

const path = '/api/v1/internal/systems/project-reconciliation';
type Candidate = {
  projectId: string; projectCode: string; sourceRepository: string; sourceBranch: string;
  mergeSha: string; prNumber: number; milestoneKey: string | null;
  disposition: 'REVIEW_REQUIRED' | 'BLOCKED' | 'UNMATCHED';
  reason: string; requiresApproval: true;
  evidence: {verifiedMerge: boolean; reason: string; classification: string} | null;
};
type Request = { operation: 'review'; sourceId: string; commitId: string; prNumber: number }
  | { operation: 'decide'; sourceId: string; commitId: string; prNumber: number;
      decision: 'APPROVE' | 'REJECT'; reason: string; targetDeliveryMilestoneId: string | null };
export type ReconciliationResult = {candidate: Candidate};
export async function reconciliationRequest<T>(payload: Request): Promise<T> {
  const user = await requireAdmin();
  if (user.role !== 'SUPER_ADMIN' || user.status !== 'ACTIVE') throw new Error('SUPER_ADMIN_REQUIRED');
  const secret = process.env.RCENTZ_SYSTEMS_API_SECRET;
  const baseValue = process.env.RCENTZ_API_URL;
  if (!secret || secret.length < 32 || !baseValue) throw new Error('API_NOT_CONFIGURED');
  const base = new URL(baseValue);
  if (base.username || base.password || base.search || base.hash ||
      (base.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' &&
        base.protocol === 'http:' && ['localhost','127.0.0.1'].includes(base.hostname))))
    throw new Error('INVALID_API_BASE');
  const body = JSON.stringify(payload);
  const issuedAt = String(Date.now()), nonce = randomUUID();
  const signature = createHmac('sha256', secret).update(JSON.stringify([
    'rcentz-api:v1','POST',path,'systems',user.id,issuedAt,nonce,body
  ])).digest('hex');
  const response = await fetch(new URL(path,base), {
    method:'POST',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(20000),
    headers: {'Content-Type':'application/json','x-rcentz-app':'systems',
      'x-rcentz-subject':user.id,'x-rcentz-issued-at':issuedAt,
      'x-rcentz-nonce':nonce,'x-rcentz-signature':signature},body
  });
  const envelope: unknown = await response.json();
  if (!response.ok || !envelope || typeof envelope !== 'object' ||
      !('success' in envelope) || envelope.success !== true || !('data' in envelope))
    throw new Error(response.status === 403 ? 'APP_PERMISSION_MISSING' : 'RECONCILIATION_REQUEST_REJECTED');
  return envelope.data as T;
}
