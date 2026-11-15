import 'server-only';

import { cache } from 'react';

import { prisma } from '@/lib/prisma';
import { PROJECT_DELETION_MARKER } from '@/features/projects/lib/deletion';

const clientVisible = [
  'CLIENT',
  'PUBLIC'
] as const;

const DAY_IN_MILLISECONDS =
  24 * 60 * 60 * 1000;

const ATTENTION_WINDOW_DAYS = 7;
const STALE_PROJECT_DAYS = 7;

type ProjectHealthStatus =
  | 'ON_TRACK'
  | 'ATTENTION'
  | 'AT_RISK';

function getProjectHealth({
  blockedMilestones,
  overdueMilestones,
  reviewMilestones,
  dueSoonMilestones,
  isProjectOverdue,
  isProjectStale
}: {
  blockedMilestones: number;
  overdueMilestones: number;
  reviewMilestones: number;
  dueSoonMilestones: number;
  isProjectOverdue: boolean;
  isProjectStale: boolean;
}) {
  if (
    blockedMilestones > 0 ||
    overdueMilestones > 0 ||
    isProjectOverdue
  ) {
    return {
      status:
        'AT_RISK' as ProjectHealthStatus,

      label:
        'At risk',

      reason:
        blockedMilestones > 0
          ? `${blockedMilestones} blocked milestone${
              blockedMilestones === 1
                ? ''
                : 's'
            }`
          : overdueMilestones > 0
            ? `${overdueMilestones} overdue milestone${
                overdueMilestones === 1
                  ? ''
                  : 's'
              }`
            : 'Project target date has passed'
    };
  }

  if (
    reviewMilestones > 0 ||
    dueSoonMilestones > 0 ||
    isProjectStale
  ) {
    return {
      status:
        'ATTENTION' as ProjectHealthStatus,

      label:
        'Needs attention',

      reason:
        reviewMilestones > 0
          ? `${reviewMilestones} milestone${
              reviewMilestones === 1
                ? ''
                : 's'
            } awaiting review`
          : dueSoonMilestones > 0
            ? `${dueSoonMilestones} milestone${
                dueSoonMilestones === 1
                  ? ''
                  : 's'
              } due soon`
            : 'Project has not been updated recently'
    };
  }

  return {
    status:
      'ON_TRACK' as ProjectHealthStatus,

    label:
      'On track',

    reason:
      'No immediate delivery risks detected'
  };
}

