import type { PrismaClient, Prisma } from "../../generated/prisma/client";
const slug = "demo-dennis-portfolio-complete-v1";
const origin = "https://dennis.rcentz.cc";
const archiveId = "dennis-live-analytics-archive-v1";
export async function inspectDennisTracker(db: PrismaClient) {
  const project = await db.project.findUnique({
    where: { slug },
    select: {
      id: true,
      client: { select: { email: true } },
      analyticsConfig: true,
      analytics: true,
      analyticsDaily: true,
    },
  });
  if (
    !project ||
    project.client?.email.toLowerCase() !== "denngodfirst@gmail.com"
  )
    throw new Error(
      "Dennis’s existing project ownership could not be verified.",
    );
  if (
    await db.projectAnalyticsConfig.count({
      where: {
        projectId: { not: project.id },
        status: "ACTIVE",
        allowedOrigins: { has: origin },
      },
    })
  )
    throw new Error(
      "This site already tracks to another project. No changes made.",
    );
  const archive = await db.auditLog.findUnique({ where: { id: archiveId } });
  if (archive && archive.entityId !== project.id)
    throw new Error("Analytics archive belongs to another project.");
  const config = project.analyticsConfig;
  if (archive) {
    if (!config || !config.allowedOrigins.includes(origin))
      throw new Error(
        "Live collection configuration was modified. No changes made.",
      );
    return { project, activated: true };
  }
  if (
    config?.allowedOrigins.length ||
    config?.status === "ACTIVE" ||
    (await db.analyticsEvent.count({ where: { projectId: project.id } }))
  )
    throw new Error("Existing live analytics found. Refusing to replace it.");
  if (project.analytics || project.analyticsDaily.length) {
    const rows = project.analyticsDaily;
    const expected = [28, 37, 49, 62, 79, 94];
    const altered = rows.some((row) => {
      const index = expected.indexOf(row.pageViews);
      const conversions = index > 2 ? 2 : 1;
      return (
        index < 0 ||
        row.sessions !== Math.round(row.pageViews * 0.6) ||
        row.clicks !== Math.round(row.pageViews * 0.25) ||
        row.conversions !== conversions ||
        row.serviceRequests !== conversions ||
        row.totalEvents !==
          row.sessions + row.pageViews + row.clicks + conversions
      );
    });
    if (
      altered ||
      rows.length !== 6 ||
      rows
        .map((r) => r.pageViews)
        .sort((a, b) => a - b)
        .join() !== expected.join() ||
      project.analytics?.pageViews !== 349 ||
      project.analytics?.sessions !== 208 ||
      project.analytics?.clicks !== 88 ||
      project.analytics?.conversions !== 9 ||
      project.analytics?.totalEvents !== 654 ||
      rows.some(
        (r) =>
          r.uniqueVisitors !== 0 ||
          r.projectViews ||
          r.productViews ||
          r.serviceViews ||
          r.searches ||
          r.purchases ||
          r.checkoutStarted ||
          r.signUps ||
          r.logins ||
          r.addToCarts ||
          r.removeFromCarts,
      )
    )
      throw new Error(
        "Sample analytics were modified. Refusing to reset them.",
      );
  }
  return { project, activated: false };
}
export async function activateDennisTracker(db: PrismaClient) {
  return db.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(62187008)`;
      const state = await inspectDennisTracker(tx as unknown as PrismaClient);
      if (state.activated)
        return { projectId: state.project.id, changed: false };
      const projectId = state.project.id;
      const goals = await tx.projectAnalyticsGoal.findMany({
        where: { projectId },
      });
      if (goals.some((g) => g.key !== "demo_contact_request"))
        throw new Error("Custom analytics goals found. No changes made.");
      const archived: Prisma.InputJsonValue = JSON.parse(
        JSON.stringify({
          notice:
            "Archived synthetic demonstration figures before real traffic collection. No financial records changed.",
          config: state.project.analyticsConfig,
          summary: state.project.analytics,
          daily: state.project.analyticsDaily,
          goals,
        }),
      );
      await tx.auditLog.create({
        data: {
          id: archiveId,
          action: "ANALYTICS_DEMO_ARCHIVED",
          entityType: "PROJECT",
          entityId: projectId,
          metadata: archived,
        },
      });
      await tx.projectAnalyticsDaily.deleteMany({ where: { projectId } });
      await tx.projectAnalytics.deleteMany({ where: { projectId } });
      await tx.projectAnalyticsGoal.updateMany({
        where: { projectId, key: "demo_contact_request" },
        data: { active: false },
      });
      const now = new Date();
      await tx.projectAnalyticsConfig.upsert({
        where: { projectId },
        create: {
          projectId,
          status: "ACTIVE",
          timezone: "Africa/Lagos",
          allowedOrigins: [origin],
          startedAt: now,
        },
        update: {
          status: "ACTIVE",
          allowedOrigins: [origin],
          startedAt: now,
          endedAt: null,
          lastIngestedAt: null,
          lastAggregatedAt: null,
          clientVisible: true,
        },
      });
      return { projectId, changed: true };
    },
    { timeout: 30000 },
  );
}
