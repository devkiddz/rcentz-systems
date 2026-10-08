import { requireAuth } from '@/features/auth/server/require-auth';

import { ClientBillingPage } from '@/features/client/components/billing/ClientBillingPage';

import { getClientBilling } from '@/features/client/server/billing/get-client-billing';

export default async function DashboardBillingPage() {
  const user = await requireAuth('/dashboard/billing');

  const billing = await getClientBilling(user.id);

  return <ClientBillingPage billing={billing} />;
}
