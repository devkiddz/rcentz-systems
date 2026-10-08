import 'server-only';
import {
  buildOptions,
  describeBrief,
  type ProjectBrief
} from '../lib/project-brief';

export async function createProjectBrief(userId: string, brief: ProjectBrief) {
  const { prisma } = await import('@/lib/prisma');
  const slug = buildOptions.find(
    (option) => option.value === brief.build
  )?.service;
  const service = await prisma.service.findFirst({
    where: { slug, status: 'ACTIVE' },
    select: { id: true }
  });
  if (!service) return null;
  return prisma.$transaction(async (transaction) => {
    // Serialize submissions by owner to make double clicks/retries return the same request.
    await transaction.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;
    const description = describeBrief(brief);
    const existing = await transaction.serviceRequest.findFirst({
      where: {
        userId,
        serviceId: service.id,
        title: brief.title,
        description,
        status: 'PENDING',
        submittedAt: { gte: new Date(Date.now() - 60_000) }
      },
      select: { id: true }
    });
    if (existing) return existing;
    const now = new Date();
    return transaction.serviceRequest.create({
      data: {
        userId,
        serviceId: service.id,
        title: brief.title,
        description,
        currency: brief.currency,
        budget: brief.guidance ? null : brief.budget,
        status: 'PENDING',
        submittedAt: now,
        onboardingCompletedAt: now
      },
      select: { id: true }
    });
  });
}
