import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/features/auth/server/get-current-user';
import {
  PROJECT_DELETION_MARKER,
  PROJECT_DELETION_TITLE
} from '@/features/projects/lib/deletion';

export const runtime = 'nodejs';

function reply(error: string, status: number, code: string) {
  return Response.json({ error, code }, { status, headers: { 'Cache-Control': 'no-store' } });
}

// Validate against the actual HTTP request URL, not BETTER_AUTH_URL. A local
// development tab may legitimately use localhost while auth points elsewhere.
function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  return !origin || origin === new URL(request.url).origin;
}

type ReasonInput =
  | { ok: true; reason: string }
  | { ok: false; status: number; error: string; code: string };

async function readReason(request: Request): Promise<ReasonInput> {
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return { ok: false, status: 415, error: 'Invalid request format.', code: 'FORMAT' } as const;
  }
  const reader = request.body?.getReader();
  if (!reader) return { ok: false, status: 400, error: 'A deletion reason is required.', code: 'REASON' } as const;
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 4096) {
        await reader.cancel();
        return { ok: false, status: 413, error: 'Request is too long.', code: 'TOO_LARGE' } as const;
      }
      chunks.push(value);
    }
    const body: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    const reason = body && typeof body === 'object' && 'reason' in body
      ? (body as { reason: unknown }).reason : null;
    if (typeof reason !== 'string' || reason.trim().length < 20 || reason.trim().length > 1500) {
      return { ok: false, status: 400, error: 'Please give a reason between 20 and 1,500 characters.', code: 'REASON' } as const;
    }
    return { ok: true, reason: reason.trim() };
  } catch {
    return { ok: false, status: 400, error: 'Invalid request data.', code: 'INVALID_JSON' } as const;
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  if (!sameOrigin(request)) {
    return reply('Reload this page and try again.', 403, 'ORIGIN');
  }
  const { projectId } = await params;
  if (!projectId || projectId.length > 128) {
    return reply('Project not found.', 404, 'NOT_FOUND');
  }

  const payload = await readReason(request);
  if (!payload.ok) return reply(payload.error, payload.status, payload.code);

  try {
    const user = await getCurrentUser();
    if (!user || user.status !== 'ACTIVE') {
      return reply('Please sign in again.', 401, 'AUTH_REQUIRED');
    }
    const result = await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'project-deletion:' + projectId}))`;
      const project = await tx.project.findFirst({
        where: { id: projectId, clientId: user.id },
        select: { id: true, name: true, status: true }
      });
      if (!project) return { code: 404 as const };
      if (project.status === 'CANCELLED') return { code: 409 as const };

      const existing = await tx.projectProcess.findFirst({
        where: {
          projectId,
          type: 'OTHER',
          impact: PROJECT_DELETION_MARKER,
          status: { in: ['PENDING', 'IN_PROGRESS', 'RESOLVED'] }
        },
        select: { id: true }
      });
      if (existing) return { code: 409 as const };

      const created = await tx.projectProcess.create({
        data: {
          projectId,
          createdById: user.id,
          type: 'OTHER',
          status: 'PENDING',
          visibility: 'INTERNAL',
          title: PROJECT_DELETION_TITLE,
          description: 'Customer requests removal of this project from their workspace.',
          reason: payload.reason,
          impact: PROJECT_DELETION_MARKER,
          blocking: false,
          requiresClientAction: false
        },
        select: { id: true }
      });
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'PROJECT_DELETION_REQUESTED',
          entityType: 'Project',
          entityId: projectId,
          metadata: { requestId: created.id, reason: payload.reason }
        }
      });
      const administrators = await tx.user.findMany({
        where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] }, status: 'ACTIVE' },
        select: { id: true }
      });
      if (administrators.length) {
        await tx.notification.createMany({
          data: administrators.map(admin => ({
            userId: admin.id,
            type: 'PROJECT' as const,
            title: 'Project deletion requested',
            message: `${project.name}: customer requested deletion review.`,
            href: '/admin/projects/deletion-requests',
            entityType: 'Project',
            entityId: projectId
          }))
        });
      }
      return { code: 201 as const, id: created.id };
    }, { maxWait: 10000, timeout: 20000 });

    if (result.code !== 201) {
      return result.code === 404
        ? reply('Project not found or not owned by this account.', 404, 'NOT_FOUND')
        : reply('A deletion request is already active or the project cannot be deleted.', 409, 'ALREADY_REQUESTED');
    }

    // Revalidation must not turn a successfully committed request into a false error.
    try {
      revalidatePath(`/dashboard/projects/${projectId}`);
      revalidatePath('/admin/projects/deletion-requests');
    } catch (error) {
      console.error('[project-deletion-request] post-commit revalidation failed', error);
    }
    return Response.json(
      { requestId: result.id, status: 'PENDING' },
      { status: 201, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    // A server log identifies the actual failing operation without leaking it to clients.
    console.error('[project-deletion-request] failed for project', projectId, error);
    return reply('Server could not save the deletion request. Check the development server log.', 500, 'SERVER_ERROR');
  }
}
