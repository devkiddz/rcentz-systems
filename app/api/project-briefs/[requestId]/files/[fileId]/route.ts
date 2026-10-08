import { get } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/features/auth/server/get-current-user';
import {
  BRIEF_KEY,
  readBriefData
} from '@/features/onboarding/server/brief-data';
export async function GET(
  request: Request,
  { params }: { params: Promise<{ requestId: string; fileId: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.status !== 'ACTIVE')
    return new Response('Sign in required', { status: 401 });
  const { requestId, fileId } = await params;
  const saved = await prisma.serviceRequest.findFirst({
    where: { id: requestId, ...(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? { status: { not: 'DRAFT' as const } } : { userId: user.id }) },
    select: {
      answers: {
        where: { question: { key: BRIEF_KEY } },
        select: { metadata: true }
      }
    }
  });
  const file = readBriefData(saved?.answers[0]?.metadata)?.attachments.find(
    (item) => item.id === fileId
  );
  if (!file) return new Response('File not found', { status: 404 });
  try {
    const blob = await get(file.pathname, { access: 'private' });
    if (!blob || blob.statusCode !== 200)
      return new Response('File unavailable', { status: 404 });
    return new Response(blob.stream, {
      headers: {
        'Content-Type': file.type,
        'Content-Disposition': `${new URL(request.url).searchParams.get('preview') === '1' && file.type.startsWith('image/') ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(file.name)}`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "sandbox; default-src 'none'"
      }
    });
  } catch {
    return new Response('File unavailable', { status: 503 });
  }
}
