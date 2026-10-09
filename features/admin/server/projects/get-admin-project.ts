import 'server-only';

import {
  cache
} from 'react';

import {
  prisma
} from '@/lib/prisma';

export const getAdminProject =
  cache(
    async (
      projectId: string
    ) => {
      return prisma.project.findUnique({
        where: {
          id: projectId
        },

        select: {
          id: true,

          name: true,
          slug: true,

          description: true,
          purpose: true,
          vision: true,
          expectedOutcome: true,

          type: true,
          status: true,
          visibility: true,

          progress: true,

          budget: true,
          currency: true,

          startedAt: true,
          expectedEndAt: true,
          completedAt: true,

          createdAt: true,
          updatedAt: true,

          serviceRequest: { select: { id: true, status: true } },

          client: {
            select: {
              id: true,

              name: true,
              email: true,
              image: true,

              phone: true,

              clientProfile: {
                select: {
                  companyName: true,
                  companyLogo: true,
                  website: true,
                  phone: true,
                  city: true,
                  state: true,
                  country: true
                }
              }
            }
          },

          portfolio: {
            select: {
              tagline: true,
              summary: true,

              liveUrl: true,
              repositoryUrl: true,

              featured: true,
              publishedAt: true
            }
          },

          infrastructure: {
            select: {
              primaryDomain: true,

              domainRegistrar: true,
              dnsProvider: true,

              hostingProvider: true,
              hostingRegion: true,

              databaseProvider: true,
              storageProvider: true,

              emailProvider: true,
              sslProvider: true,

              notes: true
            }
          },

          technologies: {
            orderBy: [
              {
                featured: 'desc'
              },
              {
                sortOrder: 'asc'
              }
            ],

            select: {
              id: true,

              name: true,
              slug: true,

              icon: true,
              category: true,

              description: true,
              purpose: true,
              rationale: true,

              featured: true,
              sortOrder: true
            }
          },

          milestones: {
            orderBy: [
              {
                sortOrder: 'asc'
              },
              {
                dueDate: 'asc'
              }
            ],

            select: {
              id: true,

              title: true,
              slug: true,

              description: true,
              purpose: true,
              expectedOutcome: true,

              status: true,
              priority: true,
              visibility: true,

              progress: true,
              sortOrder: true,

              startedAt: true,
              dueDate: true,
              completedAt: true,

              completionNotes: true,

              createdAt: true,
              updatedAt: true,

              _count: {
                select: {
                  deliverables: true,
                  features: true,
                  processes: true,
                  files: true
                }
              }
            }
          },

          deliverables: {
            orderBy: [
              {
                sortOrder: 'asc'
              },
              {
                dueDate: 'asc'
              }
            ],

            select: {
              id: true,
              milestoneId: true,

              title: true,
              slug: true,

              type: true,

              summary: true,
              description: true,

              agreementSummary: true,
              rationale: true,
              expectedOutcome: true,

              status: true,
              visibility: true,

              progress: true,

              originalDueDate: true,
              dueDate: true,

              deliveredAt: true,
              acceptedAt: true,

              extensionReason: true,
              completionNotes: true,

              createdAt: true,
              updatedAt: true,

              _count: {
                select: {
                  files: true,
                  processes: true
                }
              }
            }
          },

          _count: {
            select: {
              milestones: true,
              deliverables: true,
              processes: true,

              features: true,
              tasks: true,

              updates: true,
              files: true,

              invoices: true,
              supportTickets: true,
              conversations: true
            }
          }
        }
      });
    }
  );

export type AdminProject =
  NonNullable<
    Awaited<
      ReturnType<
        typeof getAdminProject
      >
    >
  >;