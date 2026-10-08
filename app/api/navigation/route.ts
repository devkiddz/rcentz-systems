import { getCurrentUser } from '@/features/auth/server/get-current-user';

export const runtime = 'nodejs';

const privateHeaders = {
  'Cache-Control': 'private, no-store, max-age=0',
  Vary: 'Cookie',
};

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.status !== 'ACTIVE') {
      return Response.json({ signedIn: false, hasProjects: false }, { headers: privateHeaders });
    }

    const { prisma } = await import('@/lib/prisma');
    const project = await prisma.project.findFirst({
      where: { clientId: user.id },
      select: { id: true },
    });
    return Response.json({ signedIn: true, hasProjects: Boolean(project) }, { headers: privateHeaders });
  } catch {
    return Response.json({ message: 'Navigation status temporarily unavailable.' }, {
      status: 503,
      headers: privateHeaders,
    });
  }
}
