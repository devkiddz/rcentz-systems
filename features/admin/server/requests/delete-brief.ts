'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/features/auth/server/require-admin';
import { prisma } from '@/lib/prisma';
import { BRIEF_KEY, readBriefData } from '@/features/onboarding/server/brief-data';
import { parseBriefCloudinaryPath, removeBriefAttachment } from '@/features/onboarding/server/brief-cloudinary';

export type DeleteBriefState = { error: string };

export async function deleteAdminBrief(
  _previous: DeleteBriefState,
  form: FormData
): Promise<DeleteBriefState> {
  const admin = await requireAdmin();
  const id = String(form.get('requestId') || '');
  const confirmed = String(form.get('confirm') || '');
  if (!id || id.length > 128 || confirmed !== 'DELETE') {
    return { error: 'Type DELETE to confirm permanent removal.' };
  }

  let removed: {
    clientId: string;
    paths: string[];
  };
  try {
    removed = await prisma.$transaction(async tx => {
      // Lock against both attachment modifications and planning-project creation.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${id}))`;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'admin-brief:' + id}))`;
      const brief = await tx.serviceRequest.findUnique({
        where: { id },
        include: {
          project: { select: { id: true } },
          quote: { select: { id: true } },
          invoices: { take: 1, select: { id: true } },
          usageRecords: { take: 1, select: { id: true } },
          conversations: { take: 1, select: { id: true } },
          answers: { where: { question: { key: BRIEF_KEY } }, select: { metadata: true } }
        }
      });
      if (!brief) throw new Error('BRIEF_NOT_FOUND');
      if (!['PENDING', 'REVIEWING', 'REJECTED', 'CANCELLED'].includes(brief.status) ||
          brief.project || brief.quote || brief.invoices.length || brief.usageRecords.length ||
          brief.conversations.length) throw new Error('BRIEF_LINKED');

      const data = readBriefData(brief.answers[0]?.metadata);
      const paths = data?.attachments.map(item => item.pathname) ?? [];
      // Do not orphan old Blob files: their provider must be available for cleanup first.
      if (paths.some(path => !parseBriefCloudinaryPath(path, brief.userId, brief.id))) {
        throw new Error('BRIEF_LEGACY_MEDIA');
      }

      await tx.serviceRequest.delete({ where: { id } });
      await tx.auditLog.create({
        data: { userId: admin.id, action: 'ADMIN_BRIEF_DELETED',
          entityType: 'ServiceRequest', entityId: id,
          metadata: { clientId: brief.userId, title: brief.title, attachmentCount: paths.length } }
      });
      await tx.notification.create({
        data: { userId: brief.userId, type: 'SYSTEM', title: 'Project brief removed',
          message: `${brief.title} was removed by Rcentz administration.`,
          href: '/dashboard/requests', entityType: 'ServiceRequest', entityId: id }
      });
      return { clientId: brief.userId, paths };
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'BRIEF_NOT_FOUND') return { error: 'This brief no longer exists.' };
      if (error.message === 'BRIEF_LINKED') {
        return { error: 'This brief is linked to a project, quote, billing or delivery record, or is not eligible for permanent deletion.' };
      }
      if (error.message === 'BRIEF_LEGACY_MEDIA') {
        return { error: 'This brief contains legacy attachments that require safe storage cleanup before deletion.' };
      }
    }
    return { error: 'Could not remove the brief. No changes were made. Please try again.' };
  }

  for (const pathname of removed.paths) {
    const asset = parseBriefCloudinaryPath(pathname, removed.clientId, id);
    if (!asset) continue;
    try {
      await removeBriefAttachment(asset.publicId, asset.mediaType);
    } catch {
      // Database removal is committed. Leave a durable cleanup event for staff.
      await prisma.auditLog.create({
        data: { userId: admin.id, action: 'BRIEF_ATTACHMENT_CLEANUP_PENDING',
          entityType: 'ServiceRequest', entityId: id,
          metadata: { pathname } }
      }).catch(() => {});
    }
  }

  revalidatePath('/admin/requests');
  revalidatePath('/dashboard/requests');
  revalidatePath('/admin');
  redirect('/admin/requests');
}
