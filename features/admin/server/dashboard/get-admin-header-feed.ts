import 'server-only';

import { prisma } from '@/lib/prisma';

import type { AdminHeaderFeed } from '@/features/admin/types/admin-header';

function formatRelativeTime(
  date: Date,
  now: Date
) {
  const difference =
    now.getTime() - date.getTime();

  const minutes = Math.max(
    0,
    Math.floor(difference / 60000)
  );

  if (minutes < 1) {
    return 'Now';
  }

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours}h`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 7) {
    return `${days}d`;
  }

  return new Intl.DateTimeFormat(
    'en-NG',
    {
      day: 'numeric',
      month: 'short'
    }
  ).format(date);
}

export async function getAdminHeaderFeed(
  userId: string
): Promise<AdminHeaderFeed> {
  const now = new Date();

  const [
    notifications,
    unreadNotificationCount,
    conversations
  ] = await Promise.all([
    prisma.notification.findMany({
      where: {
        userId
      },

      orderBy: {
        createdAt: 'desc'
      },

      take: 8,

      select: {
        id: true,
        type: true,

        title: true,
        message: true,

        href: true,

        readAt: true,
        createdAt: true
      }
    }),

    prisma.notification.count({
      where: {
        userId,
        readAt: null
      }
    }),

    prisma.conversation.findMany({
      where: {
        status: 'ACTIVE',

        participants: {
          some: {
            userId,
            leftAt: null
          }
        }
      },

      orderBy: {
        updatedAt: 'desc'
      },

      take: 8,

      select: {
        id: true,
        subject: true,
        updatedAt: true,

        project: {
          select: {
            name: true
          }
        },

        serviceRequest: {
          select: {
            title: true
          }
        },

        supportTicket: {
          select: {
            subject: true
          }
        },

        order: {
          select: {
            orderNumber: true
          }
        },

        participants: {
          where: {
            userId,
            leftAt: null
          },

          take: 1,

          select: {
            lastReadAt: true
          }
        },

        messages: {
          where: {
            deletedAt: null
          },

          orderBy: {
            createdAt: 'desc'
          },

          take: 1,

          select: {
            id: true,
            body: true,
            senderId: true,
            createdAt: true,

            sender: {
              select: {
                name: true,
                image: true
              }
            }
          }
        }
      }
    })
  ]);

  const messages = conversations.map(
    conversation => {
      const latestMessage =
        conversation.messages[0] ?? null;

      const participant =
        conversation.participants[0] ??
        null;

      const lastReadAt =
        participant?.lastReadAt ??
        null;

      const unread =
        latestMessage !== null &&
        latestMessage.senderId !==
          userId &&
        (lastReadAt === null ||
          latestMessage.createdAt >
            lastReadAt);

      const title =
        conversation.subject ??
        conversation.project?.name ??
        conversation.serviceRequest
          ?.title ??
        conversation.supportTicket
          ?.subject ??
        (conversation.order
          ? `Order ${conversation.order.orderNumber}`
          : null) ??
        'Rcentz conversation';

      return {
        id: conversation.id,
        latestMessageId: latestMessage?.id ?? null,

        title,

        senderName:
          latestMessage?.senderId ===
          userId
            ? 'You'
            : latestMessage?.sender
                .name ?? 'Client',

        senderImage:
          latestMessage?.sender.image ??
          null,

        preview:
          latestMessage?.body?.trim() ||
          'Attachment or file shared.',

        unread,

        timeLabel: formatRelativeTime(
          latestMessage?.createdAt ??
            conversation.updatedAt,
          now
        )
      };
    }
  );

  return {
    notifications:
      notifications.map(
        notification => {
          return {
            id: notification.id,
            type: notification.type,

            title: notification.title,
            message:
              notification.message,

            href: notification.href,

            unread:
              notification.readAt ===
              null,

            timeLabel:
              formatRelativeTime(
                notification.createdAt,
                now
              )
          };
        }
      ),

    unreadNotificationCount,

    messages,

    hasUnreadMessages:
      messages.some(
        message => message.unread
      )
  };
}