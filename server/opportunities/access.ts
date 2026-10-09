import 'server-only';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/features/auth/server/require-admin';
export function isFinderOwner(userId: string) { return Boolean(process.env.OPPORTUNITY_OWNER_ID) && userId === process.env.OPPORTUNITY_OWNER_ID; }
export async function requireFinderOwner() {
  const user = await requireAdmin();
  if (!isFinderOwner(user.id)) notFound();
  return user;
}
