import { randomUUID } from 'node:crypto';
import { get } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/features/auth/server/get-current-user';
import { BRIEF_KEY, readBriefData, writeBriefData, legacyBrief, uploadsConfigured } from '@/features/onboarding/server/brief-data';
import {
  briefAttachmentDeliveryUrl,
  parseBriefCloudinaryPath,
  uploadBriefAttachment,
  removeBriefAttachment,
  type BriefMediaType
} from '@/features/onboarding/server/brief-cloudinary';
import { MAX_FILE_SIZE, detectBriefFile } from '@/features/onboarding/server/brief-files';

export const runtime = 'nodejs';
const permittedTypes = new Set(['application/pdf', 'image/png', 'image/jpeg', 'image/webp']);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ requestId: string; fileId: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.status !== 'ACTIVE') {
    return new Response('Sign in required', { status: 401 });
  }

  const { requestId, fileId } = await params;
  const admin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
  const saved = await prisma.serviceRequest.findFirst({
    where: {
      id: requestId,
      ...(admin ? { status: { not: 'DRAFT' as const } } : { userId: user.id })
    },
    select: {
      userId: true,
      answers: {
        where: { question: { key: BRIEF_KEY } },
        select: { metadata: true }
      }
    }
  });
  const file = readBriefData(saved?.answers[0]?.metadata)?.attachments.find(
    item => item.id === fileId
  );
  if (!saved || !file || !permittedTypes.has(file.type)) {
    return new Response('File not found', { status: 404 });
  }

  const asPreview = new URL(request.url).searchParams.get('preview') === '1';
  const inline = asPreview && file.type.startsWith('image/');
  const headers = {
    'Content-Type': file.type,
    'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(file.name)}`,
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "sandbox; default-src 'none'"
  };

  try {
    // New attachments: private, authenticated Cloudinary assets. The signed
    // delivery URL is used server-side only, after request ownership checks.
    const media = parseBriefCloudinaryPath(file.pathname, saved.userId, requestId);
    if (media) {
      if (
        (file.type === 'application/pdf' && media.mediaType !== 'raw') ||
        (file.type !== 'application/pdf' && media.mediaType !== 'image')
      ) return new Response('File not found', { status: 404 });

      const deliveryUrl = briefAttachmentDeliveryUrl(media.publicId, media.mediaType);
      const url = new URL(deliveryUrl);
      if (url.protocol !== 'https:' || url.hostname !== 'res.cloudinary.com') {
        return new Response('File unavailable', { status: 503 });
      }
      const response = await fetch(deliveryUrl, {
        cache: 'no-store',
        redirect: 'error',
        signal: AbortSignal.timeout(15000)
      });
      if (!response.ok || !response.body) {
        return new Response('File unavailable', { status: 503 });
      }
      const remoteSize = Number(response.headers.get('content-length'));
      if (response.headers.has('content-length') && remoteSize > MAX_FILE_SIZE) {
        await response.body.cancel();
        return new Response('File unavailable', { status: 503 });
      }
      return new Response(response.body, { headers });
    }

    // Legacy compatibility only: do not upload new files to Blob. These paths
    // may exist on previously submitted briefs and must remain readable.
    const legacyPrefix = `briefs/${saved.userId}/${requestId}/`;
    if (!file.pathname.startsWith(legacyPrefix)) {
      return new Response('File not found', { status: 404 });
    }
    const blob = await get(file.pathname, { access: 'private' });
    if (!blob || blob.statusCode !== 200) {
      return new Response('File unavailable', { status: 404 });
    }
    return new Response(blob.stream, { headers });
  } catch {
    return new Response('File unavailable', { status: 503 });
  }
}

// Only an active owner can mutate attachments on a DRAFT/PENDING request with
// no linked project. Administrators have READ access only through this endpoint.
type OwnerAccess = { ok: true; userId: string } | { ok: false; status: number };

