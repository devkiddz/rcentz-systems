import 'server-only';
import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/features/auth/server/require-admin';
export const getAdminBrief = cache(async (id: string) => {
  await requireAdmin();
  return prisma.serviceRequest.findFirst({ where: { id, status: { not: 'DRAFT' } }, include: {
    user: { select: { name: true, email: true } }, service: { select: { name: true } },
    project: { select: { id: true, name: true } },
    answers: { include: { question: { select: { key: true } }, selectedOptions: { include: { option: { select: { label: true } } } } } }
  } });
});
export type AdminBrief = NonNullable<Awaited<ReturnType<typeof getAdminBrief>>>;
