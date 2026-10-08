import 'server-only';

import { cache } from 'react';

import { headers } from 'next/headers';

import { isAuthConfigured } from '@/features/auth/lib/auth-configuration';

/**
 * Canonical server-side identity resolver.
 *
 * Better Auth proves the request owns a valid session.
 * Prisma then resolves the current Rcentz user record so
 * authorization always works from current database state.
 *
 * This function deliberately does NOT decide whether a user
 * is allowed into a particular surface.
 *
 * Authorization belongs to require-auth / require-admin.
 */
export const getCurrentUser = cache(async () => {
  if (!isAuthConfigured()) return null;
  const { auth } = await import('@/lib/auth');
  const { prisma } = await import('@/lib/prisma');
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id
    },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
      status: true,
      phone: true,
      bio: true,
      createdAt: true,
      updatedAt: true,
      lastSeenAt: true
    }
  });

  return user;
});

export type CurrentUser = NonNullable<
  Awaited<ReturnType<typeof getCurrentUser>>
>;
