import 'server-only';

type MirrorableEvent = {
  trackingKey: string;
  eventId: string;
  sessionKey: string;
  type: 'PAGE_VIEW' | 'CLICK';
  path: string;
  action?: string;
  referrerHost?: string;
};

export async function mirrorAnalyticsToIntelligence(origin: string, event: MirrorableEvent) {
  const base = process.env.RCENTZ_OBSERVABILITY_API_URL ?? process.env.RCENTZ_API_URL;
  if (!base) return;
  try {
    const url = new URL('/api/v1/intelligence/analytics', base);
    const localHttp = process.env.NODE_ENV !== 'production' && url.protocol === 'http:' && ['localhost','127.0.0.1'].includes(url.hostname);
    if ((url.protocol !== 'https:' && !localHttp) || url.username || url.password) return;
    await fetch(url, {
      method: 'POST',
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(5000),
      headers: { 'Content-Type': 'application/json', Origin: origin },
      body: JSON.stringify({ ...event, occurredAt: new Date().toISOString() })
    });
  } catch {
    // The local analytics transaction remains authoritative while SDK delivery is unavailable.
  }
}
