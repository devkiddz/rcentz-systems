import type { PrismaClient } from "../../generated/prisma/client";
import { hashPassword } from "better-auth/crypto";
import { createLocalAccountIssuer } from "better-auth/db";

export class SeedGuardError extends Error {}
export const EMAIL = "denngodfirst@gmail.com";
export const SLUG = "demo-dennis-portfolio-complete-v1";
export const NOTICE =
  "Demonstration history: milestones, dates, reviews and messages below are sample records, not evidence of actual client approvals or payments.";
export const phases = [
  {
    slug: "discovery",
    title: "Discovery & agreed scope",
    type: "DOCUMENT",
    outcome:
      "A clear brief for the professional profile, selected work and contact journey.",
    tasks: [
      "Define visitors and conversion goals",
      "Map home, project, services and contact pages",
      "Agree content and acceptance checklist",
    ],
  },
  {
    slug: "design",
    title: "Identity & responsive design",
    type: "DESIGN",
    outcome:
      "A responsive visual system with light and dark themes, typography and reusable components.",
    tasks: [
      "Create hero, biography and skills layouts",
      "Design navigation and mobile interactions",
      "Review light and dark theme consistency",
    ],
  },
  {
    slug: "portfolio",
    title: "Profile & portfolio build",
    type: "PAGE",
    outcome:
      "Professional experience, services and selected product stories connected in one site.",
    tasks: [
      "Build profile, skills and experience sections",
      "Add Waffi, JobRcentz and Rcentz case studies",
      "Connect portfolio routes and external project links",
    ],
  },
  {
    slug: "contact",
    title: "Contact & email delivery",
    type: "FEATURE",
    outcome:
      "A contact journey with server validation and a reply-to email workflow.",
    tasks: [
      "Build accessible contact form and validation",
      "Configure Resend delivery and visitor reply-to",
      "Review anti-spam and error states",
    ],
  },
  {
    slug: "assistant",
    title: "Ask Denok experience",
    type: "FEATURE",
    outcome:
      "An assistant experience grounded in Dennis’s public profile and project context.",
    tasks: [
      "Prepare public profile and project knowledge",
      "Build the assistant interface and navigation",
      "Review scope boundaries and fallback responses",
    ],
  },
  {
    slug: "quality",
    title: "Quality review & launch",
    type: "DEPLOYMENT",
    outcome:
      "Responsive reviews, production configuration and the dennis.rcentz.cc launch.",
    tasks: [
      "Review desktop and mobile navigation",
      "Check build, routes, forms and theme behavior",
      "Connect domain and review the production release",
    ],
  },
  {
    slug: "handover",
    title: "Handover & support",
    type: "HANDOVER",
    outcome:
      "Delivery notes, a live portfolio preview and an ongoing maintenance checklist.",
    tasks: [
      "Document routes and integration responsibilities",
      "Prepare release and maintenance records",
      "Close demonstration support reviews",
    ],
  },
] as const;

const date = (day: number, hour = 12) => new Date(Date.UTC(2026, 8, day, hour));
export async function inspectSeed(db: PrismaClient) {
  // The locked recheck uses one transaction connection, so keep queries sequential.
  const existing = await db.user.findUnique({ where: { email: EMAIL } });
  const project = await db.project.findUnique({
    where: { slug: SLUG },
    include: { client: true },
  });
  const service = await db.service.findFirst({
    where: { slug: "business-website-development", status: "ACTIVE" },
  });
  const staff = await db.user.findFirst({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] }, status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
  });
  if (!service)
    throw new SeedGuardError(
      "Active business-website-development service is missing. No changes made.",
    );
  if (!staff)
    throw new SeedGuardError(
      "An active Rcentz administrator is required. No staff account will be fabricated.",
    );
  if (
    project &&
    (project.client?.email !== EMAIL || !project.description?.includes(NOTICE))
  ) {
    throw new SeedGuardError(
      "Reserved demo project belongs to another account or lacks the seed marker. No changes made.",
    );
  }
  if (existing && !project)
    throw new SeedGuardError(
      "Dennis’s email already exists. This seed will not overwrite or reset an existing account. No changes made.",
    );
  if (
    existing &&
    (existing.status !== "ACTIVE" ||
      !["USER", "CLIENT"].includes(existing.role))
  ) {
    throw new SeedGuardError(
      "Dennis’s account is suspended or has a privileged role. No changes made.",
    );
  }
  return { existing, project, service, staff };
}

