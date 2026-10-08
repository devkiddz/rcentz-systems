import {
  readMessages,
  sendMessage,
} from "@/features/messaging/server/conversations";
import {
  chatUser,
  chatBody,
  chatFailure,
  privateHeaders,
} from "@/features/messaging/server/http";
export const runtime = "nodejs";
type Context = { params: Promise<{ conversationId: string }> };
export async function GET(request: Request, { params }: Context) {
  try {
    const user = await chatUser();
    const { conversationId } = await params;
    return Response.json(
      await readMessages(
        conversationId,
        user.id,
        new URL(request.url).searchParams.get("before") || undefined,
      ),
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
    const { conversationId } = await params;
    return Response.json(
      await sendMessage(
        conversationId,
        user.id,
        typeof body.message === "string" ? body.message : "",
        typeof body.messageId === "string" ? body.messageId : undefined,
      ),
      { status: 201, headers: privateHeaders },
    );
  } catch (error) {
    return chatFailure(error);
  }
}
