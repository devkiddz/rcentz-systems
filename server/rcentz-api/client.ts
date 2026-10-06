import 'server-only';

export class RcentzApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'RcentzApiError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getApiBaseUrl() {
  const apiUrl = process.env.RCENTZ_API_URL;

  if (!apiUrl) {
    throw new Error('RCENTZ_API_URL is not configured');
  }

  return apiUrl.replace(/\/$/, '');
}

export async function rcentzApiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: {
      Accept: 'application/json',
    },
    next: {
      revalidate: 300,
    },
    signal: AbortSignal.timeout(20_000),
  });

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new RcentzApiError(
      'Rcentz API returned an invalid response',
      response.status,
      'INVALID_RESPONSE',
    );
  }

  if (!response.ok || !isRecord(payload) || payload.success !== true) {
    const error =
      isRecord(payload) && isRecord(payload.error)
        ? payload.error
        : null;

    throw new RcentzApiError(
      typeof error?.message === 'string'
        ? error.message
        : 'Rcentz API request failed',
      response.status,
      typeof error?.code === 'string'
        ? error.code
        : 'REQUEST_FAILED',
    );
  }

  if (!('data' in payload)) {
    throw new RcentzApiError(
      'Rcentz API returned an invalid response',
      response.status,
      'INVALID_RESPONSE',
    );
  }

  return payload.data as T;
}
