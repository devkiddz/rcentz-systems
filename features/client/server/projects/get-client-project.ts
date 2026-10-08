import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/prisma";

const clientVisible = ["CLIENT", "PUBLIC"] as const;

export const getClientProject = cache(
  async ({ userId, projectId }: { userId: string; projectId: string }) => {
    return prisma.project.findFirst({
      where: {
        id: projectId,
        clientId: userId,
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
        progress: true,

        budget: true,
        currency: true,

        startedAt: true,
        expectedEndAt: true,
        completedAt: true,

        createdAt: true,
        updatedAt: true,

        portfolio: {
          select: {
            tagline: true,
            summary: true,
            liveUrl: true,
            repositoryUrl: true,
          },
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
          },
        },

        media: {
          orderBy: [
            {
              sortOrder: "asc",
            },
            {
              createdAt: "asc",
            },
          ],

          select: {
            id: true,

            url: true,

            alt: true,
            caption: true,

            fileName: true,
            mimeType: true,

            width: true,
            height: true,

            sortOrder: true,
          },
        },

        technologies: {
          orderBy: [
            {
              featured: "desc",
            },
            {
              sortOrder: "asc",
            },
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
            sortOrder: true,
          },
        },

        deliverables: {
          where: {
            visibility: {
              in: [...clientVisible],
            },
          },

          orderBy: [
            {
              sortOrder: "asc",
            },
            {
              dueDate: "asc",
            },
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
            progress: true,

            originalDueDate: true,
            dueDate: true,

            deliveredAt: true,
            acceptedAt: true,

            extensionReason: true,
            completionNotes: true,

            _count: {
              select: {
                files: true,
                processes: true,
              },
            },
          },
        },

        milestones: {
          where: {
            visibility: {
              in: [...clientVisible],
            },
          },

          orderBy: [
            {
              sortOrder: "asc",
            },
            {
              dueDate: "asc",
            },
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
            progress: true,

            startedAt: true,
            dueDate: true,
            completedAt: true,

            completionNotes: true,

            records: {
              orderBy: {
                version: "desc",
              },

              take: 1,

              select: {
                id: true,

                status: true,
                version: true,

                recipientEmail: true,

                pdfUrl: true,
                fileName: true,

                requestedAt: true,
                preparingAt: true,
                readyAt: true,
                sentAt: true,
                failedAt: true,
              },
            },

            _count: {
              select: {
                deliverables: true,
                features: true,
                files: true,
                processes: true,
              },
            },
          },
        },

        approvals: {
          where: { clientId: userId, entityType: "PROJECT" },
          orderBy: { requestedAt: "desc" },
          take: 8,
          select: { id: true, title: true, status: true, respondedAt: true },
        },
        supportTickets: {
          where: {
            creatorId: userId,
            visibility: { in: ["CLIENT", "PUBLIC"] },
          },
          orderBy: { createdAt: "desc" },
          take: 4,
          select: { id: true, subject: true, status: true },
        },
        conversations: {
          where: {
            status: "ACTIVE",
            participants: { some: { userId, leftAt: null } },
          },
          orderBy: { updatedAt: "desc" },
          take: 1,
          select: { id: true },
        },
        invoices: {
          orderBy: [
            {
              dueAt: "asc",
            },
            {
              createdAt: "desc",
            },
          ],

          select: {
            id: true,

            invoiceNumber: true,
            sourceType: true,
            status: true,

            currency: true,

            subtotal: true,
            discount: true,
            tax: true,

            total: true,
            amountPaid: true,
            balanceDue: true,

            issuedAt: true,
            dueAt: true,
            paidAt: true,

            pdfUrl: true,

            createdAt: true,
          },
        },

        _count: {
          select: {
            deliverables: true,
            milestones: true,
            features: true,
            tasks: true,
            updates: true,
            files: true,
            supportTickets: true,
          },
        },
      },
    });
  },
);

export type ClientProject = NonNullable<
  Awaited<ReturnType<typeof getClientProject>>
>;
