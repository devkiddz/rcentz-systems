'use server';

import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/features/auth/server/require-admin';

import { prisma } from '@/lib/prisma';

function revalidateAdminNotificationSurfaces() {
  revalidatePath(
    '/admin',
    'layout'
  );

  revalidatePath(
    '/admin/notifications'
  );
}

export async function markAdminNotificationRead(
  notificationId: string
) {
  const admin =
    await requireAdmin();

  const id =
    notificationId.trim();

  if (!id) {
    return {
      success: false as const
    };
  }

  await prisma.notification.updateMany({
    where: {
      id,
      userId: admin.id,
      readAt: null
    },

    data: {
      readAt: new Date()
    }
  });

  revalidateAdminNotificationSurfaces();

  return {
    success: true as const
  };
}

export async function markAllAdminNotificationsRead() {
  const admin =
    await requireAdmin();

  await prisma.notification.updateMany({
    where: {
      userId: admin.id,
      readAt: null
    },

    data: {
      readAt: new Date()
    }
  });

  revalidateAdminNotificationSurfaces();

  return {
    success: true as const
  };
}

export async function markAdminConversationRead(
  conversationId: string
) {
  const admin =
    await requireAdmin();

  const id =
    conversationId.trim();

  if (!id) {
    return {
      success: false as const
    };
  }

  await prisma.conversationParticipant.updateMany({
    where: {
      conversationId: id,
      userId: admin.id,
      leftAt: null
    },

    data: {
      lastReadAt: new Date()
    }
  });

  revalidatePath(
    '/admin',
    'layout'
  );
  revalidatePath('/admin/messages');

  return {
    success: true as const
  };
}
export async function markAllAdminConversationsRead() {
  const admin = await requireAdmin();
  const cutoff = new Date();

  await prisma.conversationParticipant.updateMany({
    where: {
      userId: admin.id,
      leftAt: null,
      conversation: { status: 'ACTIVE' }
    },
    data: { lastReadAt: cutoff }
  });

  revalidatePath('/admin', 'layout');
  revalidatePath('/admin/messages');

  return { success: true as const };
}
