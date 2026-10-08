import { getCurrentUser } from "@/features/auth/server/get-current-user";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
type Context = { params: Promise<{ projectId: string }> };
async function findConversation(projectId: string, userId: string) {
  return prisma.conversation.findFirst({
    where: {
      projectId,
      status: "ACTIVE",
      project: { clientId: userId },
      participants: { some: { userId, leftAt: null } },
    },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });
}
export async function GET(_request: Request, { params }: Context) {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE")
    return Response.json(
      { error: "Sign in to read support messages." },
      { status: 401 },
    );
  const { projectId } = await params;
  const conversation = await findConversation(projectId, user.id);
  if (!conversation)
    return Response.json(
      { error: "No active support conversation. Contact contact@rcentz.cc." },
      { status: 404 },
    );
  const messages = await prisma.message.findMany({
    where: { conversationId: conversation.id, deletedAt: null },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 30,
    select: {
      id: true,
      body: true,
      createdAt: true,
      senderId: true,
      sender: { select: { name: true } },
    },
  });
  return Response.json(
    {
      messages: messages
        .reverse()
        .map((message) => ({
          ...message,
          mine: message.senderId === user.id,
          senderId: undefined,
        })),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
export async function POST(request: Request, { params }: Context) {
  const trustedOrigin = new URL(process.env.BETTER_AUTH_URL || request.url)
    .origin;
  if (request.headers.get("origin") !== trustedOrigin)
    return Response.json({ error: "Unverified request." }, { status: 403 });
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return Response.json({ error: "Send JSON." }, { status: 415 });
  // Bound the streamed request before parsing, even when Content-Length is absent.
  const reader = request.body?.getReader();
  if (!reader)
    return Response.json({ error: "Write a message." }, { status: 400 });
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 12000) {
      await reader.cancel();
      return Response.json({ error: "Message is too long." }, { status: 413 });
    }
    chunks.push(value);
  }
  let body: unknown;
  try {
    body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return Response.json({ error: "Invalid message." }, { status: 400 });
  }
  const text =
    body &&
    typeof body === "object" &&
    "message" in body &&
    typeof body.message === "string"
      ? body.message.trim()
      : "";
  if (!text || text.length > 2000)
    return Response.json(
      { error: "Use between 1 and 2,000 characters." },
      { status: 400 },
    );
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE")
    return Response.json(
      { error: "Sign in to send messages." },
      { status: 401 },
    );
  const { projectId } = await params;
  const conversation = await findConversation(projectId, user.id);
  if (!conversation)
    return Response.json(
      {
        error:
          "Support conversation is not available. Contact contact@rcentz.cc.",
      },
      { status: 404 },
    );
  // A per-conversation transaction lock serialises burst checks across instances.
  const saved = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${conversation.id}))`;
    const recent = await tx.message.count({
      where: {
        conversationId: conversation.id,
        senderId: user.id,
        createdAt: { gte: new Date(Date.now() - 60000) },
      },
    });
    if (recent >= 10) return false;
    await tx.message.create({
      data: { conversationId: conversation.id, senderId: user.id, body: text },
    });
    await tx.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });
    return true;
  });
  return saved
    ? Response.json({ sent: true }, { status: 201 })
    : Response.json(
        { error: "Please wait a minute before sending more messages." },
        { status: 429 },
      );
}
