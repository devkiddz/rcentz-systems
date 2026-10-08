import {
  listConversations,
  openSupport,
} from "@/features/messaging/server/conversations";
import {
  chatUser,
  chatBody,
  chatFailure,
  privateHeaders,
} from "@/features/messaging/server/http";
export const runtime = "nodejs";
export async function GET() {
  try {
    const user = await chatUser();
    return Response.json(
      { conversations: await listConversations(user.id) },
      { headers: privateHeaders },
    );
  } catch (error) {
    return chatFailure(error);
  }
}
export async function POST(request: Request) {
  try {
    const user = await chatUser();
    const body = await chatBody(request);
    const thread = await openSupport(
      user.id,
      typeof body.projectId === "string" ? body.projectId : undefined,
    );
    return Response.json(thread, { status: 201, headers: privateHeaders });
  } catch (error) {
    return chatFailure(error);
  }
}