export const getClientProjectMonitors =
  cache(
    async (
      userId: string
    ) => {
      const projects =
        await prisma.project.findMany({
          where: {
            clientId: userId,
            processes: { none: { type: 'OTHER', impact: PROJECT_DELETION_MARKER, status: 'RESOLVED' } }
          },

          orderBy: {
            updatedAt: 'desc'
          },

          select: {
            id: true,
            name: true,
            slug: true,

            type: true,
            description: true,

            status: true,
            progress: true,

            expectedEndAt: true,
            updatedAt: true,

            infrastructure: {
              select: {
                primaryDomain: true
              }
            },

            analytics: {
              select: {
                sessions: true,
                pageViews: true,
                clicks: true,
                conversions: true,
                totalEvents: true,
                lastEventAt: true
              }
            },

            analyticsConfig: {
              select: {
                status: true,
                clientVisible: true,
                lastIngestedAt: true,
                lastAggregatedAt: true
              }
            },

            media: {
              where: {
                mimeType: {
                  startsWith:
                    'image/'
                }
              },

              orderBy: [
                {
                  sortOrder:
                    'asc'
                },
                {
                  createdAt:
                    'asc'
                }
              ],

              take: 1,

              select: {
                url: true,
                alt: true,
                caption: true
              }
            },

            milestones: {
              where: {
                visibility: {
                  in: [
                    ...clientVisible
                  ]
                }
              },

              orderBy: {
                sortOrder:
                  'asc'
              },

              select: {
                id: true,
                title: true,
                status: true,
                progress: true,
                dueDate: true
              }
            },

            tasks: {
              select: {
                id: true,
                status: true
              }
            },

            _count: {
              select: {
                features: true
              }
            }
          }
        });

      const now =
        new Date();

      const attentionWindowEnd =
        new Date(
          now.getTime() +
            ATTENTION_WINDOW_DAYS *
              DAY_IN_MILLISECONDS
        );

      const staleProjectThreshold =
        new Date(
          now.getTime() -
            STALE_PROJECT_DAYS *
              DAY_IN_MILLISECONDS
        );

      return projects.map(
        project => {
          const milestoneSummary = {
            total:
              project
                .milestones
                .length,

            completed: 0,
            inProgress: 0,
            review: 0,
            blocked: 0,
            planned: 0,
            cancelled: 0,
            overdue: 0,
            dueSoon: 0
          };

          for (
            const milestone of
            project.milestones
          ) {
            switch (
              milestone.status
            ) {
              case 'COMPLETED':
                milestoneSummary.completed +=
                  1;
                break;

              case 'IN_PROGRESS':
                milestoneSummary.inProgress +=
                  1;
                break;

              case 'REVIEW':
                milestoneSummary.review +=
                  1;
                break;

              case 'BLOCKED':
                milestoneSummary.blocked +=
                  1;
                break;

              case 'PLANNED':
                milestoneSummary.planned +=
                  1;
                break;

              case 'CANCELLED':
                milestoneSummary.cancelled +=
                  1;
                break;
            }

            const milestoneIsActive =
              milestone.status !==
                'COMPLETED' &&
              milestone.status !==
                'CANCELLED';

            if (
              milestoneIsActive &&
              milestone.dueDate &&
              milestone.dueDate <
                now
            ) {
              milestoneSummary.overdue +=
                1;
            }

            if (
              milestoneIsActive &&
              milestone.dueDate &&
              milestone.dueDate >=
                now &&
              milestone.dueDate <=
                attentionWindowEnd
            ) {
              milestoneSummary.dueSoon +=
                1;
            }
          }

          const taskSummary = {
            total:
              project.tasks
                .length,

            completed: 0,
            open: 0,
            blocked: 0,
            review: 0
          };

          for (
            const task of
            project.tasks
          ) {
            switch (
              task.status
            ) {
              case 'COMPLETED':
                taskSummary.completed +=
                  1;
                break;

              case 'BLOCKED':
                taskSummary.blocked +=
                  1;
                break;

              case 'REVIEW':
                taskSummary.review +=
                  1;
                break;

              case 'TODO':
              case 'IN_PROGRESS':
                taskSummary.open +=
                  1;
                break;
            }
          }

          const nextMilestone =
            project.milestones.find(
              milestone =>
                milestone.status !==
                  'COMPLETED' &&
                milestone.status !==
                  'CANCELLED'
            ) ?? null;

          const isProjectOverdue =
            project.expectedEndAt !==
              null &&
            project.expectedEndAt <
              now;

          const isProjectStale =
            project.updatedAt <
            staleProjectThreshold;

          const health =
            getProjectHealth({
              blockedMilestones:
                milestoneSummary.blocked,

              overdueMilestones:
                milestoneSummary.overdue,

              reviewMilestones:
                milestoneSummary.review,

              dueSoonMilestones:
                milestoneSummary.dueSoon,

              isProjectOverdue,
              isProjectStale
            });

          /*
           * Kept for compatibility
           * with ProjectMonitorCard
           * and other existing
           * consumers.
           */
          const pageSummary = {
            total: 0,
            healthy: 0,
            inProgress: 0,
            attention: 0,
            blocked: 0
          };

          const analyticsAvailable =
            project
              .analyticsConfig
              ?.clientVisible ===
            true;

          return {
            id:
              project.id,

            name:
              project.name,

            slug:
              project.slug,

            type:
              project.type,

            description:
              project.description,

            status:
              project.status,

            progress:
              project.progress,

            expectedEndAt:
              project.expectedEndAt,

            updatedAt:
              project.updatedAt,

            domain:
              project
                .infrastructure
                ?.primaryDomain ??
              null,

            screenshot:
              project.media[0] ??
              null,

            featureCount:
              project._count
                .features,

            milestones:
              project.milestones.map(
                milestone => ({
                  id:
                    milestone.id,

                  title:
                    milestone.title,

                  status:
                    milestone.status,

                  progress:
                    milestone.progress
                })
              ),

            milestoneSummary,
            taskSummary,
            pageSummary,

            nextMilestone:
              nextMilestone
                ? {
                    id:
                      nextMilestone.id,

                    title:
                      nextMilestone.title,

                    status:
                      nextMilestone.status,

                    progress:
                      nextMilestone.progress
                  }
                : null,

            health,

            deliverySignals: {
              isProjectOverdue,
              isProjectStale,

              overdueMilestones:
                milestoneSummary.overdue,

              dueSoonMilestones:
                milestoneSummary.dueSoon
            },

            analytics: {
              available:
                analyticsAvailable,

              status:
                project
                  .analyticsConfig
                  ?.status ??
                null,

              sessions:
                project
                  .analytics
                  ?.sessions ??
                0,

              pageViews:
                project
                  .analytics
                  ?.pageViews ??
                0,

              clicks:
                project
                  .analytics
                  ?.clicks ??
                0,

              conversions:
                project
                  .analytics
                  ?.conversions ??
                0,

              totalEvents:
                project
                  .analytics
                  ?.totalEvents ??
                0,

              lastEventAt:
                project
                  .analytics
                  ?.lastEventAt ??
                null,

              lastIngestedAt:
                project
                  .analyticsConfig
                  ?.lastIngestedAt ??
                null,

              lastAggregatedAt:
                project
                  .analyticsConfig
                  ?.lastAggregatedAt ??
                null
            }
          };
        }
      );
    }
  );

export type ClientProjectMonitor =
  Awaited<
    ReturnType<
      typeof getClientProjectMonitors
    >
  >[number];