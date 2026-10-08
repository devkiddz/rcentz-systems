import { redirect } from 'next/navigation';
import { ProjectAccountAccess } from '@/features/auth/components/ProjectAccountAccess';
import { resolveSafeRedirect } from '@/features/auth/lib/resolve-safe-redirect';
import { isAuthConfigured } from '@/features/auth/lib/auth-configuration';
import { getCurrentUser } from '@/features/auth/server/get-current-user';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false }
};
export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = resolveSafeRedirect((await searchParams).next, '/dashboard');
  const user = await getCurrentUser();
  if (user?.status === 'ACTIVE') redirect(next);
  return (
    <ProjectAccountAccess
      mode="login"
      next={next}
      configured={isAuthConfigured()}
    />
  );
}