async function permittedOwner(request: Request, requestId: string): Promise<OwnerAccess> {
  const expectedOrigin = new URL(process.env.BETTER_AUTH_URL || request.url).origin;
  if (request.headers.get('origin') !== expectedOrigin) return { ok: false, status: 403 };
  const user = await getCurrentUser();
  if (!user || user.status !== 'ACTIVE') return { ok: false, status: 401 };
  const owned = await prisma.serviceRequest.findFirst({
    where: { id: requestId, userId: user.id },
    select: { id: true, status: true, project: { select: { id: true } } }
  });
  if (!owned) return { ok: false, status: 404 };
  if (!['DRAFT', 'PENDING'].includes(owned.status) || owned.project) return { ok: false, status: 409 };
  return { ok: true, userId: user.id };
}

function mutationError(status: number) {
  const messages: Record<number, string> = {
    400: 'Choose a valid file.',
    401: 'Please sign in again.',
    403: 'Reload this page and try again.',
    404: 'Attachment not found.',
    409: 'This request can no longer be edited or the attachment has changed.',
    413: 'Each attachment must be 2 MB or smaller.',
    415: 'Choose a PDF, PNG, JPEG or WebP file.',
    503: 'Private storage is unavailable.'
  };
  return Response.json({ error: messages[status] || 'Please try again.' }, { status });
}

function safeName(name: string, extension: string) {
  return name.replace(/[\r\n\x00-\x1f]/g, '').slice(0, 160) || `reference.${extension}`;
}

async function incomingFile(request: Request): Promise<
  | { errorStatus: number }
  | { bytes: Uint8Array; name: string; size: number; type: string; extension: string; mediaType: BriefMediaType }
> {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.startsWith('multipart/form-data;')) return { errorStatus: 415 };
  const reader = request.body?.getReader();
  if (!reader) return { errorStatus: 400 };
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_FILE_SIZE + 65536) {
      await reader.cancel();
      return { errorStatus: 413 };
    }
    chunks.push(value);
  }
  const form = await new Response(Buffer.concat(chunks), { headers: { 'content-type': contentType } }).formData();
  const file = form.get('file');
  if (!(file instanceof File) || !file.size || file.size > MAX_FILE_SIZE) return { errorStatus: 400 };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const format = detectBriefFile(bytes);
  if (!format) return { errorStatus: 415 };
  return {
    bytes,
    size: file.size,
    name: safeName(file.name, format.extension),
    type: format.type,
    extension: format.extension,
    mediaType: format.type === 'application/pdf' ? 'raw' : 'image'
  };
}

