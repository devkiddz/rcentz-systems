import 'server-only';

import { cache } from 'react';

import { prisma } from '@/lib/prisma';

const ANALYTICS_WINDOW_DAYS = 30;

function getDateKeyForTimeZone({
  date,
  timeZone
}: {
  date: Date;
  timeZone: string;
}) {
  const formatter =
    new Intl.DateTimeFormat(
      'en-US',
      {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }
    );

  const parts =
    formatter.formatToParts(
      date
    );

  const values =
    new Map(
      parts.map(part => [
        part.type,
        part.value
      ])
    );

  const year =
    values.get('year');

  const month =
    values.get('month');

  const day =
    values.get('day');

  if (
    !year ||
    !month ||
    !day
  ) {
    throw new Error(
      'Could not resolve analytics calendar date.'
    );
  }

  return `${year}-${month}-${day}`;
}

function dateKeyToDate(
  dateKey: string
) {
  return new Date(
    `${dateKey}T00:00:00.000Z`
  );
}

function dateToDateKey(
  date: Date
) {
  return date
    .toISOString()
    .slice(0, 10);
}

function addDays(
  dateKey: string,
  amount: number
) {
  const date =
    dateKeyToDate(
      dateKey
    );

  date.setUTCDate(
    date.getUTCDate() +
      amount
  );

  return dateToDateKey(
    date
  );
}

function buildDateWindow(
  timeZone: string
) {
  const todayKey =
    getDateKeyForTimeZone({
      date: new Date(),
      timeZone
    });

  return Array.from(
    {
      length:
        ANALYTICS_WINDOW_DAYS
    },
    (_, index) =>
      addDays(
        todayKey,
        index -
          (
            ANALYTICS_WINDOW_DAYS -
            1
          )
      )
  );
}

function formatDateLabel(
  dateKey: string
) {
  return new Intl.DateTimeFormat(
    'en',
    {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    }
  ).format(
    dateKeyToDate(
      dateKey
    )
  );
}

function createEmptySummary() {
  return {
    sessions: 0,

    /*
     * Anonymous visitor identity is not implemented yet.
     * Do not present a fake value to clients.
     */
    uniqueVisitors: null as number | null,

    pageViews: 0,
    projectViews: 0,
    productViews: 0,
    serviceViews: 0,

    searches: 0,
    clicks: 0,

    reactions: 0,
    comments: 0,
    shares: 0,
    downloads: 0,

    addToCarts: 0,
    removeFromCarts: 0,

    checkoutStarted: 0,
    purchases: 0,

    serviceRequests: 0,

    signUps: 0,
    logins: 0,

    conversions: 0,

    totalEvents: 0,

    lastEventAt: null as Date | null
  };
}

export const getClientProjectAnalytics =
  cache(
    async ({
      userId,
      projectId
    }: {
      userId: string;
      projectId: string;
    }) => {
      /*
       * Ownership is checked here again even though
       * the route already fetches the client project.
       *
       * The analytics engine must remain safe when
       * reused independently later.
       */
      const project =
        await prisma.project.findFirst({
          where: {
            id: projectId,
            clientId: userId
          },

          select: {
            id: true,
            slug: true,

            analyticsConfig: {
              select: {
                status: true,
                allowedOrigins: true,
                clientVisible: true,
                timezone: true,
                startedAt: true,
                endedAt: true,
                lastIngestedAt: true,
                lastAggregatedAt: true
              }
            }
          }
        });

      if (!project) {
        return null;
      }

      const config =
        project.analyticsConfig;

      if (!config) {
        return {
          available:
            false as const,

          reason:
            'NOT_CONFIGURED' as const
        };
      }

      if (
        !config.clientVisible
      ) {
        return {
          available:
            false as const,

          reason:
            'CLIENT_HIDDEN' as const
        };
      }

      const dateWindow =
        buildDateWindow(
          config.timezone
        );

      const firstDate =
        dateKeyToDate(
          dateWindow[0]
        );

      const lastDate =
        dateKeyToDate(
          dateWindow[
            dateWindow.length -
              1
          ]
        );

      const [
        summaryRecord,
        dailyRecords,
        activeGoals,
        sourceRecords
      ] =
        await Promise.all([
          prisma.projectAnalytics.findUnique({
            where: {
              projectId
            },

            select: {
              sessions: true,
              uniqueVisitors: true,

              pageViews: true,
              projectViews: true,
              productViews: true,
              serviceViews: true,

              searches: true,
              clicks: true,

              reactions: true,
              comments: true,
              shares: true,
              downloads: true,

              addToCarts: true,
              removeFromCarts: true,

              checkoutStarted: true,
              purchases: true,

              serviceRequests: true,

              signUps: true,
              logins: true,

              conversions: true,

              totalEvents: true,

              lastEventAt: true
            }
          }),

          prisma.projectAnalyticsDaily.findMany({
            where: {
              projectId,

              date: {
                gte: firstDate,
                lte: lastDate
              }
            },

            orderBy: {
              date: 'asc'
            },

            select: {
              date: true,

              sessions: true,
              pageViews: true,
              clicks: true,
              conversions: true,
              totalEvents: true
            }
          }),

          prisma.projectAnalyticsGoal.count({
            where: { projectId, active: true }
          }),
          prisma.$queryRaw<Array<{ source: string; views: bigint }>>`SELECT COALESCE(metadata->>'referrerHost', 'direct') AS source, COUNT(*) AS views FROM "AnalyticsEvent" WHERE "projectId" = ${projectId} AND type = 'PAGE_VIEW' AND ("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${config.timezone})::date >= ${firstDate}::date GROUP BY source ORDER BY views DESC LIMIT 5`
        ]);

      const emptySummary =
        createEmptySummary();

      const summary =
        summaryRecord
          ? {
              ...summaryRecord,

              /*
               * Until visitorKey exists in the tracker,
               * this metric is intentionally unavailable.
               */
              uniqueVisitors:
                null as number | null
            }
          : emptySummary;

      const dailyByDate =
        new Map(
          dailyRecords.map(
            record => [
              dateToDateKey(
                record.date
              ),
              record
            ]
          )
        );

      const daily =
        dateWindow.map(
          dateKey => {
            const record =
              dailyByDate.get(
                dateKey
              );

            return {
              date:
                dateKey,

              label:
                formatDateLabel(
                  dateKey
                ),

              sessions:
                record
                  ?.sessions ??
                0,

              pageViews:
                record
                  ?.pageViews ??
                0,

              clicks:
                record
                  ?.clicks ??
                0,

              conversions:
                record
                  ?.conversions ??
                0,

              totalEvents:
                record
                  ?.totalEvents ??
                0
            };
          }
        );

      return {
        available:
          true as const,

        collection: {
          sample: project.slug === 'demo-dennis-portfolio-complete-v1' && config.allowedOrigins.length === 0 && config.status === 'PAUSED',
          status:
            config.status,

          timezone:
            config.timezone,

          startedAt:
            config.startedAt,

          endedAt:
            config.endedAt,

          lastIngestedAt:
            config.lastIngestedAt,

          lastAggregatedAt:
            config.lastAggregatedAt
        },

        activeGoals,
        sources: sourceRecords.map(row => ({ source: row.source, views: Number(row.views) })),

        summary,

        daily
      };
    }
  );

export type ClientProjectAnalytics =
  NonNullable<
    Awaited<
      ReturnType<
        typeof getClientProjectAnalytics
      >
    >
  >;