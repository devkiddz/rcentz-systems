import "server-only";
import { getCurrentUser } from "@/features/auth/server/get-current-user";
export class ClientMutationError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function readClientMutation(request: Request, limit = 16000) {
  const origin = request.headers.get("origin");
  if (
    !origin ||
    origin !== new URL(process.env.BETTER_AUTH_URL || request.url).origin
  )
    throw new ClientMutationError(403, "Reload the page and try again.");
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE")
    throw new ClientMutationError(401, "Sign in to continue.");
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new ClientMutationError(415, "Send a JSON request.");
  const reader = request.body?.getReader();
  if (!reader) throw new ClientMutationError(400, "Your answers are required.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new ClientMutationError(413, "Your answers are too long.");
    }
    chunks.push(value);
  }
  let input: unknown;
  try {
    input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ClientMutationError(400, "Check your answers and try again.");
  }
  return { user, input };
}
export function clientMutationFailure(error: unknown) {
  return Response.json(
    {
      error:
        error instanceof ClientMutationError
          ? error.message
          : "We could not save your changes. Please try again.",
    },
    {
      status: error instanceof ClientMutationError ? error.status : 503,
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
