import { getCurrentUser } from '@/features/auth/server/get-current-user';
import { validateBrief } from '@/features/onboarding/lib/project-brief';
import { createProjectBrief } from '@/features/onboarding/server/create-project-brief';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  // A JSON-only, same-origin endpoint; cookies alone never authorise a mutation.
  const origin = request.headers.get('origin');
  // Next.js can reconstruct request.url with an internal host behind a proxy.
  const trustedOrigin = new URL(process.env.BETTER_AUTH_URL || request.url).origin;
  if (!origin || origin !== trustedOrigin)
    return Response.json(
      {
        error:
          'This request could not be verified. Reload the page and try again.'
      },
      { status: 403 }
    );
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    return Response.json(
      { error: 'Send a JSON project brief.' },
      { status: 415 }
    );
  try {
    const user = await getCurrentUser();
    if (!user)
      return Response.json(
        { error: 'Sign in again to submit your brief.' },
        { status: 401 }
      );
    if (user.status !== 'ACTIVE')
      return Response.json(
        { error: 'Your account cannot submit a project brief.' },
        { status: 403 }
      );
    const reader = request.body?.getReader();
    if (!reader)
      return Response.json(
        { error: 'A project brief is required.' },
        { status: 400 }
      );
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 25_000) {
        await reader.cancel();
        return Response.json(
          { error: 'Your brief is too long.' },
          { status: 413 }
        );
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const body = new TextDecoder().decode(bytes);
    let input: unknown;
    try {
      input = JSON.parse(body);
    } catch {
      return Response.json(
        { error: 'Invalid project brief.' },
        { status: 400 }
      );
    }
    const { brief, errors } = validateBrief(input);
    if (Object.keys(errors).length)
      return Response.json(
        { error: 'Check the highlighted fields.', fields: errors },
        { status: 400 }
      );
    const result = await createProjectBrief(user.id, brief);
    if (!result)
      return Response.json(
        {
          error:
            'This build option is not accepting briefs yet. Contact contact@rcentz.cc and we will help.'
        },
        { status: 409 }
      );
    return Response.json({ id: result.id }, { status: 201 });
  } catch {
    return Response.json(
      {
        error:
          'We could not save your brief. Your answers are still on this page; please try again.'
      },
      { status: 503 }
    );
  }
}
