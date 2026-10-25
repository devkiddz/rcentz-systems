import 'server-only';

import {
  cache
} from 'react';

import {
  prisma
} from '@/lib/prisma';

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

export const getAdminProjects =
  cache(async () => {
    const rawProjects =
      await prisma.project.findMany({
        orderBy: [
          {
            updatedAt: 'desc'
          },
          {
            createdAt: 'desc'
          }
        ],

        select: {
          id: true,

          name: true,
          slug: true,

          description: true,

          type: true,
          status: true,
          visibility: true,

          progress: true,

          startedAt: true,
          expectedEndAt: true,
          completedAt: true,

          createdAt: true,
          updatedAt: true,

          client: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,

              clientProfile: {
                select: {
                  companyName: true
                }
              }
            }
          },

          portfolio: {
            select: {
              liveUrl: true,
              publishedAt: true
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
              status: {
                not:
                  'CANCELLED'
              }
            },
            orderBy: [
              { sortOrder: 'asc' },
              { createdAt: 'asc' }
            ],
            select: {
              id: true,
              title: true,
              status: true,
              progress: true
            }
          },

          _count: {
            select: {
              deliverables: true,
              features: true,
              tasks: true,
              updates: true
            }
          }
        }
      });

    const projects =
      rawProjects.map(
        project => {
          const completed =
            project.milestones.filter(
              milestone => {
                return (
                  milestone.status ===
                  'COMPLETED'
                );
              }
            ).length;

          const active =
            project.milestones.filter(
              milestone => {
                return (
                  milestone.status ===
                    'IN_PROGRESS' ||
                  milestone.status ===
                    'REVIEW' ||
                  milestone.status ===
                    'BLOCKED'
                );
              }
            ).length;

          const remaining =
            project.milestones.filter(
              milestone => {
                return (
                  milestone.status ===
                  'PLANNED'
                );
              }
            ).length;

          const {
            milestones,
            media,
            ...projectData
          } = project;

          return {
            ...projectData,

            screenshot:
              media[0] ?? null,

            // Display canonical milestone records; counts alone hide their identity.
            milestonePreview: milestones.map(milestone => ({
              id: milestone.id,
              title: milestone.title,
              status: milestone.status,
              progress: milestone.progress
            })),

            milestoneHealth: {
              completed,
              active,
              remaining,
              total:
                milestones.length
            }
          };
        }
      );

    const summary = {
      total:
        projects.length,

      active:
        projects.filter(
          project => {
            return activeProjectStatuses.includes(
              project.status as (typeof activeProjectStatuses)[number]
            );
          }
        ).length,

      completed:
        projects.filter(
          project => {
            return (
              project.status ===
              'COMPLETED'
            );
          }
        ).length,

      onHold:
        projects.filter(
          project => {
            return (
              project.status ===
              'ON_HOLD'
            );
          }
        ).length,

      unassigned:
        projects.filter(
          project => {
            return (
              project.client ===
              null
            );
          }
        ).length
    };

    return {
      projects,
      summary
    };
  });

export type AdminProjectsData =
  Awaited<
    ReturnType<
      typeof getAdminProjects
    >
  >;

export type AdminProjectListItem =
  AdminProjectsData['projects'][number];