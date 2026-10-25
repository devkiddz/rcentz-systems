import 'server-only';

import { cache } from 'react';

import { prisma } from '@/lib/prisma';

const activeProjectStatuses = [
  'PLANNING',
  'DISCOVERY',
  'DESIGN',
  'DEVELOPMENT',
  'TESTING',
  'REVIEW',
  'DEPLOYMENT',
  'MAINTENANCE'
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

      label: 'At risk',

      reason:
        blockedMilestones > 0
          ? `${blockedMilestones} blocked milestone${
              blockedMilestones === 1
                ? ''
                : 's'
            }`
          : overdueMilestones > 0
            ? `${overdueMilestones} overdue milestone${
                overdueMilestones ===
                1
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

      label: 'Needs attention',

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

    label: 'On track',

    reason:
      'No immediate delivery risks detected'
  };
}

export const getActiveProjectMonitors =
  cache(async () => {
    const projects =
      await prisma.project.findMany({
        where: {
          status: {
            in: [
              ...activeProjectStatuses
            ]
          }
        },

        orderBy: {
          updatedAt: 'desc'
        },

        select: {
          id: true,
          name: true,
          description: true,
          slug: true,

          status: true,
          progress: true,

          expectedEndAt: true,
          updatedAt: true,

          client: {
            select: {
              name: true,
              image: true
            }
          },

          infrastructure: {
            select: {
              primaryDomain: true,
              hostingProvider: true,
              hostingRegion: true
            }
          },

          deliverySources: {
            select: {
              repository: true,
              branch: true
            },
            take: 1
          },

          media: {
            where: {
              mimeType: {
                startsWith: 'image/'
              }
            },

            orderBy: [
              {
                sortOrder: 'asc'
              },
              {
                createdAt: 'asc'
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
            orderBy: {
              sortOrder: 'asc'
            },

            select: {
              id: true,
              title: true,
              status: true,
              completionNotes: true,
              priority: true,
              progress: true,
              dueDate: true,
              completedAt: true,
              sortOrder: true
            }
          },

          tasks: {
            select: {
              id: true,
              status: true,
              priority: true,
              progress: true,
              dueDate: true
            }
          }
        }
      });

    const now = new Date();

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

    return projects.map(project => {
      const milestoneSummary = {
        total:
          project.milestones.length,

        completed: 0,
        inProgress: 0,
        review: 0,
        blocked: 0,
        planned: 0,
        cancelled: 0,
        overdue: 0,
        dueSoon: 0
      };

      for (const milestone of project.milestones) {
        switch (milestone.status) {
          case 'COMPLETED':
            milestoneSummary.completed +=
              1;
            break;

          case 'IN_PROGRESS':
            milestoneSummary.inProgress +=
              1;
            break;

          case 'REVIEW':
            milestoneSummary.review += 1;
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
          milestone.dueDate < now
        ) {
          milestoneSummary.overdue +=
            1;
        }

        if (
          milestoneIsActive &&
          milestone.dueDate &&
          milestone.dueDate >= now &&
          milestone.dueDate <=
            attentionWindowEnd
        ) {
          milestoneSummary.dueSoon +=
            1;
        }
      }

      const taskSummary = {
        total: project.tasks.length,
        completed: 0,
        open: 0,
        blocked: 0,
        review: 0
      };

      for (const task of project.tasks) {
        switch (task.status) {
          case 'COMPLETED':
            taskSummary.completed += 1;
            break;

          case 'BLOCKED':
            taskSummary.blocked += 1;
            break;

          case 'REVIEW':
            taskSummary.review += 1;
            break;

          case 'TODO':
          case 'IN_PROGRESS':
            taskSummary.open += 1;
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
        project.expectedEndAt !== null &&
        project.expectedEndAt < now;

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

      const pageSummary = {
        total: 0,
        healthy: 0,
        inProgress: 0,
        attention: 0,
        blocked: 0
      };

      const screenshot =
        project.media[0] ?? null;

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        slug: project.slug,

        status: project.status,
        progress: project.progress,

        expectedEndAt:
          project.expectedEndAt,

        updatedAt:
          project.updatedAt,

        client: project.client,

        screenshot,
        infrastructure: project.infrastructure,
        deliverySources: project.deliverySources,

        milestones:
          project.milestones.map(
            milestone => ({
              id: milestone.id,
              title: milestone.title,
              status: milestone.status,
              progress:
                milestone.progress
            })
          ),

        recentCompletedMilestones: project.milestones
          .filter(milestone =>
            milestone.status === 'COMPLETED' &&
            Boolean(milestone.completionNotes?.trim())
          )
          .sort((a, b) =>
            (b.completedAt?.getTime() ?? 0) -
            (a.completedAt?.getTime() ?? 0)
          )
          .slice(0, 5)
          .map(milestone => ({
            id: milestone.id,
            title: milestone.title,
            status: milestone.status,
            completionNotes: milestone.completionNotes,
            completedAt: milestone.completedAt
          })),

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
        }
      };
    });
  });

export type ActiveProjectMonitor =
  Awaited<
    ReturnType<
      typeof getActiveProjectMonitors
    >
  >[number];
