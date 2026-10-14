import { requireFinderOwner } from '@/server/opportunities/access';
export async function requireOpportunityAdministrator() {
  const user = await requireFinderOwner();
  if (user.role !== 'SUPER_ADMIN') {
    const { notFound } = await import('next/navigation');
    notFound();
  }
  return user;
}
