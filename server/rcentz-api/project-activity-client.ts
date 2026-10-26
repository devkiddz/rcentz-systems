
import 'server-only';

import { createHmac, randomUUID } from 'node:crypto';
import { requireAdmin } from '@/features/auth/server/require-admin';

const endpoint = '/api/v1/internal/systems/project-activity-summary';

export type ProjectActivityEntry = {
  sha: string;
  message: string;
  committedAt: string;
  repository: string;
  branch: string;
};

export type ProjectMilestoneActivity = ProjectActivityEntry & {
  kind: 'start' | 'complete' | 'reopen' | 'cancel' | 'seal';
  milestoneKey: string;
  verification: 'NOT_EVALUATED';
};

export type ProjectActivitySummary = {
  projectId: string;
  state:
    | 'NO_SOURCE'
    | 'SOURCE_LIMIT_EXCEEDED'
    | 'AWAITING_SYNC'
    | 'SYNC_ERROR'
    | 'SYNCED'
    | 'UNAVAILABLE';
  verification: 'NOT_EVALUATED';
  latestCommit: ProjectActivityEntry | null;
  latestMilestoneEvent: ProjectMilestoneActivity | null;
  milestoneEvents?: ProjectMilestoneActivity[];
};

type ApiResponse = {
  projects: ProjectActivitySummary[];
};

function unavailable(projectId: string): ProjectActivitySummary {
  return {
    projectId,
    state: 'UNAVAILABLE',
    verification: 'NOT_EVALUATED',
    latestCommit: null,
    latestMilestoneEvent: null
  };
}

async function readBatch(
  ids: string[],
  userId: string,
  base: URL,
  secret: string
): Promise<ProjectActivitySummary[]> {
  const body = JSON.stringify({ projectIds: ids });
  const issuedAt = String(Date.now());
  const nonce = randomUUID();

  const signature = createHmac('sha256', secret)
    .update(
      JSON.stringify([
        'rcentz-api:v1',
        'POST',
        endpoint,
        'systems',
        userId,
        issuedAt,
        nonce,
        body
      ])
    )
    .digest('hex');

  const response = await fetch(new URL(endpoint, base), {
    method: 'POST',
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(20000),
    headers: {
      'Content-Type': 'application/json',
      'x-rcentz-app': 'systems',
      'x-rcentz-subject': userId,
      'x-rcentz-issued-at': issuedAt,
      'x-rcentz-nonce': nonce,
      'x-rcentz-signature': signature
    },
    body
  });

  if (!response.ok) {
    throw new Error(
      `Activity API returned HTTP ${response.status}`
    );
  }

  const envelope: unknown = await response.json();

  if (
    !envelope ||
    typeof envelope !== 'object' ||
    !('success' in envelope) ||
    envelope.success !== true ||
    !('data' in envelope) ||
    !envelope.data ||
    typeof envelope.data !== 'object' ||
    !('projects' in envelope.data) ||
    !Array.isArray(envelope.data.projects)
  ) {
    throw new Error('Invalid activity API response');
  }

  return (envelope.data as ApiResponse).projects;
}

export async function readProjectActivitySummaries(
  projectIds: string[]
): Promise<Record<string, ProjectActivitySummary>> {
  if (!projectIds.length) {
    return {};
  }

  const user = await requireAdmin();
  const secret = process.env.RCENTZ_SYSTEMS_API_SECRET;
  const baseValue = process.env.RCENTZ_API_URL;

  const result: Record<string, ProjectActivitySummary> = {};

  for (const id of projectIds) {
    result[id] = unavailable(id);
  }

  if (!secret || secret.length < 32 || !baseValue) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        '[PMC-01 activity request] Missing or invalid API configuration'
      );
    }

    return result;
  }

  let base: URL;

  try {
    base = new URL(baseValue);

    const validHttps = base.protocol === 'https:';

    const validLocalHttp =
      process.env.NODE_ENV !== 'production' &&
      base.protocol === 'http:' &&
      ['localhost', '127.0.0.1'].includes(base.hostname);

    if (
      base.username ||
      base.password ||
      base.search ||
      base.hash ||
      (!validHttps && !validLocalHttp)
    ) {
      throw new Error('Invalid API URL');
    }
  } catch {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        '[PMC-01 activity request] Invalid RCENTZ_API_URL'
      );
    }

    return result;
  }

  // The API accepts at most 20 project IDs per request.
  // Sequential batches avoid overwhelming project detail pages.
  for (let i = 0; i < projectIds.length; i += 20) {
    const ids = projectIds.slice(i, i + 20);

    try {
      const summaries = await readBatch(
        ids,
        user.id,
        base,
        secret
      );

      const expected = new Set(ids);

      for (const item of summaries) {
        if (item && expected.has(item.projectId)) {
          result[item.projectId] = item;
        }
      }
    } catch (error) {
      // Activity failures must not break the project register.
      // Only log safe diagnostics during local development.
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          '[PMC-01 activity request]',
          error instanceof Error
            ? error.message
            : 'Unknown activity request error'
        );
      }
    }
  }

  return result;
}
