import { requireAuth } from '@/features/auth/server/require-auth';

import { ClientProductsPage } from '@/features/client/components/products/ClientProductsPage';

import { getClientProducts } from '@/features/client/server/products/get-client-products';

export default async function DashboardProductsPage() {
  await requireAuth('/dashboard/products');

  const products = await getClientProducts();

  return <ClientProductsPage products={products} />;
}
