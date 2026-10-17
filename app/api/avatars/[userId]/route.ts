import { getCurrentUser } from '@/features/auth/server/get-current-user';
import { prisma } from '@/lib/prisma';
import { avatarUrl, ownedAvatarId, AVATAR_MAX_BYTES } from '@/features/client/server/avatar';
import { projectImageDeliveryUrl } from '@/features/admin/server/media/project-images';
export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };
export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.status !== 'ACTIVE') return new Response('Sign in required', { status: 401, headers });
  const { userId } = await params;
  const version = new URL(request.url).searchParams.get('v') || '';
  if (!/^[A-Za-z0-9_-]{1,191}$/.test(userId) || version.length !== 36) return new Response('Photo not found', { status: 404, headers });
  if (viewer.id !== userId && !['ADMIN', 'SUPER_ADMIN'].includes(viewer.role)) {
    const shared = await prisma.conversation.findFirst({ where: { AND: [{ participants: { some: { userId: viewer.id, leftAt: null } } }, { participants: { some: { userId, leftAt: null } } }] }, select: { id: true } });
    if (!shared) return new Response('Photo not found', { status: 404, headers });
  }
  const owner = await prisma.user.findFirst({ where: { id: userId, status: 'ACTIVE' }, select: { image: true } });
  if (!owner || owner.image !== avatarUrl(userId, version)) return new Response('Photo not found', { status: 404, headers });
  const publicId = ownedAvatarId(userId, owner.image);
  if (!publicId) return new Response('Photo not found', { status: 404, headers });
  try {
    const response = await fetch(projectImageDeliveryUrl(publicId), { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000) });
    if (!response.ok || response.headers.get('content-type')?.split(';')[0] !== 'image/jpeg') return new Response('Photo unavailable', { status: 503, headers });
    const reader = response.body?.getReader(); if (!reader) throw new Error('No photo');
    const chunks: Uint8Array[] = []; let total = 0;
    while (true) { const { done, value } = await reader.read(); if (done) break; total += value.byteLength; if (total > AVATAR_MAX_BYTES) { await reader.cancel(); throw new Error('Photo too large'); } chunks.push(value); }
    return new Response(new Uint8Array(Buffer.concat(chunks)), { headers: { ...headers, 'Content-Type': 'image/jpeg', 'Content-Disposition': 'inline', 'Content-Security-Policy': "sandbox; default-src 'none'" } });
  } catch { return new Response('Photo unavailable', { status: 503, headers }); }
}
