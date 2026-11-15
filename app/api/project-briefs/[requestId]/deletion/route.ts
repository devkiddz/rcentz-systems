import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/features/auth/server/get-current-user';
import { BRIEF_KEY, readBriefData } from '@/features/onboarding/server/brief-data';
import { parseBriefCloudinaryPath, removeBriefAttachment } from '@/features/onboarding/server/brief-cloudinary';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

function reply(error: string, status: number, code: string) {
  return Response.json({ error, code }, { status, headers: { 'Cache-Control': 'no-store' } });
}

const removableStatuses: string[] = ['DRAFT', 'PENDING', 'REJECTED', 'CANCELLED'];

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    return reply('Reload this page and try again.', 403, 'ORIGIN');
  }
  const { requestId } = await params;
  if (!requestId || requestId.length > 128) {
    return reply('Brief not found.', 404, 'NOT_FOUND');
  }
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return reply('Invalid request format.', 415, 'FORMAT');
  }

  let input: unknown;
  try {
    if (Number(request.headers.get('content-length') || 0) > 4096) {
      return reply('Request is too long.', 413, 'TOO_LARGE');
    }
    const reader = request.body?.getReader();
    if (!reader) return reply('Reason and confirmation are required.', 400, 'REQUIRED');
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 4096) {
        await reader.cancel();
        return reply('Request is too long.', 413, 'TOO_LARGE');
      }
      chunks.push(value);
    }
    input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return reply('Invalid request data.', 400, 'INVALID_JSON');
  }
  const data = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const reason = typeof data.reason === 'string' ? data.reason.trim() : '';
  if (reason.length < 20 || reason.length > 1500) {
    return reply('Explain the deletion in 20 to 1,500 characters.', 400, 'REASON');
  }
  if (data.confirm !== 'DELETE') {
    return reply('Type DELETE to confirm removal of this brief.', 400, 'CONFIRMATION');
  }

  try {
    const user = await getCurrentUser();
    if (!user || user.status !== 'ACTIVE') {
      return reply('Please sign in again.', 401, 'AUTH_REQUIRED');
    }
    const result = await prisma.$transaction(async tx => {
      // Coordinate with existing brief upload and admin deletion operations.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${requestId}))`;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'admin-brief:' + requestId}))`;
      const brief = await tx.serviceRequest.findFirst({
        where: { id: requestId, userId: user.id },
        include: {
          project: { select: { id: true } },
          quote: { select: { id: true } },
          invoices: { select: { id: true }, take: 1 },
          usageRecords: { select: { id: true }, take: 1 },
          conversations: { select: { id: true }, take: 1 },
          answers: {
            where: { question: { key: BRIEF_KEY } },
            select: { metadata: true }
          }
        }
      });
      if (!brief) return { code: 404 as const };
      if (!removableStatuses.some(status => status === brief.status) ||
          brief.project || brief.quote || brief.invoices.length ||
          brief.usageRecords.length || brief.conversations.length) {
        return { code: 409 as const };
      }
      const paths = readBriefData(brief.answers[0]?.metadata)?.attachments.map(item => item.pathname) || [];
      if (paths.some(path => !parseBriefCloudinaryPath(path, brief.userId, brief.id))) {
        return { code: 422 as const };
      }
      await tx.serviceRequest.delete({ where: { id: requestId } });
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'CLIENT_BRIEF_DELETED',
          entityType: 'ServiceRequest',
          entityId: requestId,
          metadata: { title: brief.title, reason, attachmentCount: paths.length, attachmentPaths: paths }
        }
      });
      return { code: 200 as const, paths, ownerId: brief.userId };
    });

    if (result.code === 404) return reply('This brief could not be found in your account.', 404, 'NOT_FOUND');
    if (result.code === 409) {
      return reply('This brief is under review or linked to an active project, quotation, invoice, or delivery record. Contact Rcentz for removal.', 409, 'PROTECTED_BRIEF');
    }
    if (result.code === 422) {
      return reply('This brief contains legacy attachments that need administrator-assisted cleanup.', 422, 'LEGACY_FILES');
    }

    let cleanupPending = 0;
    for (const pathname of result.paths) {
      const asset = parseBriefCloudinaryPath(pathname, result.ownerId, requestId);
      if (!asset) continue;
      try {
        await removeBriefAttachment(asset.publicId, asset.mediaType);
      } catch (error) {
        cleanupPending++;
        console.error('[client-brief-deletion] storage cleanup failed', requestId, error);
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'BRIEF_ATTACHMENT_CLEANUP_PENDING',
            entityType: 'ServiceRequest',
            entityId: requestId,
            metadata: { pathname }
          }
        }).catch(() => {});
      }
    }
    try {
      revalidatePath('/dashboard/requests');
      revalidatePath('/admin/requests');
    } catch (error) {
      console.error('[client-brief-deletion] revalidation failed', error);
    }
    return Response.json(
      { deleted: true, cleanupPending },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[client-brief-deletion] failed for brief', requestId, error);
    return reply('Server could not remove the brief. Check the development terminal.', 500, 'SERVER_ERROR');
  }
}
