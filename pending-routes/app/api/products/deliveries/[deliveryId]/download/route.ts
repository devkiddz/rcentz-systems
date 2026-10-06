import type {
  NextRequest
} from 'next/server';

import {
  NextResponse
} from 'next/server';

import {
  getCurrentUser
} from '@/features/auth/server/get-current-user';

import {
  prisma
} from '@/lib/prisma';

type DownloadRouteContext = {
  params: Promise<{
    deliveryId: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context:
    DownloadRouteContext
) {
  const user =
    await getCurrentUser();

  if (
    !user ||
    user.status !==
      'ACTIVE'
  ) {
    return NextResponse.json(
      {
        error:
          'Unauthorized'
      },
      {
        status: 401
      }
    );
  }

  const {
    deliveryId
  } = await context.params;

  const delivery =
    await prisma.digitalDelivery.findFirst({
      where: {
        id:
          deliveryId,

        orderItem: {
          order: {
            userId:
              user.id
          }
        }
      },

      select: {
        id: true,

        status: true,

        expiresAt:
          true,

        digitalProduct: {
          select: {
            downloadUrl:
              true
          }
        }
      }
    });

  if (!delivery) {
    return NextResponse.json(
      {
        error:
          'Digital delivery not found'
      },
      {
        status: 404
      }
    );
  }

  const downloadable =
    [
      'AVAILABLE',
      'DOWNLOADED'
    ].includes(
      String(
        delivery.status
      )
    );

  if (!downloadable) {
    return NextResponse.json(
      {
        error:
          'This delivery is not available for download'
      },
      {
        status: 409
      }
    );
  }

  const now =
    new Date();

  if (
    delivery.expiresAt &&
    delivery.expiresAt <
      now
  ) {
    return NextResponse.json(
      {
        error:
          'This download has expired'
      },
      {
        status: 410
      }
    );
  }

  const downloadUrl =
    delivery.digitalProduct
      .downloadUrl
      ?.trim();

  if (!downloadUrl) {
    return NextResponse.json(
      {
        error:
          'No downloadable file is configured'
      },
      {
        status: 404
      }
    );
  }

  let destination: URL;

  try {
    destination =
      new URL(
        downloadUrl,
        request.nextUrl.origin
      );
  } catch {
    return NextResponse.json(
      {
        error:
          'Invalid download destination'
      },
      {
        status: 500
      }
    );
  }

  if (
    destination.protocol !==
      'https:' &&
    destination.protocol !==
      'http:'
  ) {
    return NextResponse.json(
      {
        error:
          'Unsupported download destination'
      },
      {
        status: 500
      }
    );
  }

  await prisma.digitalDelivery.update({
    where: {
      id:
        delivery.id
    },

    data: {
      status:
        'DOWNLOADED',

      downloadCount: {
        increment: 1
      },

      lastDownloadedAt:
        now
    }
  });

  return NextResponse.redirect(
    destination,
    {
      status: 302
    }
  );
}