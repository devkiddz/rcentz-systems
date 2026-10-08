import { notFound } from 'next/navigation';

import { requireAuth } from '@/features/auth/server/require-auth';

import { ClientProductPage } from '@/features/client/components/products/ClientProductPage';

import { getClientProduct } from '@/features/client/server/products/get-client-product';

import { getClientProductOwnership } from '@/features/client/server/products/get-client-product-ownership';

type DashboardProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function DashboardProductPage({
  params
}: DashboardProductPageProps) {
  const user = await requireAuth('/dashboard/products');

  const { slug } = await params;

  const [product, ownership] = await Promise.all([
    getClientProduct(slug),

    getClientProductOwnership(user.id, slug)
  ]);

  if (!product) {
    notFound();
  }

  return <ClientProductPage product={product} ownership={ownership} />;
}
