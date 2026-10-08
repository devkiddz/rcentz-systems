import { prisma } from "@/lib/prisma";
import {
  readMessages,
  sendMessage,
  openSupport,
  ChatError,
} from "@/features/messaging/server/conversations";
import {
  chatUser,
  chatBody,
  chatFailure,
  privateHeaders,
} from "@/features/messaging/server/http";
export const runtime = "nodejs";
type Context = { params: Promise<{ projectId: string }> };
async function existing(projectId: string, userId: string) {
  if (
    !(await prisma.project.findFirst({
      where: { id: projectId, clientId: userId },
      select: { id: true },
    }))
  )
    throw new ChatError("Project not found.", 404);
  return prisma.conversation.findFirst({
    where: {
      projectId,
      status: "ACTIVE",
      participants: { some: { userId, leftAt: null } },
    },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });
}
export async function GET(_request: Request, { params }: Context) {
  try {
    const user = await chatUser();
    const { projectId } = await params;
    const thread = await existing(projectId, user.id);
    return Response.json(
      thread
        ? await readMessages(thread.id, user.id)
        : { messages: [], conversationId: null },
      { headers: privateHeaders },
    );
  } catch (error) {
    return chatFailure(error);
  }
}
export async function POST(request: Request, { params }: Context) {
  try {
    const user = await chatUser();
    const body = await chatBody(request);
    const { projectId } = await params;
    const text = typeof body.message === "string" ? body.message : "";
    if (!text.trim() || text.length > 2000)
      throw new ChatError("Use between 1 and 2,000 characters.");
    const thread = await openSupport(user.id, projectId);
    return Response.json(
      {
        ...(await sendMessage(
          thread.id,
          user.id,
          text,
          typeof body.messageId === "string" ? body.messageId : undefined,
        )),
        conversationId: thread.id,
      },
      { status: 201, headers: privateHeaders },
    );
  } catch (error) {
    return chatFailure(error);
  }
}
