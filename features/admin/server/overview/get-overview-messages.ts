import 'server-only';

import {
  listConversations
} from '@/features/messaging/server/conversations';

export async function getOverviewMessages(userId: string) {
  const conversations = await listConversations(userId);

  return {
    conversations: conversations.slice(0, 20),
    conversationCount: conversations.length,
    unreadCount: conversations.reduce(
      (total, conversation) => total + conversation.unread,
      0
    )
  };
}

export type OverviewMessages = Awaited<
  ReturnType<typeof getOverviewMessages>
>;
