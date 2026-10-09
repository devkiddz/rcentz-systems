import { randomUUID } from 'node:crypto';
import { projectImagesConfigured, uploadProjectImage, removeProjectImage } from '@/features/admin/server/media/project-images';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/features/auth/server/get-current-user';
import { detectBriefFile, MAX_FILE_SIZE } from '@/features/onboarding/server/brief-files';
export const runtime = 'nodejs';
export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  if (request.headers.get('origin') !== new URL(process.env.BETTER_AUTH_URL || request.url).origin) return Response.json({ error: 'Reload and try again.' }, { status: 403 });
  const user = await getCurrentUser();
  if (!user || user.status !== 'ACTIVE' || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return Response.json({ error: 'Administrator access required.' }, { status: 403 });
  const { projectId } = await params;
  if (!await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } })) return Response.json({ error: 'Project not found.' }, { status: 404 });
  if (!projectImagesConfigured()) return Response.json({ error: 'Cloudinary image storage is not configured.' }, { status: 503 });
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.startsWith('multipart/form-data;')) return Response.json({ error: 'Choose a screenshot.' }, { status: 415 });
  let pathname: string | undefined;

  try {
    const reader = request.body?.getReader();
    if (!reader) return Response.json({ error: 'Choose a screenshot.' }, { status: 400 });
    const chunks: Uint8Array[] = []; let total = 0;
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      total += value.byteLength;
      if (total > MAX_FILE_SIZE + 65536) { await reader.cancel(); return Response.json({ error: 'Use a screenshot up to 2 MB.' }, { status: 413 }); }
      chunks.push(value);
    }
    const form = await new Response(Buffer.concat(chunks), { headers: { 'content-type': contentType } }).formData();
    const file = form.get('file');
    const replaceId = form.get('replaceId');
    if (replaceId !== null && (typeof replaceId !== 'string' || !replaceId)) return Response.json({ error: 'Invalid image.' }, { status: 400 });
    if (!(file instanceof File) || !file.size || file.size > MAX_FILE_SIZE) return Response.json({ error: 'Use a screenshot up to 2 MB.' }, { status: 400 });
    const bytes = new Uint8Array(await file.arrayBuffer()); const format = detectBriefFile(bytes);
    if (!format?.type.startsWith('image/')) return Response.json({ error: 'Use PNG, JPEG or WebP.' }, { status: 415 });
    const previousId = await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'project-images:' + projectId}))`;
      const existing = replaceId ? await tx.mediaAsset.findFirst({ where: { id: replaceId, projectId, mimeType: { startsWith: 'image/' } } }) : null;
      if (replaceId && !existing) throw new Error('NOT_FOUND');

      if (!existing && await tx.mediaAsset.count({ where: { projectId, mimeType: { startsWith: 'image/' } } }) >= 12) throw new Error('LIMIT');
      const uploaded = await uploadProjectImage(bytes, `rcentz/projects/${projectId}/${randomUUID()}`);
      pathname = uploaded.public_id;
      const last = await tx.mediaAsset.findFirst({ where: { projectId }, orderBy: { sortOrder: 'desc' }, select: { sortOrder: true } });
      const data = { projectId, publicId: 'cloudinary:' + pathname, url: '', mimeType: format.type, size: file.size, width: uploaded.width, height: uploaded.height, fileName: file.name.replace(/[\r\n\x00-\x1f]/g, '').slice(0, 160), alt: 'Project screenshot', sortOrder: existing?.sortOrder ?? (last?.sortOrder ?? -1) + 1 };
      const media = existing ? await tx.mediaAsset.update({ where: { id: existing.id }, data }) : await tx.mediaAsset.create({ data });
      await tx.mediaAsset.update({ where: { id: media.id }, data: { url: `/api/projects/${projectId}/images/${media.id}?v=${randomUUID()}` } });
      await tx.auditLog.create({ data: { userId: user.id, action: existing ? 'PROJECT_IMAGE_REPLACED' : 'PROJECT_IMAGE_UPLOADED', entityType: 'Project', entityId: projectId, metadata: { mediaId: media.id } } });
      return existing?.publicId ?? null;
    }, { timeout: 30000 });
    if (previousId?.startsWith(`cloudinary:rcentz/projects/${projectId}/`)) {
      await removeProjectImage(previousId.slice('cloudinary:'.length)).catch(async () => {
        await prisma.auditLog.create({ data: { userId: user.id, action: 'PROJECT_IMAGE_CLEANUP_PENDING', entityType: 'Project', entityId: projectId, metadata: { publicId: previousId } } }).catch(() => {});
      });
    }
    return Response.json({ saved: true }, { status: replaceId ? 200 : 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') return Response.json({ error: 'Image not found.' }, { status: 404 });
    if (pathname) await removeProjectImage(pathname).catch(() => {});
    return Response.json({ error: error instanceof Error && error.message === 'LIMIT' ? 'This project already has 12 screenshots.' : 'Upload failed. Try again.' }, { status: error instanceof Error && error.message === 'LIMIT' ? 409 : 503 });
  }
}
