import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/features/auth/server/get-current-user';
import {
  BRIEF_KEY, readBriefData, writeBriefData, legacyBrief, uploadsConfigured
} from '@/features/onboarding/server/brief-data';
import {
  uploadBriefAttachment, removeBriefAttachment, type BriefMediaType
} from '@/features/onboarding/server/brief-cloudinary';
import { MAX_FILE_SIZE, detectBriefFile } from '@/features/onboarding/server/brief-files';

export const runtime = 'nodejs';

type UploadStage = 'storage' | 'database';

function recordFailure(error: unknown, stage: UploadStage) {
  // Server-side diagnostics only; never print credentials, payloads or the full provider response.
  const details = error && typeof error === 'object' ? error as Record<string, unknown> : {};
  const code = details.code;
  const httpCode = details.http_code;
  console.error('[brief-attachment]', {
    stage,
    code: typeof code === 'string' ? code.slice(0, 32) : undefined,
    httpCode: typeof httpCode === 'number' ? httpCode : undefined,
    errorType: error instanceof Error ? error.name : 'UnknownError'
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  if (request.headers.get('origin') !== new URL(process.env.BETTER_AUTH_URL || request.url).origin) {
    return Response.json({ error: 'Reload and try again.', code: 'ORIGIN_MISMATCH' }, { status: 403 });
  }

  const user = await getCurrentUser();
  if (!user || user.status !== 'ACTIVE') {
    return Response.json({ error: 'Sign in to upload a file.', code: 'SESSION_REQUIRED' }, { status: 401 });
  }

  const { requestId } = await params;
  const owned = await prisma.serviceRequest.findFirst({
    where: { id: requestId, userId: user.id },
    select: { id: true, status: true, project: { select: { id: true } } }
  });
  if (!owned) return Response.json({ error: 'Brief not found.' }, { status: 404 });
  if (!['DRAFT', 'PENDING'].includes(owned.status) || owned.project) {
    return Response.json({ error: 'This brief can no longer accept files.' }, { status: 409 });
  }
  if (!uploadsConfigured()) {
    return Response.json({ error: 'Private attachment storage is unavailable.', code: 'STORAGE_NOT_CONFIGURED' }, { status: 503 });
  }
  if (!request.headers.get('content-type')?.startsWith('multipart/form-data;')) {
    return Response.json({ error: 'Choose a project file.' }, { status: 415 });
  }

  let stage: UploadStage = 'storage';
  let uploadedAsset: { publicId: string; mediaType: BriefMediaType } | null = null;
  try {
    const reader = request.body?.getReader();
    if (!reader) return Response.json({ error: 'Choose a file.' }, { status: 400 });
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_FILE_SIZE + 65536) {
        await reader.cancel();
        return Response.json({ error: 'Each file must be 2 MB or smaller.' }, { status: 413 });
      }
      chunks.push(value);
    }

    const form = await new Response(Buffer.concat(chunks), {
      headers: { 'content-type': request.headers.get('content-type') || '' }
    }).formData();
    const file = form.get('file');
    if (!(file instanceof File) || !file.size || file.size > MAX_FILE_SIZE) {
      return Response.json({ error: 'Choose a file up to 2 MB.' }, { status: 400 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const format = detectBriefFile(bytes);
    if (!format) {
      return Response.json({ error: 'Use a PDF, PNG, JPEG or WebP sample.' }, { status: 415 });
    }

    const id = randomUUID();
    const mediaType: BriefMediaType = format.type === 'application/pdf' ? 'raw' : 'image';
    const publicId = `rcentz/briefs/${user.id}/${requestId}/${id}${mediaType === 'raw' ? '.pdf' : ''}`;
    // Never hold a database transaction open during a network upload.
    const asset = await uploadBriefAttachment(bytes, publicId, mediaType);
    uploadedAsset = { publicId: asset.public_id, mediaType };
    stage = 'database';

    // Revalidate ownership, status and the attachment cap under the database lock.
    const result = await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${requestId}))`;
      const saved = await tx.serviceRequest.findFirst({
        where: { id: requestId, userId: user.id },
        include: {
          service: { select: { slug: true } },
          project: { select: { id: true } },
          answers: {
            where: { question: { key: BRIEF_KEY } },
            select: { metadata: true }
          }
        }
      });
      if (!saved) return 404;
      if (!['DRAFT', 'PENDING'].includes(saved.status) || saved.project) return 409;
      const data = readBriefData(saved.answers[0]?.metadata) || {
        version: 1 as const,
        brief: legacyBrief(saved),
        attachments: []
      };
      if (data.attachments.length >= 5) return 409;
      const attachment = {
        id,
        name: file.name.replace(/[\r\n\x00-\x1f]/g, '').slice(0, 160) || `reference.${format.extension}`,
        type: format.type,
        size: file.size,
        pathname: `cloudinary:${mediaType}:${asset.public_id}`
      };
      await writeBriefData(tx, saved, {
        ...data,
        attachments: [...data.attachments, attachment]
      });
      return { id, name: attachment.name, type: attachment.type, size: attachment.size };
    }, { timeout: 15000 });

    if (typeof result === 'number') {
      await removeBriefAttachment(uploadedAsset.publicId, uploadedAsset.mediaType).catch(() => {});
      uploadedAsset = null;
      return Response.json({
        error: result === 404 ? 'Brief not found.' : 'This brief cannot accept more files.'
      }, { status: result });
    }
    uploadedAsset = null;
    return Response.json(result, { status: 201 });
  } catch (error) {
    recordFailure(error, stage);
    if (uploadedAsset) {
      await removeBriefAttachment(uploadedAsset.publicId, uploadedAsset.mediaType).catch(() => {});
    }
    const storageFailure = stage === 'storage';
    return Response.json({
      error: storageFailure
        ? 'Private storage could not accept this file. The project brief is safe.'
        : 'The file could not be linked to your brief. The project brief is safe.',
      code: storageFailure ? 'STORAGE_UPLOAD_FAILED' : 'ATTACHMENT_SAVE_FAILED'
    }, { status: 503 });
  }
}
