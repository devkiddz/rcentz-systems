import "server-only";
import { prisma } from "@/lib/prisma";

export class ChatError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
const membership = (userId: string) => ({
  status: "ACTIVE" as const,
  participants: { some: { userId, leftAt: null } },
});
export async function authorizeConversation(id: string, userId: string) {
  const thread = await prisma.conversation.findFirst({
    where: { id, ...membership(userId) },
    select: { id: true, subject: true },
  });
  if (!thread) throw new ChatError("Conversation not found.", 404);
  return thread;
}
export async function listConversations(userId: string) {
  const threads = await prisma.conversation.findMany({
    where: membership(userId),
    take: 100,
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      subject: true,
      type: true,
      updatedAt: true,
      project: { select: { name: true } },
      participants: {
        where: { leftAt: null },
        select: {
          userId: true,
          lastReadAt: true,
          user: { select: { name: true } },
        },
      },
      messages: {
        where: { deletedAt: null },
        take: 1,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: { body: true, createdAt: true },
      },
    },
  });
  const unread = threads.length
    ? await prisma.message.groupBy({
        by: ["conversationId"],
        _count: { id: true },
        where: {
          deletedAt: null,
          senderId: { not: userId },
          OR: threads.map((thread) => {
            const read = thread.participants.find(
              (p) => p.userId === userId,
            )?.lastReadAt;
            return {
              conversationId: thread.id,
              ...(read ? { createdAt: { gt: read } } : {}),
            };
          }),
        },
      })
    : [];
  const counts = new Map(
    unread.map((row) => [row.conversationId, row._count.id]),
  );
  return threads.map((thread) => ({
    id: thread.id,
    title: thread.subject || thread.project?.name || "Rcentz support",
    people: thread.participants
      .filter((p) => p.userId !== userId)
      .map((p) => p.user.name)
      .join(", "),
    lastMessage: thread.messages[0]?.body || "Start the conversation",
    updatedAt: thread.updatedAt.toISOString(),
    unread: counts.get(thread.id) || 0,
  }));
}
export async function readMessages(
  id: string,
  userId: string,
  before?: string,
) {
  const thread = await authorizeConversation(id, userId);
  const cursor = before
    ? await prisma.message.findFirst({
        where: { id: before, conversationId: id, deletedAt: null },
        select: { id: true, createdAt: true },
      })
    : null;
  if (before && !cursor) throw new ChatError("Message not found.", 404);
  const readThrough = new Date();
  const rows = await prisma.message.findMany({
    where: {
      conversationId: id,
      deletedAt: null,
      createdAt: { lte: readThrough },
      ...(cursor
        ? {
            OR: [
              { createdAt: { lt: cursor.createdAt } },
              { createdAt: cursor.createdAt, id: { lt: cursor.id } },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 51,
    select: {
      id: true,
      body: true,
      createdAt: true,
      senderId: true,
      sender: { select: { name: true } },
    },
  });
  const readers = await prisma.conversationParticipant.findMany({
    where: { conversationId: id, userId: { not: userId }, leftAt: null },
    select: { lastReadAt: true },
  });
  return {
    conversationId: id,
    title: thread.subject || "Project conversation",
    readThrough: readThrough.toISOString(),
    hasMore: rows.length > 50,
    messages: rows
      .slice(0, 50)
      .reverse()
      .map((m) => ({
        id: m.id,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
        sender: m.sender,
        mine: m.senderId === userId,
        read: readers.some((p) => p.lastReadAt && p.lastReadAt >= m.createdAt),
      })),
  };
}
export async function markRead(id: string, userId: string, through: string) {
  await authorizeConversation(id, userId);
  const at = new Date(through);
  if (!Number.isFinite(at.getTime()) || at.getTime() > Date.now())
    throw new ChatError("Invalid read time.");
  await prisma.conversationParticipant.updateMany({
    where: {
      conversationId: id,
      userId,
      leftAt: null,
      OR: [{ lastReadAt: null }, { lastReadAt: { lt: at } }],
    },
    data: { lastReadAt: at },
  });
}
export async function sendMessage(
  id: string,
  userId: string,
  text: string,
  messageId?: string,
) {
  if (!text.trim() || text.trim().length > 2000)
    throw new ChatError("Use between 1 and 2,000 characters.");
  if (messageId && !/^[a-f0-9-]{36}$/i.test(messageId))
    throw new ChatError("Invalid message identifier.");
  await authorizeConversation(id, userId);
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${id}))`;
    // Recheck membership inside the send transaction, after acquiring the lock.
    if (
      !(await tx.conversation.findFirst({
        where: { id, ...membership(userId) },
        select: { id: true },
      }))
    )
      throw new ChatError("Conversation not found.", 404);
    if (messageId) {
      const existing = await tx.message.findUnique({
        where: { id: messageId },
        select: { conversationId: true, senderId: true, body: true },
      });
      if (existing) {
        if (
          existing.conversationId !== id ||
          existing.senderId !== userId ||
          existing.body !== text.trim()
        )
          throw new ChatError("Message identifier already used.", 409);
        return { sent: true, id: messageId };
      }
    }
    if (
      (await tx.message.count({
        where: {
          conversationId: id,
          senderId: userId,
          createdAt: { gte: new Date(Date.now() - 60000) },
        },
      })) >= 10
    )
      throw new ChatError(
        "Please wait a minute before sending more messages.",
        429,
      );
    const message = await tx.message.create({
      data: {
        ...(messageId ? { id: messageId } : {}),
        conversationId: id,
        senderId: userId,
        body: text.trim(),
      },
    });
    await tx.conversation.update({
      where: { id },
      data: { updatedAt: message.createdAt },
    });
    return { sent: true, id: message.id };
  });
}
export async function openSupport(userId: string, projectId?: string) {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"support:" + userId + ":" + (projectId || "general")}))`;
    const project = projectId
      ? await tx.project.findFirst({
          where: { id: projectId, clientId: userId },
          select: { id: true, name: true },
        })
      : null;
    if (projectId && !project) throw new ChatError("Project not found.", 404);
    const existing = await tx.conversation.findFirst({
      where: {
        ...membership(userId),
        ...(projectId ? { projectId } : { projectId: null, type: "SUPPORT" }),
      },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    });
    if (existing) return existing;
    const staff = await tx.user.findFirst({
      where: {
        status: "ACTIVE",
        role: { in: ["ADMIN", "SUPER_ADMIN"] },
        id: { not: userId },
      },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    if (!staff)
      throw new ChatError(
        "The support team is unavailable. Email contact@rcentz.cc.",
        503,
      );
    if (
      (await tx.conversation.count({
        where: {
          participants: { some: { userId } },
          createdAt: { gte: new Date(Date.now() - 3600000) },
        },
      })) >= 10
    )
      throw new ChatError(
        "Please wait before starting another conversation.",
        429,
      );
    return tx.conversation.create({
      data: {
        type: project ? "PROJECT" : "SUPPORT",
        subject: project ? project.name + " · support" : "Rcentz support",
        ...(project ? { projectId: project.id } : {}),
        participants: { create: [{ userId }, { userId: staff.id }] },
      },
      select: { id: true },
    });
  });
}
