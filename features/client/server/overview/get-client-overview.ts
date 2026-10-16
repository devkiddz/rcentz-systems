import {
  isProjectLogo,
  safeProjectImage,
} from "@/features/client/lib/workspace";
import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/prisma";

const clientVisible = ["CLIENT", "PUBLIC"] as const;

const activeProjectStatuses = [
  "PLANNING",
  "DISCOVERY",
  "DESIGN",
  "DEVELOPMENT",
  "TESTING",
  "REVIEW",
  "DEPLOYMENT",
  "MAINTENANCE",
] as const;

const openMilestoneStatuses = [
  "PLANNED",
  "IN_PROGRESS",
  "BLOCKED",
  "REVIEW",
] as const;

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

const ATTENTION_WINDOW_DAYS = 7;

function decimalToNumber(
  value:
    | {
        toString(): string;
      }
    | null
    | undefined,
) {
  if (value === null || value === undefined) {
    return 0;
  }

  const numericValue = Number(value.toString());

  return Number.isFinite(numericValue) ? numericValue : 0;
}

function getProjectHealth({
  project,
  now,
}: {
  project: {
    expectedEndAt: Date | null;

    milestones: Array<{
      status: string;
      dueDate: Date | null;
    }>;
  };

  now: Date;
}) {
  const attentionWindowEnd = new Date(
    now.getTime() + ATTENTION_WINDOW_DAYS * DAY_IN_MILLISECONDS,
  );

  let blockedMilestones = 0;
  let overdueMilestones = 0;
  let reviewMilestones = 0;
  let dueSoonMilestones = 0;

  for (const milestone of project.milestones) {
    if (milestone.status === "BLOCKED") {
      blockedMilestones += 1;
    }

    if (milestone.status === "REVIEW") {
      reviewMilestones += 1;
    }

    const isActive =
      milestone.status !== "COMPLETED" && milestone.status !== "CANCELLED";

    if (isActive && milestone.dueDate && milestone.dueDate < now) {
      overdueMilestones += 1;
    }

    if (
      isActive &&
      milestone.dueDate &&
      milestone.dueDate >= now &&
      milestone.dueDate <= attentionWindowEnd
    ) {
      dueSoonMilestones += 1;
    }
  }

  const isProjectOverdue =
    project.expectedEndAt !== null && project.expectedEndAt < now;

  if (blockedMilestones > 0 || overdueMilestones > 0 || isProjectOverdue) {
    return {
      status: "AT_RISK" as const,

      label: "At risk",

      reason:
        blockedMilestones > 0
          ? `${blockedMilestones} blocked milestone${
              blockedMilestones === 1 ? "" : "s"
            }`
          : overdueMilestones > 0
            ? `${overdueMilestones} overdue milestone${
                overdueMilestones === 1 ? "" : "s"
              }`
            : "Project target date has passed",
    };
  }

  if (reviewMilestones > 0 || dueSoonMilestones > 0) {
    return {
      status: "ATTENTION" as const,

      label: "Needs attention",

      reason:
        reviewMilestones > 0
          ? `${reviewMilestones} milestone${
              reviewMilestones === 1 ? "" : "s"
            } awaiting review`
          : `${dueSoonMilestones} milestone${
              dueSoonMilestones === 1 ? "" : "s"
            } due soon`,
    };
  }

  return {
    status: "ON_TRACK" as const,

    label: "On track",

    reason: "No immediate delivery risks detected",
  };
}

