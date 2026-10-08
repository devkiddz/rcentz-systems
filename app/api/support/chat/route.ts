import { prisma } from '@/lib/prisma';
import { readMessages, sendMessage, openSupport, ChatError } from '@/features/messaging/server/conversations';
import { chatUser, chatBody, chatFailure, privateHeaders } from '@/features/messaging/server/http';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await chatUser();
    const thread = await prisma.conversation.findFirst({ where: { projectId: null, type: 'SUPPORT', status: 'ACTIVE', participants: { some: { userId: user.id, leftAt: null } } }, orderBy: { updatedAt: 'desc' }, select: { id: true } });
    return Response.json(thread ? await readMessages(thread.id, user.id) : { messages: [], conversationId: null }, { headers: privateHeaders });
  } catch (error) { return chatFailure(error); }
}
export async function POST(request: Request) {
  try {
    const user = await chatUser();
    const body = await chatBody(request);
    const text = typeof body.message === 'string' ? body.message : '';
    if (!text.trim() || text.length > 2000) throw new ChatError('Use between 1 and 2,000 characters.');
    const thread = await openSupport(user.id);
    return Response.json({ ...(await sendMessage(thread.id, user.id, text, typeof body.messageId === 'string' ? body.messageId : undefined)), conversationId: thread.id }, { status: 201, headers: privateHeaders });
  } catch (error) { return chatFailure(error); }
}
