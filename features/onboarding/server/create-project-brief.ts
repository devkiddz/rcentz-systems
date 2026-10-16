import {
  makeServiceSelection,
  describeServiceSelection,
} from "@/features/services/lib/service-selection";
import "server-only";
import { writeBriefData } from "./brief-data";
import {
  buildOptions,
  describeBrief,
  type ProjectBrief,
} from "../lib/project-brief";

export async function createProjectBrief(userId: string, brief: ProjectBrief) {
  const { prisma } = await import("@/lib/prisma");
  const slug =
    brief.serviceChoice?.serviceSlug ||
    buildOptions.find((option) => option.value === brief.build)?.service;
  const service = await prisma.service.findFirst({
    where: {
      slug,
      status: "ACTIVE",
      ...(brief.serviceChoice
        ? { publishedAt: { not: null, lte: new Date() } }
        : {}),
    },
    select: {
      id: true,
      slug: true,
      name: true,
      features: {
        orderBy: [{ sortOrder: "asc" }, { slug: "asc" }],
        select: {
          slug: true,
          name: true,
          description: true,
          expectedOutcome: true,
        },
      },
    },
  });
  if (!service) return null;
  let serviceSelection;
  try {
    serviceSelection = brief.serviceChoice
      ? makeServiceSelection(service, brief.serviceChoice)
      : undefined;
  } catch {
    return null;
  }
  return prisma.$transaction(async (transaction) => {
    // Serialize submissions by owner to make double clicks/retries return the same request.
    await transaction.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;
    const description =
      describeBrief(brief) +
      (serviceSelection
        ? "\n\n" + describeServiceSelection(serviceSelection)
        : "");
    const existing = await transaction.serviceRequest.findFirst({
      where: {
        userId,
        serviceId: service.id,
        title: brief.title,
        description,
        status: "PENDING",
        submittedAt: { gte: new Date(Date.now() - 60_000) },
      },
      select: { id: true },
    });
    if (existing) return existing;
    const now = new Date();
    const request = await transaction.serviceRequest.create({
      data: {
        userId,
        serviceId: service.id,
        title: brief.title,
        description,
        currency: brief.currency,
        budget: brief.guidance ? null : brief.budget,
        status: "PENDING",
        submittedAt: now,
        onboardingCompletedAt: now,
      },
      select: { id: true, serviceId: true },
    });
    await writeBriefData(transaction, request, {
      version: 1,
      ...(serviceSelection ? { serviceSelection } : {}),
      brief,
      attachments: [],
    });
    return { id: request.id };
  });
}
