import 'server-only';
import { randomUUID } from 'node:crypto';

/** Best-effort, anonymous aggregated measurement for instrumented server routes. */
export async function sendRuntimeMeasurement(route: string, durationMs: number, status: number): Promise<void> {
  const endpoint = process.env.RCENTZ_OBSERVABILITY_API_URL;
  const id = process.env.RCENTZ_OBSERVABILITY_SOURCE_ID;
  const token = process.env.RCENTZ_OBSERVABILITY_SOURCE_TOKEN;
  if (!endpoint || !id || !token) return;
  try {
    const url = new URL('/api/v1/monitoring/ingest', endpoint);
    if (url.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' && url.hostname === 'localhost')) return;
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-rm01-source': id, 'x-rm01-token': token }, body: JSON.stringify({ batchId: randomUUID(), route, timestamp: new Date().toISOString(), requests: 1, errors: status >= 500 ? 1 : 0, functions: 1, durationMs: Math.max(0,Math.round(durationMs)) }), cache: 'no-store', signal: AbortSignal.timeout(2200) });
  } catch { /* Monitoring must never break the application. */ }
}
export function observeRoute(route: string, handler: (request: Request) => Promise<Response>) {
  return async function observed(request: Request): Promise<Response> {
    const started = performance.now();
    let status = 500;
    try { const response = await handler(request); status = response.status; return response; }
    finally {
      const duration = performance.now() - started;
      const { after } = await import('next/server');
      after(async () => { await sendRuntimeMeasurement(route, duration, status); });
    }
  };
}
