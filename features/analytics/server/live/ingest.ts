import "server-only";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

export class TrackingError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export async function findSite(origin: string) {
  let normalized: string;
  try {
    normalized = new URL(origin).origin;
  } catch {
    throw new TrackingError("Origin required.", 403);
  }
  if (origin !== normalized || !/^https?:/.test(origin))
    throw new TrackingError("Origin required.", 403);
  const configs = await prisma.projectAnalyticsConfig.findMany({
    where: { status: "ACTIVE", allowedOrigins: { has: origin } },
    take: 2,
    select: { projectId: true, trackingKey: true, timezone: true },
  });
  if (configs.length !== 1)
    throw new TrackingError("Tracking is not configured for this site.", 403);
  return configs[0];
}
export async function ingest(origin: string, raw: unknown) {
  const config = await findSite(origin);
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new TrackingError("Invalid event.");
  const payload = raw as Record<string, unknown>;
  if (
    payload.trackingKey !== config.trackingKey ||
    !["PAGE_VIEW", "CLICK"].includes(String(payload.type))
  )
    throw new TrackingError("Unsupported event.");
  if (
    typeof payload.sessionKey !== "string" ||
    !/^[a-f0-9-]{36}$/i.test(payload.sessionKey) ||
    typeof payload.eventId !== "string" ||
    !/^[a-f0-9-]{36}$/i.test(payload.eventId)
  )
    throw new TrackingError("Invalid event identifier.");
  if (
    typeof payload.path !== "string" ||
    !payload.path.startsWith("/") ||
    payload.path.length > 512 ||
    /[?#]/.test(payload.path) ||
    payload.path.includes("\\") ||
    [...payload.path].some((char) => char.charCodeAt(0) < 32)
  )
    throw new TrackingError("Use a pathname without personal data.");
  const type = payload.type as "PAGE_VIEW" | "CLICK";
  // No arbitrary metadata, URL queries, element text, form values or visitor IPs are stored.
  const click =
    type === "CLICK" &&
    typeof payload.action === "string" &&
    /^[a-zA-Z0-9_-]{1,48}$/.test(payload.action)
      ? payload.action
      : undefined;
  const referrerHost =
    type === "PAGE_VIEW" &&
    typeof payload.referrerHost === "string" &&
    /^(direct|[a-z0-9][a-z0-9.-]{0,252})$/.test(payload.referrerHost)
      ? payload.referrerHost
      : "direct";
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: config.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (name: string) => parts.find((p) => p.type === name)!.value;
  const day = `${part("year")}-${part("month")}-${part("day")}`;
  const date = new Date(day + "T00:00:00Z");
  const eventId =
    "live_" +
    createHash("sha256")
      .update(config.projectId + ":" + payload.eventId)
      .digest("hex");
  return prisma.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"analytics:" + config.projectId}))`;
      const active = await tx.projectAnalyticsConfig.findFirst({
        where: {
          projectId: config.projectId,
          trackingKey: config.trackingKey,
          status: "ACTIVE",
          allowedOrigins: { has: origin },
        },
        select: { id: true },
      });
      if (!active) throw new TrackingError("Collection is paused.", 403);
      if (
        await tx.analyticsEvent.findUnique({
          where: { id: eventId },
          select: { id: true },
        })
      )
        return { accepted: true, duplicate: true };
      const sessionKey = `${config.projectId}:${payload.sessionKey}`;
      const existing = await tx.analyticsSession.findUnique({
        where: { sessionKey },
        select: { id: true },
      });
      const since = new Date(Date.now() - 60000);
      if (
        (await tx.analyticsEvent.count({
          where: { projectId: config.projectId, createdAt: { gte: since } },
        })) >= 1000 ||
        (existing &&
          (await tx.analyticsEvent.count({
            where: {
              projectId: config.projectId,
              sessionId: existing.id,
              createdAt: { gte: since },
            },
          })) >= 60)
      )
        throw new TrackingError("Too many events.", 429);
      const session = await tx.analyticsSession.upsert({
        where: { sessionKey },
        update: { lastSeenAt: now },
        create: { sessionKey, lastSeenAt: now },
        select: { id: true },
      });
      const previousDay = await tx.$queryRaw<
        Array<{ count: bigint }>
      >`SELECT COUNT(*) AS count FROM "AnalyticsEvent" WHERE "projectId" = ${config.projectId} AND "sessionId" = ${session.id} AND ("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${config.timezone})::date = ${day}::date`;
      const daySessions = Number(previousDay[0]?.count || 0) === 0 ? 1 : 0;
      await tx.analyticsEvent.create({
        data: {
          id: eventId,
          projectId: config.projectId,
          sessionId: session.id,
          type,
          path: payload.path as string,
          entityType: "PROJECT",
          entityId: config.projectId,
          createdAt: now,
          metadata: {
            source: "RCENTZ_LIVE_TRACKER",
            origin,
            ...(click ? { action: click } : {}),
            ...(type === "PAGE_VIEW" ? { referrerHost } : {}),
          },
        },
      });
      const counts = {
        pageViews: type === "PAGE_VIEW" ? 1 : 0,
        clicks: type === "CLICK" ? 1 : 0,
        totalEvents: 1,
      };
      await tx.projectAnalyticsDaily.upsert({
        where: { projectId_date: { projectId: config.projectId, date } },
        create: {
          projectId: config.projectId,
          date,
          sessions: daySessions,
          ...counts,
        },
        update: {
          sessions: { increment: daySessions },
          pageViews: { increment: counts.pageViews },
          clicks: { increment: counts.clicks },
          totalEvents: { increment: 1 },
        },
      });
      await tx.projectAnalytics.upsert({
        where: { projectId: config.projectId },
        create: {
          projectId: config.projectId,
          sessions: existing ? 0 : 1,
          ...counts,
          lastEventAt: now,
        },
        update: {
          sessions: { increment: existing ? 0 : 1 },
          pageViews: { increment: counts.pageViews },
          clicks: { increment: counts.clicks },
          totalEvents: { increment: 1 },
          lastEventAt: now,
        },
      });
      await tx.projectAnalyticsConfig.update({
        where: { projectId: config.projectId },
        data: { lastIngestedAt: now, lastAggregatedAt: now },
      });
      return { accepted: true, duplicate: false };
    },
    { timeout: 15000 },
  );
}
export function trackingFailure(error: unknown) {
  return Response.json(
    {
      error:
        error instanceof TrackingError
          ? error.message
          : "Collection unavailable.",
    },
    {
      status: error instanceof TrackingError ? error.status : 503,
      headers: { "Cache-Control": "no-store", Vary: "Origin" },
    },
  );
}
export const cors = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "600",
  Vary: "Origin",
  "Cache-Control": "no-store",
});