async function cleanupOldCloudinary(pathname: string, ownerId: string, requestId: string) {
  const previous = parseBriefCloudinaryPath(pathname, ownerId, requestId);
  if (!previous) return false;
  try {
    await removeBriefAttachment(previous.publicId, previous.mediaType);
    return false;
  } catch {
    // Metadata is already committed; surface the cleanup issue for follow-up.
    console.error('[brief-attachment] prior Cloudinary asset cleanup failed', { requestId });
    return true;
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ requestId: string; fileId: string }> }
) {
  const { requestId, fileId } = await params;
  const access = await permittedOwner(request, requestId);
  if (!access.ok) return mutationError(access.status);
  if (!uploadsConfigured()) return mutationError(503);
  let pendingUpload: { publicId: string; mediaType: BriefMediaType } | null = null;
  try {
    const incoming = await incomingFile(request);
    if ('errorStatus' in incoming) return mutationError(incoming.errorStatus);
    const id = randomUUID();
    const publicId = `rcentz/briefs/${access.userId}/${requestId}/${id}${incoming.mediaType === 'raw' ? '.pdf' : ''}`;

    // Provider I/O happens before acquiring the transaction lock.
    const upload = await uploadBriefAttachment(incoming.bytes, publicId, incoming.mediaType);
    pendingUpload = { publicId: upload.public_id, mediaType: incoming.mediaType };
    const previous = await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${requestId}))`;
      const saved = await tx.serviceRequest.findFirst({
        where: { id: requestId, userId: access.userId },
        include: {
          service: { select: { slug: true } },
          project: { select: { id: true } },
          answers: { where: { question: { key: BRIEF_KEY } }, select: { metadata: true } }
        }
      });
      if (!saved) return { ok: false as const, status: 404 as const };
      if (!['DRAFT', 'PENDING'].includes(saved.status) || saved.project) return { ok: false as const, status: 409 as const };
      const data = readBriefData(saved.answers[0]?.metadata) || {
        version: 1 as const, brief: legacyBrief(saved), attachments: []
      };
      const index = data.attachments.findIndex(file => file.id === fileId);
      if (index < 0) return { ok: false as const, status: 404 as const };
      const old = data.attachments[index];
      if (!parseBriefCloudinaryPath(old.pathname, access.userId, requestId)) return { ok: false as const, status: 409 as const };
      const replacement = {
        id: fileId, name: incoming.name, size: incoming.size,
        type: incoming.type, pathname: `cloudinary:${incoming.mediaType}:${upload.public_id}`
      };
      const attachments = [...data.attachments];
      attachments[index] = replacement;
      await writeBriefData(tx, saved, { ...data, attachments });
      return { ok: true as const, oldPath: old.pathname };
    }, { timeout: 15000 });
    if (!previous.ok) return mutationError(previous.status);
    pendingUpload = null;
    const cleanupPending = await cleanupOldCloudinary(previous.oldPath, access.userId, requestId);
    return Response.json({ id: fileId, name: incoming.name, type: incoming.type, size: incoming.size, cleanupPending });
  } catch {
    console.error('[brief-attachment] replacement failed', { requestId });
    return Response.json({ error: 'Could not replace this attachment. Your existing file is still available.' }, { status: 503 });
  } finally {
    if (pendingUpload) {
      await removeBriefAttachment(pendingUpload.publicId, pendingUpload.mediaType).catch(() => {
        console.error('[brief-attachment] replacement rollback cleanup failed', { requestId });
      });
    }
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ requestId: string; fileId: string }> }
) {
  const { requestId, fileId } = await params;
  const access = await permittedOwner(request, requestId);
  if (!access.ok) return mutationError(access.status);
  try {
    const deleted = await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${requestId}))`;
      const saved = await tx.serviceRequest.findFirst({
        where: { id: requestId, userId: access.userId },
        include: {
          service: { select: { slug: true } },
          project: { select: { id: true } },
          answers: { where: { question: { key: BRIEF_KEY } }, select: { metadata: true } }
        }
      });
      if (!saved) return { ok: false as const, status: 404 as const };
      if (!['DRAFT', 'PENDING'].includes(saved.status) || saved.project) return { ok: false as const, status: 409 as const };
      const data = readBriefData(saved.answers[0]?.metadata) || {
        version: 1 as const, brief: legacyBrief(saved), attachments: []
      };
      const old = data.attachments.find(file => file.id === fileId);
      if (!old) return { ok: false as const, status: 404 as const };
      if (!parseBriefCloudinaryPath(old.pathname, access.userId, requestId)) return { ok: false as const, status: 409 as const };
      await writeBriefData(tx, saved, {
        ...data, attachments: data.attachments.filter(file => file.id !== fileId)
      });
      return { ok: true as const, pathname: old.pathname };
    }, { timeout: 15000 });
    if (!deleted.ok) return mutationError(deleted.status);
    const cleanupPending = await cleanupOldCloudinary(deleted.pathname, access.userId, requestId);
    return Response.json({ deleted: true, cleanupPending });
  } catch {
    console.error('[brief-attachment] delete failed', { requestId });
    return Response.json({ error: 'Could not remove this attachment. Try again.' }, { status: 503 });
  }
}
