import { redirect } from 'next/navigation';
import { requireAdmin } from '@/features/auth/server/require-admin';
export default async function Page() { await requireAdmin(); redirect('/admin/settings'); }
