import { toNextJsHandler } from 'better-auth/next-js';
import { isAuthConfigured } from '@/features/auth/lib/auth-configuration';

export const runtime = 'nodejs';

async function handle(request: Request) {
  if (!isAuthConfigured())
    return Response.json(
      { message: 'Account access is temporarily unavailable.' },
      { status: 503 }
    );
  const { auth } = await import('@/lib/auth');
  const handler = toNextJsHandler(auth);
  return request.method === 'GET'
    ? handler.GET(request)
    : handler.POST(request);
}

export const GET = handle;
export const POST = handle;
