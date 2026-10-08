import { notFound } from "next/navigation";
import { requireAuth } from "@/features/auth/server/require-auth";
import {
  authorizeConversation,
  listConversations,
} from "@/features/messaging/server/conversations";
import { MessageWorkspace } from "@/features/messaging/components/MessageWorkspace";
export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string; new?: string }>;
}) {
  const user = await requireAuth("/dashboard/messages");
  const query = await searchParams;
  if (query.conversation) {
    try {
      await authorizeConversation(query.conversation, user.id);
    } catch {
      notFound();
    }
  }
  const threads = await listConversations(user.id);
  return (
    <MessageWorkspace initialThreads={threads} initialId={query.conversation} />
  );
}
