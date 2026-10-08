import { prisma } from '@/lib/prisma';
import { chatBody, chatFailure, chatUser } from '@/features/messaging/server/http';
import { ChatError } from '@/features/messaging/server/conversations';
import { resolveSafeRedirect } from '@/features/auth/lib/resolve-safe-redirect';

export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };
const projectTypes = ['PROJECT', 'PROJECT_UPDATE'] as const;

export async function GET() {
  try {
    const user = await chatUser();
    const member = { status: 'ACTIVE' as const, participants: { some: { userId: user.id, leftAt: null } } };
    const [notifications, activities, notificationCount, activityCount, participants, messageThreads] = await Promise.all([
      prisma.notification.findMany({ where: { userId: user.id }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 12 }),
      prisma.notification.findMany({ where: { userId: user.id, type: { in: [...projectTypes] } }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 12 }),
      prisma.notification.count({ where: { userId: user.id, readAt: null } }),
      prisma.notification.count({ where: { userId: user.id, readAt: null, type: { in: [...projectTypes] } } }),
      prisma.conversationParticipant.findMany({ where: { userId: user.id, leftAt: null, conversation: { status: 'ACTIVE' } }, select: { conversationId: true, lastReadAt: true } }),
      prisma.conversation.findMany({ where: member, orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }], take: 6, select: { id: true, subject: true, updatedAt: true, project: { select: { name: true } }, messages: { where: { deletedAt: null }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 1, select: { body: true } } } }),
    ]);
    const unreadMessages = participants.length ? await prisma.message.count({ where: {
      senderId: { not: user.id }, deletedAt: null,
      OR: participants.map(p => ({ conversationId: p.conversationId, ...(p.lastReadAt ? { createdAt: { gt: p.lastReadAt } } : {}) })),
    } }) : 0;
    const items = (rows: typeof notifications) => rows.map(n => ({ id: n.id, title: n.title, message: n.message, href: resolveSafeRedirect(n.href, '/dashboard/notifications'), unread: n.readAt === null, createdAt: n.createdAt.toISOString() }));
    return Response.json({ accountKey: user.id, counts: { notifications: notificationCount, activities: activityCount, messages: unreadMessages }, notifications: items(notifications), activities: items(activities), messages: messageThreads.map(t => ({ id: t.id, title: t.subject || t.project?.name || 'Rcentz support', message: t.messages[0]?.body || 'Start the conversation', href: '/dashboard/messages?conversation=' + encodeURIComponent(t.id), createdAt: t.updatedAt.toISOString() })) }, { headers });
  } catch (error) { return chatFailure(error); }
}

export async function POST(request: Request) {
  try {
    const user = await chatUser();
    const body = await chatBody(request);
    if (!Array.isArray(body.ids) || body.ids.length < 1 || body.ids.length > 12 || body.ids.some(id => typeof id !== 'string' || !id || id.length > 100)) throw new ChatError('Choose up to 12 notification records.');
    await prisma.notification.updateMany({ where: { id: { in: body.ids as string[] }, userId: user.id, readAt: null }, data: { readAt: new Date() } });
    return Response.json({ saved: true }, { headers });
  } catch (error) { return chatFailure(error); }
}
