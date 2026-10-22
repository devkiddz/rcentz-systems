import 'server-only';
import { createHmac, randomUUID } from 'node:crypto';
import { requireAdmin } from '@/features/auth/server/require-admin';

const path = '/api/v1/internal/systems/delivery-sources';
export type RegisteredSource = { id: string; repository: string; branch: string; enabled: boolean; cursorSha: string; lastSyncedAt: string | null; lastError: string | null };
export type SourceOperation =
  | { operation: 'list'; projectId: string }
  | { operation: 'register'; projectId: string; repository: string; branch: string; requiredChecks: string[]; vercelProjectId: string | null; vercelTeamId: string | null }
  | { operation: 'disable' | 'enable'; projectId: string; sourceId: string };

export async function deliverySourceRequest<T>(payload: SourceOperation): Promise<T> {
  const user = await requireAdmin();
  if (user.role !== 'SUPER_ADMIN') throw new Error('Source management requires super-admin access.');
  const secret = process.env.RCENTZ_SYSTEMS_API_SECRET;
  const base = process.env.RCENTZ_API_URL;
  if (!secret || secret.length < 32 || !base) throw new Error('Rcentz API connection is not configured.');
  const url = new URL(base);
  if (url.username || url.password || url.search || url.hash ||
      (url.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' && url.protocol === 'http:' && ['localhost','127.0.0.1'].includes(url.hostname))))
    throw new Error('Invalid API connection.');
  const body = JSON.stringify(payload);
  const issuedAt = String(Date.now());
  const nonce = randomUUID();
  const signature = createHmac('sha256', secret).update(JSON.stringify([
    'rcentz-api:v1', 'POST', path, 'systems', user.id, issuedAt, nonce, body,
  ])).digest('hex');
  const response = await fetch(new URL(path, url), {
    method: 'POST', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(20000),
    headers: { 'Content-Type': 'application/json', 'x-rcentz-app': 'systems', 'x-rcentz-subject': user.id,
      'x-rcentz-issued-at': issuedAt, 'x-rcentz-nonce': nonce, 'x-rcentz-signature': signature }, body,
  });
  const result: unknown = await response.json();
  if (!response.ok || !result || typeof result !== 'object' || !('success' in result) || result.success !== true || !('data' in result)) {
    const error = result && typeof result === 'object' && 'error' in result ? result.error : null;
    const detail = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
      ? error.message : 'Source operation failed. Check API connectivity and authorization.';
    throw new Error(detail);
  }
  return result.data as T;
}
