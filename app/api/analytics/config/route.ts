import {
  findSite,
  cors,
  trackingFailure,
} from "@/features/analytics/server/live/ingest";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    const origin = request.headers.get("origin") || "";
    const config = await findSite(origin);
    return Response.json(
      { trackingKey: config.trackingKey },
      { headers: cors(origin) },
    );
  } catch (error) {
    return trackingFailure(error);
  }
}
