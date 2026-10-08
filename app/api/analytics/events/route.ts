import {
  findSite,
  ingest,
  cors,
  trackingFailure,
  TrackingError,
} from "@/features/analytics/server/live/ingest";
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
    return Response.json(await ingest(origin, payload), {
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
