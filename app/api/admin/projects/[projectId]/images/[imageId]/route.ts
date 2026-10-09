import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/features/auth/server/get-current-user';
import { removeProjectImage } from '@/features/admin/server/media/project-images';
export const runtime = 'nodejs';
export async function DELETE(request: Request, { params }: { params: Promise<{ projectId: string; imageId: string }> }) {
  if (request.headers.get('origin') !== new URL(process.env.BETTER_AUTH_URL || request.url).origin) return Response.json({ error: 'Reload and try again.' }, { status: 403 });
  const user = await getCurrentUser();
  if (!user || user.status !== 'ACTIVE' || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return Response.json({ error: 'Administrator access required.' }, { status: 403 });
  const { projectId, imageId } = await params;
  try {
    const removed = await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'project-images:' + projectId}))`;
      const image = await tx.mediaAsset.findFirst({ where: { id: imageId, projectId, mimeType: { startsWith: 'image/' } } });
      if (!image) return null;
      await tx.mediaAsset.delete({ where: { id: image.id } });
      await tx.auditLog.create({ data: { userId: user.id, action: 'PROJECT_IMAGE_DELETED', entityType: 'Project', entityId: projectId, metadata: { mediaId: image.id } } });
      return image;
    });
    if (!removed) return Response.json({ error: 'Image not found.' }, { status: 404 });
    if (removed.publicId?.startsWith(`cloudinary:rcentz/projects/${projectId}/`)) {
      await removeProjectImage(removed.publicId.slice('cloudinary:'.length)).catch(async () => {
        await prisma.auditLog.create({ data: { userId: user.id, action: 'PROJECT_IMAGE_CLEANUP_PENDING', entityType: 'Project', entityId: projectId, metadata: { publicId: removed.publicId } } }).catch(() => {});
      });
    }
    return Response.json({ deleted: true });
  } catch { return Response.json({ error: 'Could not delete this image. Try again.' }, { status: 503 }); }
}
