import { notFound } from 'next/navigation';
import { requireAdmin } from '@/features/auth/server/require-admin';
import { authorizeConversation, listConversations } from '@/features/messaging/server/conversations';
import { MessageWorkspace } from '@/features/messaging/components/MessageWorkspace';
export default async function Page({ searchParams }: { searchParams: Promise<{ conversation?: string }> }) {
  const admin = await requireAdmin();
  const query = await searchParams;
  if (query.conversation) {
    try { await authorizeConversation(query.conversation, admin.id); } catch { notFound(); }
  }
  const threads = await listConversations(admin.id);
  return <MessageWorkspace initialThreads={threads} initialId={query.conversation} allowNewSupport={false} />;
}
