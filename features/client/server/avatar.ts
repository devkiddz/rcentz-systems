import 'server-only';
import { createHash } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { ClientMutationError } from './client-mutation';
import { removeProjectImage } from '@/features/admin/server/media/project-images';

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export function avatarUrl(userId: string, version: string) {
  return `/api/avatars/${encodeURIComponent(userId)}?v=${version}`;
}
export function avatarPublicId(userId: string, version: string) {
  if (!uuid.test(version)) throw new Error('Invalid avatar version.');
  return `rcentz/avatars/${createHash('sha256').update(userId).digest('hex')}/${version}`;
}
export function ownedAvatarId(userId: string, image: string | null) {
  if (!image) return null;
  const prefix = `/api/avatars/${encodeURIComponent(userId)}?v=`;
  if (!image.startsWith(prefix)) return null;
  const version = image.slice(prefix.length);
  return uuid.test(version) ? avatarPublicId(userId, version) : null;
}
export function avatarVersion(value: unknown): Date {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(value) || !Number.isFinite(new Date(value).getTime()))
    throw new ClientMutationError(400, 'Reload your profile and try again.');
  return new Date(value);
}
export async function saveAvatar(userId: string, expected: Date, image: string | null) {
  return prisma.$transaction(async tx => {
    const current = await tx.user.findFirst({ where: { id: userId, status: 'ACTIVE', updatedAt: expected }, select: { image: true, updatedAt: true } });
    if (!current) throw new ClientMutationError(409, 'Your account changed. Reload before updating your photo.');
    if (current.image === image) return { image, updatedAt: current.updatedAt.toISOString(), previous: null };
    const now = new Date(Math.max(Date.now(), expected.getTime() + 1));
    const result = await tx.user.updateMany({ where: { id: userId, status: 'ACTIVE', updatedAt: expected }, data: { image, updatedAt: now } });
    if (result.count !== 1) throw new ClientMutationError(409, 'Your account changed. Reload before updating your photo.');
    await tx.auditLog.create({ data: { userId, action: image ? 'CLIENT_AVATAR_UPDATED' : 'CLIENT_AVATAR_REMOVED', entityType: 'User', entityId: userId } });
    return { image, updatedAt: now.toISOString(), previous: ownedAvatarId(userId, current.image) };
  });
}
export async function cleanupAvatar(userId: string, publicId: string | null) {
  if (!publicId) return;
  const version = publicId.split('/').at(-1) || '';
  if (!uuid.test(version) || publicId !== avatarPublicId(userId, version)) return;
  try { await removeProjectImage(publicId); }
  catch {
    await prisma.auditLog.create({ data: { userId, action: 'CLIENT_AVATAR_CLEANUP_PENDING', entityType: 'User', entityId: userId, metadata: { publicId } } }).catch(() => {});
  }
}
export async function readAvatarBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new ClientMutationError(400, 'Choose a profile photo.');
  const chunks: Uint8Array[] = []; let total = 0;
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    total += value.byteLength;
    if (total > AVATAR_MAX_BYTES + 65536) { await reader.cancel(); throw new ClientMutationError(413, 'Use a cropped photo up to 2 MB.'); }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
