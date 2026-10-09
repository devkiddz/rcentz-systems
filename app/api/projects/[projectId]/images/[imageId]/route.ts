import { projectImageDeliveryUrl } from '@/features/admin/server/media/project-images';
import { get } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/features/auth/server/get-current-user';
export const runtime = 'nodejs';
export async function GET(_request: Request, { params }: { params: Promise<{ projectId: string; imageId: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.status !== 'ACTIVE') return new Response('Sign in required', { status: 401 });
  const { projectId, imageId } = await params;
  const admin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
  const image = await prisma.mediaAsset.findFirst({ where: { id: imageId, projectId, project: admin ? {} : { clientId: user.id } }, select: { publicId: true, mimeType: true } });
  if (!image?.publicId || !image.mimeType?.startsWith('image/') || !['image/png', 'image/jpeg', 'image/webp'].includes(image.mimeType)) return new Response('Image not found', { status: 404 });
  try {
    if (image.publicId.startsWith(`cloudinary:rcentz/projects/${projectId}/`)) {
      const url = projectImageDeliveryUrl(image.publicId.slice('cloudinary:'.length));
      const response = await fetch(url, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000) });
      if (!response.ok) return new Response('Image unavailable', { status: 503 });
      return new Response(response.body, { headers: { 'Content-Type': image.mimeType, 'Cache-Control': 'private, no-store', 'Content-Disposition': 'inline', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "sandbox; default-src 'none'" } });
    }
    if (!image.publicId.startsWith(`project-images/${projectId}/`)) return new Response('Image not found', { status: 404 });
    const blob = await get(image.publicId, { access: 'private' });
    if (!blob || blob.statusCode !== 200) return new Response('Image unavailable', { status: 404 });
    return new Response(blob.stream, { headers: { 'Content-Type': image.mimeType, 'Cache-Control': 'private, no-store', 'Content-Disposition': 'inline', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "sandbox; default-src 'none'" } });
  } catch { return new Response('Image unavailable', { status: 503 }); }
}
