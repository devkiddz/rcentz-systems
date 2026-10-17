import { randomUUID } from 'node:crypto';
import { getCurrentUser } from '@/features/auth/server/get-current-user';
import { ClientMutationError, clientMutationFailure, readClientMutation } from '@/features/client/server/client-mutation';
import { avatarPublicId, avatarUrl, avatarVersion, AVATAR_MAX_BYTES, cleanupAvatar, readAvatarBody, saveAvatar } from '@/features/client/server/avatar';
import { detectBriefFile } from '@/features/onboarding/server/brief-files';
import { projectImagesConfigured, uploadProjectImage } from '@/features/admin/server/media/project-images';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  let uploadedId: string | null = null;
  let ownerId: string | null = null;
  let committed = false;
  try {
    if (request.headers.get('origin') !== new URL(process.env.BETTER_AUTH_URL || request.url).origin)
      throw new ClientMutationError(403, 'Reload and try again.');
    const user = await getCurrentUser();
    if (!user || user.status !== 'ACTIVE') throw new ClientMutationError(401, 'Sign in to update your photo.');
    ownerId = user.id;
    const type = request.headers.get('content-type') || '';
    if (!type.startsWith('multipart/form-data;')) throw new ClientMutationError(415, 'Choose a profile photo.');
    const bytes = await readAvatarBody(request);
    const form = await new Response(new Uint8Array(bytes), { headers: { 'content-type': type } }).formData();
    if ([...form.keys()].some(key => !['file', 'updatedAt'].includes(key)) || form.getAll('file').length !== 1 || form.getAll('updatedAt').length !== 1)
      throw new ClientMutationError(400, 'Choose one profile photo.');
    const expected = avatarVersion(form.get('updatedAt'));
    if (expected.getTime() !== user.updatedAt.getTime()) throw new ClientMutationError(409, 'Your account changed. Reload before updating your photo.');
    const file = form.get('file');
    if (!(file instanceof File) || !file.size || file.size > AVATAR_MAX_BYTES) throw new ClientMutationError(413, 'Use a cropped photo up to 2 MB.');
    const image = new Uint8Array(await file.arrayBuffer());
    if (file.type !== 'image/jpeg' || detectBriefFile(image)?.type !== 'image/jpeg') throw new ClientMutationError(415, 'Crop your photo and save it as JPEG.');
    if (!projectImagesConfigured()) throw new ClientMutationError(503, 'Photo uploads are temporarily unavailable.');
    const version = randomUUID();
    const publicId = avatarPublicId(user.id, version);
    const uploaded = await uploadProjectImage(image, publicId);
    uploadedId = uploaded.public_id;
    if (uploadedId !== publicId || uploaded.format !== 'jpg' || uploaded.width < 64 || uploaded.height < 64 || uploaded.width > 2048 || uploaded.height > 2048 || uploaded.width !== uploaded.height)
      throw new ClientMutationError(415, 'Use a square profile photo between 64 and 2048 pixels.');
    const saved = await saveAvatar(user.id, expected, avatarUrl(user.id, version));
    committed = true;
    await cleanupAvatar(user.id, saved.previous);
    return Response.json({ image: saved.image, updatedAt: saved.updatedAt }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    if (!committed && ownerId && uploadedId) await cleanupAvatar(ownerId, uploadedId);
    return clientMutationFailure(error);
  }
}
export async function DELETE(request: Request) {
  try {
    const { user, input } = await readClientMutation(request, 2000);
    if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(key => key !== 'updatedAt')) throw new ClientMutationError(400, 'Reload before changing your photo.');
    const saved = await saveAvatar(user.id, avatarVersion((input as Record<string, unknown>).updatedAt), null);
    await cleanupAvatar(user.id, saved.previous);
    return Response.json({ image: saved.image, updatedAt: saved.updatedAt }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) { return clientMutationFailure(error); }
}
