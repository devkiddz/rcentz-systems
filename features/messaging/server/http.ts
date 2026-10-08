import { getCurrentUser } from "@/features/auth/server/get-current-user";
import { ChatError } from "./conversations";
export const privateHeaders = { "Cache-Control": "private, no-store" };
export async function chatUser() {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE")
    throw new ChatError("Sign in to use messages.", 401);
  return user;
}
export async function chatBody(request: Request) {
  if (
    request.headers.get("origin") !==
    new URL(process.env.BETTER_AUTH_URL || request.url).origin
  )
    throw new ChatError("Unverified request.", 403);
  if (
    request.headers.get("content-type")?.split(";")[0].trim() !==
    "application/json"
  )
    throw new ChatError("Send JSON.", 415);
  const reader = request.body?.getReader();
  if (!reader) throw new ChatError("A request body is required.");
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 12000) {
        await reader.cancel();
        throw new ChatError("Message is too long.", 413);
      }
      chunks.push(value);
    }
    const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      throw new ChatError("Invalid request.");
    return parsed as Record<string, unknown>;
  } catch (error) {
    if (error instanceof ChatError) throw error;
    throw new ChatError("Invalid JSON.");
  } finally {
    reader.releaseLock();
  }
}
export function chatFailure(error: unknown) {
  return Response.json(
    {
      error:
        error instanceof ChatError
          ? error.message
          : "Messages are temporarily unavailable. Please retry.",
    },
    {
      status: error instanceof ChatError ? error.status : 503,
      headers: privateHeaders,
    },
  );
}