export const getClientOverview = cache(async (userId: string) => {
  const now = new Date();

  const projects = await prisma.project.findMany({
    where: {
      clientId: userId,
    },

    orderBy: {
      updatedAt: "desc",
    },

    select: {
      id: true,
      name: true,
      slug: true,

      description: true,

      status: true,
      progress: true,

      currency: true,

      expectedEndAt: true,
      updatedAt: true,

      portfolio: {
        select: {
          liveUrl: true,
        },
      },

      infrastructure: {
        select: {
          primaryDomain: true,
        },
      },

      /*
       * Overview intentionally loads
       * only one image.
       *
       * The full media gallery remains
       * a project-detail responsibility.
       */
      media: {
        where: {
          mimeType: {
            startsWith: "image/",
          },
        },

        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            createdAt: "asc",
          },
        ],

        take: 1,

        select: {
          url: true,
          alt: true,
          caption: true,
        },
      },

      analyticsConfig: {
        select: {
          status: true,

          clientVisible: true,

          lastIngestedAt: true,

          lastAggregatedAt: true,
        },
      },

      analytics: {
        select: {
          sessions: true,
          pageViews: true,
          clicks: true,

          conversions: true,

          lastEventAt: true,
        },
      },

      milestones: {
        where: {
          visibility: {
            in: [...clientVisible],
          },
        },

        orderBy: {
          sortOrder: "asc",
        },

        select: {
          id: true,
          title: true,

          status: true,
          progress: true,

          dueDate: true,
          completedAt: true,

          records: {
            orderBy: {
              version: "desc",
            },

            take: 1,

            select: {
              id: true,
              status: true,

              version: true,

              pdfUrl: true,

              requestedAt: true,

              sentAt: true,
            },
          },
        },
      },

      processes: {
        where: {
          visibility: {
            in: [...clientVisible],
          },

          status: {
            in: ["PENDING", "IN_PROGRESS"],
          },
        },

        orderBy: [
          {
            requiresClientAction: "desc",
          },
          {
            blocking: "desc",
          },
          {
            dueAt: "asc",
          },
        ],

        select: {
          id: true,

          type: true,
          status: true,

          title: true,
          description: true,

          blocking: true,

          requiresClientAction: true,

          dueAt: true,

          milestone: {
            select: {
              id: true,
              title: true,
            },
          },

          deliverable: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },

      supportTickets: {
        where: {
          visibility: {
            in: [...clientVisible],
          },
        },

        orderBy: {
          updatedAt: "desc",
        },

        select: {
          id: true,

          ticketNumber: true,

          type: true,

          subject: true,

          status: true,
          priority: true,

          createdAt: true,
          updatedAt: true,

          resolvedAt: true,
          closedAt: true,
        },
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

          status: true,

          currency: true,

          total: true,

          amountPaid: true,

          balanceDue: true,

          issuedAt: true,
          dueAt: true,
          paidAt: true,

          createdAt: true,
        },
      },

      subscription: {
        select: {
          id: true,

          status: true,

          priceAmount: true,

          currency: true,

          nextBillingAt: true,

          currentPeriodEnd: true,

          plan: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  const logoAssets = projects.length
    ? await prisma.mediaAsset.findMany({
        where: {
          projectId: { in: projects.map((p) => p.id) },
          project: { clientId: userId },
          mimeType: { startsWith: "image/" },
          OR: [
            { fileName: { contains: "logo", mode: "insensitive" } },
            { alt: { contains: "logo", mode: "insensitive" } },
            { caption: { contains: "logo", mode: "insensitive" } },
            { fileName: { contains: "brand-mark", mode: "insensitive" } },
          ],
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        take: 1000,
        select: {
          projectId: true,
          url: true,
          fileName: true,
          alt: true,
          caption: true,
        },
      })
    : [];
  const logoByProject = new Map<string, { url: string; alt: string | null }>();
  for (const asset of logoAssets) {
    if (
      asset.projectId &&
      !logoByProject.has(asset.projectId) &&
      isProjectLogo(asset) &&
      safeProjectImage(asset.url)
    )
      logoByProject.set(asset.projectId, { url: asset.url, alt: asset.alt });
  }
  const projectItems = projects.map((project) => {
    const nextMilestone =
      project.milestones.find((milestone) =>
        (openMilestoneStatuses as readonly string[]).includes(
          String(milestone.status),
        ),
      ) ?? null;

    const completedMilestones = project.milestones.filter(
      (milestone) => milestone.status === "COMPLETED",
    ).length;

    const health = getProjectHealth({
      project,
      now,
    });

    const analyticsAvailable = Boolean(
      project.analyticsConfig?.clientVisible &&
        project.analyticsConfig.status === "ACTIVE",
    );

    return {
      id: project.id,
      logo: logoByProject.get(project.id) || null,

      name: project.name,

      slug: project.slug,

      description: project.description,

      status: project.status,

      progress: project.progress,

      expectedEndAt: project.expectedEndAt,

      updatedAt: project.updatedAt,

      /*
       * This is the image consumed by
       * ClientProjectMonitor.
       */
      screenshot: project.media[0] ?? null,

      domain: project.infrastructure?.primaryDomain ?? null,

      liveUrl: project.portfolio?.liveUrl ?? null,

      milestoneSummary: {
        total: project.milestones.length,

        completed: completedMilestones,

        open: project.milestones.length - completedMilestones,
      },

      nextMilestone: nextMilestone
        ? {
            id: nextMilestone.id,

            title: nextMilestone.title,

            status: nextMilestone.status,

            progress: nextMilestone.progress,

            dueDate: nextMilestone.dueDate,
          }
        : null,

      health,

      analytics: {
        available: analyticsAvailable,

        status: project.analyticsConfig?.status ?? null,

        sessions: analyticsAvailable ? (project.analytics?.sessions ?? 0) : 0,

        pageViews: analyticsAvailable ? (project.analytics?.pageViews ?? 0) : 0,

        clicks: analyticsAvailable ? (project.analytics?.clicks ?? 0) : 0,

        conversions: analyticsAvailable
          ? (project.analytics?.conversions ?? 0)
          : 0,

        lastEventAt: analyticsAvailable
          ? (project.analytics?.lastEventAt ?? null)
          : null,
      },
    };
  });

  const activeProjects = projectItems.filter((project) =>
    (activeProjectStatuses as readonly string[]).includes(
      String(project.status),
    ),
  );

  const actions = projects
    .flatMap((project) =>
      project.processes
        .filter((process) => process.requiresClientAction || process.blocking)
        .map((process) => ({
          id: process.id,

          projectId: project.id,

          projectName: project.name,

          title: process.title,

          description: process.description,

          type: process.type,

          status: process.status,

          blocking: process.blocking,

          requiresClientAction: process.requiresClientAction,

          dueAt: process.dueAt,

          context:
            process.milestone?.title ?? process.deliverable?.title ?? null,
        })),
    )
    .sort((a, b) => {
      if (a.requiresClientAction !== b.requiresClientAction) {
        return a.requiresClientAction ? -1 : 1;
      }

      if (a.blocking !== b.blocking) {
        return a.blocking ? -1 : 1;
      }

      if (a.dueAt && b.dueAt) {
        return a.dueAt.getTime() - b.dueAt.getTime();
      }

      if (a.dueAt) {
        return -1;
      }

      if (b.dueAt) {
        return 1;
      }

      return 0;
    });

  const records = projects
    .flatMap((project) =>
      project.milestones.flatMap((milestone) => {
        const record = milestone.records[0] ?? null;

        if (!record || record.status === "CANCELLED") {
          return [];
        }

        return [
          {
            id: record.id,

            projectId: project.id,

            projectName: project.name,

            milestoneId: milestone.id,

            milestoneTitle: milestone.title,

            status: record.status,

            version: record.version,

            pdfUrl: record.pdfUrl,

            requestedAt: record.requestedAt,

            sentAt: record.sentAt,
          },
        ];
      }),
    )
    .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());

  const support = projects
    .flatMap((project) =>
      project.supportTickets
        .filter(
          (ticket) =>
            ticket.status !== "RESOLVED" &&
            ticket.status !== "CLOSED" &&
            ticket.status !== "CANCELLED",
        )
        .map((ticket) => ({
          id: ticket.id,

          projectId: project.id,

          projectName: project.name,

          ticketNumber: ticket.ticketNumber,

          type: ticket.type,

          subject: ticket.subject,

          status: ticket.status,

          priority: ticket.priority,

          createdAt: ticket.createdAt,

          updatedAt: ticket.updatedAt,
        })),
    )
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const allInvoices = projects.flatMap((project) =>
    project.invoices.map((invoice) => ({
      id: invoice.id,

      projectId: project.id,

      projectName: project.name,

      invoiceNumber: invoice.invoiceNumber,

      status: invoice.status,

      currency: invoice.currency,

      total: decimalToNumber(invoice.total),

      amountPaid: decimalToNumber(invoice.amountPaid),

      balanceDue: decimalToNumber(invoice.balanceDue),

      issuedAt: invoice.issuedAt,

      dueAt: invoice.dueAt,

      paidAt: invoice.paidAt,

      createdAt: invoice.createdAt,
    })),
  );

  const primaryCurrency =
    allInvoices[0]?.currency ?? projects[0]?.currency ?? "NGN";

  const financeInvoices = allInvoices.filter(
    (invoice) => invoice.currency === primaryCurrency,
  );

  let billed = 0;
  let paid = 0;
  let outstanding = 0;
  let overdue = 0;

  for (const invoice of financeInvoices) {
    const status = String(invoice.status);

    const excluded = ["DRAFT", "VOID", "CANCELLED"].includes(status);

    if (excluded) {
      continue;
    }

    billed += invoice.total;

    paid += invoice.amountPaid;

    outstanding += invoice.balanceDue;

    if (
      invoice.balanceDue > 0 &&
      (status === "OVERDUE" || (invoice.dueAt !== null && invoice.dueAt < now))
    ) {
      overdue += invoice.balanceDue;
    }
  }

  const outstandingInvoices = financeInvoices
    .filter(
      (invoice) =>
        invoice.balanceDue > 0 &&
        !["DRAFT", "VOID", "CANCELLED"].includes(String(invoice.status)),
    )
    .sort((a, b) => {
      if (a.dueAt && b.dueAt) {
        return a.dueAt.getTime() - b.dueAt.getTime();
      }

      if (a.dueAt) {
        return -1;
      }

      if (b.dueAt) {
        return 1;
      }

      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  const subscriptions = projects.flatMap((project) =>
    project.subscription
      ? [
          {
            id: project.subscription.id,

            projectId: project.id,

            projectName: project.name,

            status: project.subscription.status,

            amount: decimalToNumber(project.subscription.priceAmount),

            currency: project.subscription.currency,

            nextBillingAt: project.subscription.nextBillingAt,

            currentPeriodEnd: project.subscription.currentPeriodEnd,

            plan: {
              id: project.subscription.plan.id,

              name: project.subscription.plan.name,
            },
          },
        ]
      : [],
  );

  const activeSubscriptions = subscriptions.filter((subscription) =>
    ["ACTIVE", "TRIALING"].includes(String(subscription.status)),
  );

  const managedProjects = projectItems.filter(
    (project) => project.analytics.available,
  ).length;

  return {
    summary: {
      projectCount: projectItems.length,

      activeProjects: activeProjects.length,

      actionRequired: actions.filter((action) => action.requiresClientAction)
        .length,

      openSupport: support.length,

      outstandingAmount: outstanding,

      managedProjects,

      currency: primaryCurrency,
    },

    projects: projectItems,

    monitorProjects: activeProjects.length > 0 ? activeProjects : projectItems,

    actions,
    records,
    support,

    finance: {
      currency: primaryCurrency,

      billed,
      paid,
      outstanding,
      overdue,

      activeSubscriptions: activeSubscriptions.length,

      nextPayment: outstandingInvoices[0] ?? null,

      recentInvoices: [...financeInvoices]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5),

      subscriptions,
    },
  };
});

export type ClientOverviewData = Awaited<ReturnType<typeof getClientOverview>>;

export type ClientOverviewProject = ClientOverviewData["projects"][number];

export type ClientOverviewAction = ClientOverviewData["actions"][number];

export type ClientOverviewRecord = ClientOverviewData["records"][number];

export type ClientOverviewSupport = ClientOverviewData["support"][number];
