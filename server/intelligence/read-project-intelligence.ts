import 'server-only';

export type IntelligenceGroup = { kind: string; featureKey: string | null; name: string; count: number };
export type IntelligenceAnalytics = { sessions: number; pageViews: number; clicks: number; routes: number };
export type ProjectIntelligence = { projectId: string; hours: 6 | 24 | 168; total: number; lastRecordedAt: string | null; groups: IntelligenceGroup[]; analytics: IntelligenceAnalytics };

export async function readProjectIntelligence(projectId: string, hours: 6 | 24 | 168 = 24): Promise<ProjectIntelligence | null> {
  const base = process.env.RCENTZ_OBSERVABILITY_API_URL ?? process.env.RCENTZ_API_URL;
  const token = process.env.RCENTZ_OBSERVABILITY_READ_TOKEN;
  if (!base || !token || token.length < 32) return null;
  try {
    const url = new URL('/api/v1/intelligence/read', base);
    const valid = url.protocol === 'https:' || (process.env.NODE_ENV !== 'production' && url.protocol === 'http:' && ['localhost','127.0.0.1'].includes(url.hostname));
    if (!valid || url.username || url.password) return null;
    const response = await fetch(url, {
      method: 'POST', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(6000),
      headers: { 'Content-Type': 'application/json', 'x-rm01-read-token': token },
      body: JSON.stringify({ projectId, hours })
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    const value = data as Record<string,unknown>;
    if (value.projectId !== projectId || value.hours !== hours || typeof value.total !== 'number' || !Number.isSafeInteger(value.total) || !Array.isArray(value.groups)) return null;
    if (value.lastRecordedAt !== null && typeof value.lastRecordedAt !== 'string') return null;
    const groups: IntelligenceGroup[] = [];
    for (const item of value.groups) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
      const group = item as Record<string,unknown>;
      if (!['analytics','feature','performance','runtime'].includes(String(group.kind)) || typeof group.name !== 'string' || (group.featureKey !== null && typeof group.featureKey !== 'string') || typeof group.count !== 'number' || !Number.isSafeInteger(group.count) || group.count < 0) return null;
      groups.push({kind:group.kind as string,name:group.name,featureKey:group.featureKey as string|null,count:group.count});
    }
    if (!value.analytics || typeof value.analytics !== 'object' || Array.isArray(value.analytics)) return null;
    const analyticsValue = value.analytics as Record<string,unknown>;
    const analytics = { sessions: analyticsValue.sessions, pageViews: analyticsValue.pageViews, clicks: analyticsValue.clicks, routes: analyticsValue.routes };
    if (Object.values(analytics).some(item => typeof item !== 'number' || !Number.isSafeInteger(item) || item < 0)) return null;
    return { projectId, hours, total: value.total, lastRecordedAt: value.lastRecordedAt as string|null, groups, analytics: analytics as IntelligenceAnalytics };
  } catch { return null; }
}
