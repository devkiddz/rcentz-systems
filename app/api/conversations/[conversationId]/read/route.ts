import { markRead, ChatError } from "@/features/messaging/server/conversations";
import {
  chatUser,
  chatBody,
  chatFailure,
  privateHeaders,
} from "@/features/messaging/server/http";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const user = await chatUser();
    const body = await chatBody(request);
    if (typeof body.through !== "string")
      throw new ChatError("Invalid read time.");
    const { conversationId } = await params;
    await markRead(conversationId, user.id, body.through);
    return Response.json({ read: true }, { headers: privateHeaders });
  } catch (error) {
    return chatFailure(error);
  }
}
