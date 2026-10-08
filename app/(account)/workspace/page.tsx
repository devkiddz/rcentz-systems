import { redirect } from 'next/navigation';
import { requireAuth } from '@/features/auth/server/require-auth';
export const dynamic = 'force-dynamic';
export default async function WorkspacePage() {
  await requireAuth('/dashboard');
  redirect('/dashboard');
}
