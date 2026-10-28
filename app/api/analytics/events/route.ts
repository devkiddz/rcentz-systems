import {
  findSite,
  ingest,
  cors,
  trackingFailure,
  TrackingError,
} from "@/features/analytics/server/live/ingest";
import { mirrorAnalyticsToIntelligence } from "@/features/analytics/server/live/mirror-to-intelligence";
import { after } from "next/server";
export const runtime = "nodejs";
export async function OPTIONS(request: Request) {
  try {
    const origin = request.headers.get("origin") || "";
    await findSite(origin);
    return new Response(null, { status: 204, headers: cors(origin) });
  } catch (error) {
    return trackingFailure(error);
  }
}
export async function POST(request: Request) {
  const origin = request.headers.get("origin") || "";
  try {
    await findSite(origin);
    if (
      request.headers.get("content-type")?.split(";")[0].trim() !==
      "application/json"
    )
      throw new TrackingError("Send JSON.", 415);
    const reader = request.body?.getReader();
    if (!reader) throw new TrackingError("Missing event.");
    let size = 0;
    const chunks: Uint8Array[] = [];
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 4096) {
          await reader.cancel();
          throw new TrackingError("Event too large.", 413);
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    let payload: unknown;
    try {
      payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      throw new TrackingError("Invalid JSON.");
    }
    const result = await ingest(origin, payload);
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      const event = payload as Record<string, unknown>;
      if (
        typeof event.trackingKey === 'string' &&
        typeof event.eventId === 'string' &&
        typeof event.sessionKey === 'string' &&
        (event.type === 'PAGE_VIEW' || event.type === 'CLICK') &&
        typeof event.path === 'string'
      ) {
        const trackingKey = event.trackingKey;
        const eventId = event.eventId;
        const sessionKey = event.sessionKey;
        const type = event.type;
        const path = event.path;
        after(() => mirrorAnalyticsToIntelligence(origin, {
          trackingKey,
          eventId,
          sessionKey,
          type,
          path,
          ...(typeof event.action === 'string' ? { action: event.action } : {}),
          ...(typeof event.referrerHost === 'string' ? { referrerHost: event.referrerHost } : {})
        }));
      }
    }
    return Response.json(result, {
      status: 202,
      headers: cors(origin),
    });
  } catch (error) {
    const response = trackingFailure(error);
    if (error instanceof TrackingError && error.status !== 403)
      response.headers.set("Access-Control-Allow-Origin", origin);
    return response;
  }
}
