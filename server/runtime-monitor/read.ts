import 'server-only';
export type RuntimeMetrics = { requests?: { label: string; value: number; points: number[] }; functions?: { label: string; value: number; points: number[] }; errors?: { label: string; value: number; unit: string; points: number[] } };
export async function readProjectRuntimeMetrics(projectId: string): Promise<RuntimeMetrics | undefined> {
  const base = process.env.RCENTZ_OBSERVABILITY_API_URL;
  const token = process.env.RCENTZ_OBSERVABILITY_READ_TOKEN;
  if (!base || !token || token.length < 32) return undefined;
  try {
    const url = new URL('/api/v1/monitoring/read', base);
    if (url.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' && url.hostname === 'localhost')) return undefined;
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-rm01-read-token': token }, body: JSON.stringify({ projectId, hours: 6 }), cache: 'no-store', signal: AbortSignal.timeout(4500) });
    if (!response.ok) return undefined;
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== 'object' || !('buckets' in payload) || !Array.isArray(payload.buckets)) return undefined;
    const buckets = payload.buckets.filter((b): b is { requests: number; errors: number; functions: number } => Boolean(b && typeof b === 'object' && Number.isFinite(b.requests) && Number.isFinite(b.errors) && Number.isFinite(b.functions) && b.requests >= 0 && b.errors >= 0 && b.functions >= 0));
    if (!buckets.length) return undefined;
    const sum = (key: 'requests'|'errors'|'functions') => buckets.reduce((n,b) => n + b[key], 0);
    const requests = sum('requests'), errors = sum('errors'), functions = sum('functions');
    return { requests: { label: 'Instrumented requests', value: requests, points: buckets.map(b=>b.requests) }, functions: { label: 'Instrumented function calls', value: functions, points: buckets.map(b=>b.functions) }, errors: { label: 'Instrumented error rate', value: requests ? Number((errors / requests * 100).toFixed(2)) : 0, unit: '%', points: buckets.map(b=> b.requests ? Number((b.errors/b.requests*100).toFixed(2)) : 0) } };
  } catch { return undefined; }
}
