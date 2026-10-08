import { requireAuth } from '@/features/auth/server/require-auth';

import { ClientFinanceOverview } from '@/features/client/components/overview/ClientFinanceOverview';

import { ClientOperationsTabs } from '@/features/client/components/overview/ClientOperationsTabs';

import { ClientProjectMonitor } from '@/features/client/components/overview/ClientProjectMonitor';

import { ClientProjectsProgress } from '@/features/client/components/overview/ClientProjectsProgress';

import { getClientOverview } from '@/features/client/server/overview/get-client-overview';

export default async function DashboardPage() {
  const user = await requireAuth('/dashboard');

  const overview = await getClientOverview(user.id);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[var(--section-max)] space-y-5">


        <section className="grid items-start gap-5 lg:grid-cols-2">
          <div className="min-w-0 space-y-5">
            <ClientProjectsProgress projects={overview.projects} />

            <ClientOperationsTabs
              actions={overview.actions}
              records={overview.records}
              support={overview.support}
            />
          </div>

          <div className="min-w-0">
            <ClientProjectMonitor projects={overview.monitorProjects} />
          </div>
        </section>

        <ClientFinanceOverview finance={overview.finance} />
      </div>
    </main>
  );
}
