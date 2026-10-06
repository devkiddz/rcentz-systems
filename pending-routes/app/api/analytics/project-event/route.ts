import {
  NextRequest,
  NextResponse
} from 'next/server';

import {
  collectProjectAnalyticsEvent,
  parseProjectAnalyticsEventPayload
} from '@/features/analytics/server/collector/collect-project-event';

const MAX_REQUEST_SIZE = 32_768;

function createCorsHeaders(
  origin: string | null
) {
  const headers =
    new Headers();

  headers.set(
    'Access-Control-Allow-Methods',
    'POST, OPTIONS'
  );

  headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type'
  );

  headers.set(
    'Access-Control-Max-Age',
    '600'
  );

  headers.set(
    'Vary',
    'Origin'
  );

  /*
   * OPTIONS cannot validate the project configuration because
   * the tracking key arrives with the POST payload.
   *
   * The actual POST request performs the authoritative
   * allowedOrigins check before anything is persisted.
   */
  if (origin) {
    headers.set(
      'Access-Control-Allow-Origin',
      origin
    );
  }

  return headers;
}

export async function OPTIONS(
  request: NextRequest
) {
  const origin =
    request.headers.get('origin');

  return new NextResponse(
    null,
    {
      status: 204,
      headers:
        createCorsHeaders(origin)
    }
  );
}

export async function POST(
  request: NextRequest
) {
  const origin =
    request.headers.get('origin');

  const corsHeaders =
    createCorsHeaders(origin);

  if (!origin) {
    return NextResponse.json(
      {
        error:
          'Analytics requests require an origin.'
      },
      {
        status: 403,
        headers: corsHeaders
      }
    );
  }

  const contentType =
    request.headers.get(
      'content-type'
    );

  if (
    !contentType
      ?.toLowerCase()
      .includes(
        'application/json'
      )
  ) {
    return NextResponse.json(
      {
        error:
          'Content-Type must be application/json.'
      },
      {
        status: 415,
        headers: corsHeaders
      }
    );
  }

  const contentLengthHeader =
    request.headers.get(
      'content-length'
    );

  if (contentLengthHeader) {
    const contentLength =
      Number(
        contentLengthHeader
      );

    if (
      Number.isFinite(
        contentLength
      ) &&
      contentLength >
        MAX_REQUEST_SIZE
    ) {
      return NextResponse.json(
        {
          error:
            'Analytics payload is too large.'
        },
        {
          status: 413,
          headers:
            corsHeaders
        }
      );
    }
  }

  let requestBody: unknown;

  try {
    requestBody =
      await request.json();
  } catch {
    return NextResponse.json(
      {
        error:
          'Invalid JSON request body.'
      },
      {
        status: 400,
        headers: corsHeaders
      }
    );
  }

  const parsedPayload =
    parseProjectAnalyticsEventPayload(
      requestBody
    );

  if (!parsedPayload.ok) {
    return NextResponse.json(
      {
        error:
          parsedPayload.error
      },
      {
        status: 400,
        headers: corsHeaders
      }
    );
  }

  try {
    const result =
      await collectProjectAnalyticsEvent({
        payload:
          parsedPayload.data,
        origin
      });

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error
        },
        {
          status:
            result.status,
          headers:
            corsHeaders
        }
      );
    }

    return NextResponse.json(
      {
        accepted: true,

        eventId:
          result.eventId
      },
      {
        status: 202,
        headers: corsHeaders
      }
    );
  } catch (error) {
    console.error(
      '[analytics:collector]',
      error
    );

    return NextResponse.json(
      {
        error:
          'Analytics event could not be collected.'
      },
      {
        status: 500,
        headers: corsHeaders
      }
    );
  }
}