export async function seedDennis(db: PrismaClient, password?: string) {
  return db.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(62187008)`;
      // Recheck under the transaction lock; retries never reset credentials or project edits.
      const state = await inspectSeed(tx as unknown as PrismaClient);
      if (state.project) return { created: false, projectId: state.project.id };
      if (!password || password.length < 12 || password.length > 128)
        throw new SeedGuardError(
          "A password of 12–128 characters is required for the new account.",
        );
      const passwordHash = await hashPassword(password);
      const client = await tx.user.create({
        data: {
          name: "Dennis Jones",
          email: EMAIL,
          emailVerified: false,
          role: "CLIENT",
          status: "ACTIVE",
          updatedAt: new Date(),
        },
      });
      await tx.account.create({
        data: {
          userId: client.id,
          accountId: client.id,
          providerId: "credential",
          issuer: createLocalAccountIssuer("credential"),
          password: passwordHash,
        },
      });
      await tx.clientProfile.create({
        data: {
          userId: client.id,
          companyName: "Dennis O. Jones",
          website: "https://dennis.rcentz.cc",
          bio: "Software developer and product engineer. Private demonstration delivery workspace.",
        },
      });
      const brief = {
        build: "website",
        company: "Dennis O. Jones",
        title: "Dennis Jones — professional portfolio",
        goals:
          "Present my professional profile, capabilities and selected products; make it easy for visitors to contact me.",
        audience: "Prospective clients, collaborators and recruiters.",
        startingPoint: "Improving an existing system",
        website: "https://dennis.rcentz.cc",
        features:
          "Responsive profile, project case studies, services, contact form, light/dark themes and Ask Denok assistant.",
        currency: "NGN",
        budget: "",
        guidance: true,
        timeline: "Within 1–2 months",
        notes: NOTICE,
        ongoingSupport: true,
      };
      const request = await tx.serviceRequest.create({
        data: {
          userId: client.id,
          serviceId: state.service.id,
          title: brief.title,
          description: NOTICE + "\n\n" + brief.goals,
          status: "CONVERTED",
          currency: "NGN",
          submittedAt: date(1),
          onboardingCompletedAt: date(1),
          createdAt: date(1),
          updatedAt: date(29),
        },
      });
      const question = await tx.serviceOnboardingQuestion.upsert({
        where: {
          serviceId_key: {
            serviceId: state.service.id,
            key: "_rcentz_project_brief_v1",
          },
        },
        create: {
          serviceId: state.service.id,
          key: "_rcentz_project_brief_v1",
          label: "Project brief workspace",
          type: "LONG_TEXT",
          active: false,
        },
        update: {},
      });
      await tx.serviceRequestAnswer.create({
        data: {
          serviceRequestId: request.id,
          questionId: question.id,
          questionLabel: question.label,
          questionType: question.type,
          metadata: { version: 1, brief, attachments: [] },
        },
      });
      const project = await tx.project.create({
        data: {
          clientId: client.id,
          serviceRequestId: request.id,
          name: "Dennis Jones — Portfolio Website (Demo)",
          slug: SLUG,
          description: NOTICE,
          purpose: brief.goals,
          vision:
            "A clear professional home for Dennis’s profile and product engineering work.",
          expectedOutcome:
            "Visitors can explore selected work, understand capabilities and make contact.",
          type: "WEBSITE",
          status: "COMPLETED",
          visibility: "PRIVATE",
          progress: 100,
          currency: "NGN",
          startedAt: date(1),
          expectedEndAt: date(30),
          completedAt: date(29),
          createdAt: date(1),
          updatedAt: date(29),
        },
      });
      const projectId = project.id;
      await tx.portfolioProfile.create({
        data: {
          projectId,
          tagline: "Professional profile & selected work",
          summary: NOTICE,
          liveUrl: "https://dennis.rcentz.cc",
          repositoryUrl: "https://github.com/devkiddz/dennis.rcentz.cc",
          featured: false,
        },
      });
      await tx.projectInfrastructure.create({
        data: {
          projectId,
          primaryDomain: "dennis.rcentz.cc",
          hostingProvider: "Vercel",
          emailProvider: "Resend",
          notes:
            "Known public portfolio configuration. Secret values and unverified infrastructure details are intentionally excluded.",
        },
      });
      for (const [index, name] of [
        "Next.js",
        "React",
        "TypeScript",
        "Tailwind CSS",
        "Resend",
      ].entries())
        await tx.projectTechnology.create({
          data: {
            projectId,
            name,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            sortOrder: index,
            purpose: "Portfolio implementation and delivery context",
          },
        });
      await tx.mediaAsset.create({
        data: {
          projectId,
          url: "/demo/dennis-portfolio/preview.jpg",
          fileName: "preview.jpg",
          mimeType: "image/jpeg",
          width: 1348,
          height: 926,
          alt: "Actual Dennis portfolio homepage captured on 8 October 2026",
          caption:
            "Live site screenshot — 8 October 2026. Delivery history is illustrative.",
          sortOrder: 0,
        },
      });
      const conversation = await tx.conversation.create({
        data: {
          type: "PROJECT",
          projectId,
          subject: "Demo: portfolio delivery & reviews",
          createdAt: date(1),
          participants: {
            create: [
              { userId: client.id, joinedAt: date(1), lastReadAt: date(29) },
              { userId: state.staff.id, joinedAt: date(1) },
            ],
          },
        },
      });
      let previousMilestone: string | undefined;
      for (const [index, phase] of phases.entries()) {
        const startedAt = date(1 + index * 4),
          completedAt = date(4 + index * 4);
        const milestone = await tx.projectMilestone.create({
          data: {
            projectId,
            createdById: state.staff.id,
            title: phase.title,
            slug: phase.slug,
            description: NOTICE,
            purpose: phase.outcome,
            expectedOutcome: phase.outcome,
            status: "COMPLETED",
            progress: 100,
            sortOrder: index,
            visibility: "CLIENT",
            startedAt,
            dueDate: completedAt,
            completedAt,
            completionNotes: "Demo completion: " + phase.outcome,
            createdAt: startedAt,
            updatedAt: completedAt,
          },
        });
        if (previousMilestone)
          await tx.projectMilestoneDependency.create({
            data: {
              projectId,
              milestoneId: milestone.id,
              dependsOnMilestoneId: previousMilestone,
            },
          });
        previousMilestone = milestone.id;
        const deliverable = await tx.projectDeliverable.create({
          data: {
            projectId,
            milestoneId: milestone.id,
            createdById: state.staff.id,
            title: phase.title + " delivery",
            slug: phase.slug,
            type: phase.type,
            status: "ACCEPTED",
            visibility: "CLIENT",
            progress: 100,
            sortOrder: index,
            summary: phase.outcome,
            description: NOTICE,
            deliveredAt: completedAt,
            acceptedAt: completedAt,
            completionNotes: "Demo acceptance; no real approval is implied.",
            createdAt: startedAt,
            updatedAt: completedAt,
          },
        });
        const feature = await tx.projectFeature.create({
          data: {
            projectId,
            milestoneId: milestone.id,
            createdById: state.staff.id,
            name: phase.title,
            slug: phase.slug,
            description: phase.outcome + " " + NOTICE,
            acceptanceCriteria: phase.tasks.map((text) => ({
              text,
              completed: true,
              demo: true,
            })),
            status: "COMPLETED",
            progress: 100,
            sortOrder: index,
            approvedAt: startedAt,
            startedAt,
            completedAt,
            createdAt: startedAt,
            updatedAt: completedAt,
          },
        });
        for (const [order, title] of phase.tasks.entries())
          await tx.projectTask.create({
            data: {
              projectId,
              featureId: feature.id,
              createdById: state.staff.id,
              title,
              description: "Demonstration task history.",
              status: "COMPLETED",
              progress: 100,
              sortOrder: order,
              startedAt,
              completedAt,
              createdAt: startedAt,
              updatedAt: completedAt,
            },
          });
        await tx.projectProcess.create({
          data: {
            projectId,
            milestoneId: milestone.id,
            deliverableId: deliverable.id,
            createdById: state.staff.id,
            type: "CLIENT_APPROVAL",
            title: "Demo review: " + phase.title,
            description: NOTICE,
            status: "RESOLVED",
            visibility: "CLIENT",
            sortOrder: index,
            resolvedAt: completedAt,
            resolutionNotes:
              "Sample response: reviewed against the agreed checklist; no outstanding items.",
            createdAt: startedAt,
            updatedAt: completedAt,
          },
        });
        await tx.clientApproval.create({
          data: {
            projectId,
            entityType: "PROJECT",
            clientId: client.id,
            requestedById: state.staff.id,
            respondedById: client.id,
            version: index + 1,
            status: "ACCEPTED",
            title: "Demo review: " + phase.title,
            summary: NOTICE,
            snapshot: {
              demo: true,
              milestoneId: milestone.id,
              title: phase.title,
              checklist: phase.tasks,
              notice: NOTICE,
            },
            response: "Sample acceptance for dashboard demonstration only.",
            requestedAt: date(3 + index * 4),
            respondedAt: completedAt,
            createdAt: date(3 + index * 4),
            updatedAt: completedAt,
          },
        });
        await tx.projectMilestoneRecord.create({
          data: {
            projectId,
            milestoneId: milestone.id,
            requestedById: client.id,
            preparedById: state.staff.id,
            status: "READY",
            recipientEmail: EMAIL,
            pdfUrl: "/demo/dennis-portfolio/" + phase.slug + ".pdf",
            fileName: phase.slug + ".pdf",
            snapshot: {
              demo: true,
              title: phase.title,
              checklist: phase.tasks,
              notice: NOTICE,
            },
            requestedAt: completedAt,
            preparingAt: completedAt,
            readyAt: completedAt,
            createdAt: completedAt,
            updatedAt: completedAt,
          },
        });
        await tx.projectFile.create({
          data: {
            projectId,
            milestoneId: milestone.id,
            deliverableId: deliverable.id,
            uploaderId: state.staff.id,
            name: "Demo record — " + phase.title,
            url: "/demo/dennis-portfolio/" + phase.slug + ".pdf",
            mimeType: "application/pdf",
            visibility: "CLIENT",
            createdAt: completedAt,
            updatedAt: completedAt,
          },
        });
        for (const [step, type, title] of [
          [0, "STATUS_CHANGED", "Started"],
          [2, "STATUS_CHANGED", "Ready for review"],
          [3, "MILESTONE_COMPLETED", "Completed"],
        ] as const)
          await tx.projectActivity.create({
            data: {
              projectId,
              userId: state.staff.id,
              type,
              title: "Demo: " + title + " — " + phase.title,
              description: phase.outcome,
              visibility: "CLIENT",
              metadata: { demo: true, milestoneId: milestone.id },
              createdAt: date(1 + index * 4 + step),
            },
          });
        await tx.projectUpdate.create({
          data: {
            projectId,
            milestoneId: milestone.id,
            featureId: feature.id,
            authorId: state.staff.id,
            type:
              index === 5
                ? "DEPLOYMENT"
                : index === 6
                  ? "COMPLETION"
                  : "MILESTONE",
            visibility: "CLIENT",
            title: "Demo: " + phase.title + " completed",
            description: phase.outcome + " " + NOTICE,
            progress: Math.round(((index + 1) / phases.length) * 100),
            createdAt: completedAt,
            updatedAt: completedAt,
          },
        });
        await tx.message.createMany({
          data: [
            {
              conversationId: conversation.id,
              senderId: state.staff.id,
              body:
                "[DEMO] Ready for review: " +
                phase.title +
                ". " +
                phase.outcome,
              createdAt: date(3 + index * 4),
            },
            {
              conversationId: conversation.id,
              senderId: client.id,
              body: "[DEMO] Sample response: checklist reviewed; milestone accepted.",
              createdAt: completedAt,
            },
          ],
        });
      }
      await tx.supportTicket.create({
        data: {
          projectId,
          creatorId: client.id,
          assigneeId: state.staff.id,
          ticketNumber: "DEMO-DENNIS-001",
          subject: "Demo: mobile spacing review",
          description:
            "Sample support history: adjust the hero spacing and check the small-screen navigation.",
          type: "CHANGE_REQUEST",
          status: "CLOSED",
          visibility: "CLIENT",
          createdAt: date(24),
          resolvedAt: date(27),
          closedAt: date(28),
          updatedAt: date(28),
        },
      });
      await tx.projectActivity.create({
        data: {
          projectId,
          userId: state.staff.id,
          type: "COMPLETED",
          title: "Demo: portfolio handover complete",
          description: NOTICE,
          visibility: "CLIENT",
          metadata: { demo: true },
          createdAt: date(29),
        },
      });
      await tx.notification.create({
        data: {
          userId: client.id,
          type: "PROJECT",
          title: "Your portfolio demonstration is ready",
          message:
            "Explore the completed milestones, reviews, records and project conversation. All historical events are samples.",
          href: "/dashboard/projects/" + projectId,
          entityType: "Project",
          entityId: projectId,
          metadata: { demo: true },
          readAt: new Date(),
        },
      });
      return { created: true, projectId };
    },
    { timeout: 60000, maxWait: 15000 },
  );
}
