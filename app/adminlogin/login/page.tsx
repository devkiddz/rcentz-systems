import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/features/auth/server/get-current-user';
export const metadata = { title: 'Admin sign in', robots: { index: false, follow: false } };
export default async function Page() {
  const user = await getCurrentUser();
  if (user?.status === 'ACTIVE' && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) redirect('/admin');
  redirect('/login?next=%2Fadmin');
}
