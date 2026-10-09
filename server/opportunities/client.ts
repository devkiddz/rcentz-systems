import 'server-only';
import { createHmac, randomUUID } from 'node:crypto';
import { requireFinderOwner } from './access';
const path = '/api/v1/internal/systems/opportunities';
export async function opportunityRequest<T>(payload: Record<string, unknown>): Promise<T> {
  const user = await requireFinderOwner();
  const secret = process.env.RCENTZ_SYSTEMS_API_SECRET;
  const base = process.env.RCENTZ_API_URL;
  if (!secret || secret.length < 32 || !base) throw new Error('Opportunity API connection is not configured.');
  const url = new URL(base);
  if (url.username || url.password || url.search || url.hash || (url.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' && url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)))) throw new Error('Invalid API connection.');
  const body = JSON.stringify(payload); const issuedAt = String(Date.now()); const nonce = randomUUID();
  const signature = createHmac('sha256', secret).update(JSON.stringify(['rcentz-api:v1', 'POST', path, 'systems', user.id, issuedAt, nonce, body])).digest('hex');
  const response = await fetch(new URL(path, url), { method: 'POST', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(payload.operation === 'collect' ? 65000 : 20000), headers: { 'Content-Type': 'application/json', 'x-rcentz-app': 'systems', 'x-rcentz-subject': user.id, 'x-rcentz-issued-at': issuedAt, 'x-rcentz-nonce': nonce, 'x-rcentz-signature': signature }, body });
  const value: unknown = await response.json();
  if (!response.ok || !value || typeof value !== 'object' || !('success' in value) || value.success !== true || !('data' in value)) throw new Error('Opportunity API unavailable or access not configured.');
  return value.data as T;
}
