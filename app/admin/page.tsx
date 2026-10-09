import { AdminCurrentProjectProgress } from '@/features/admin/components/overview/AdminCurrentProjectProgress';
import { AdminFinanceOverview } from '@/features/admin/components/overview/AdminFinanceOverview';
import { AdminOperationsTabs } from '@/features/admin/components/overview/AdminOperationsTabs';
import { AdminOverviewLayout } from '@/features/admin/components/overview/AdminOverviewLayout';
import { AdminOverviewMetrics } from '@/features/admin/components/overview/AdminOverviewMetrics';
import { AdminProjectsProgress } from '@/features/admin/components/overview/AdminProjectsProgress';

import { getActiveProjectMonitors } from '@/features/admin/server/overview/get-active-project-monitors';
import { getFinanceOverview } from '@/features/admin/server/overview/get-finance-overview';
import { getOverviewClients } from '@/features/admin/server/overview/get-overview-clients';
import { getOverviewMetrics } from '@/features/admin/server/overview/get-overview-metrics';
import { getOverviewNotifications } from '@/features/admin/server/overview/get-overview-notifications';
import { getOverviewProjects } from '@/features/admin/server/overview/get-overview-projects';
import { getOverviewTasks } from '@/features/admin/server/overview/get-overview-tasks';

import { requireAdmin } from '@/features/auth/server/require-admin';

export default async function AdminPage() {
  const user = await requireAdmin();

  const [
    overviewMetrics,
    overviewProjects,
    activeProjectMonitors,
    overviewTasks,
    overviewClients,
    overviewNotifications,
    financeOverview
  ] = await Promise.all([
    getOverviewMetrics(),
    getOverviewProjects(),
    getActiveProjectMonitors(),
    getOverviewTasks(),
    getOverviewClients(),
    getOverviewNotifications(user.id),
    getFinanceOverview()
  ]);

  const metrics = [
    {
      label: 'Service Requests',
      value: overviewMetrics.serviceRequests,
      note: overviewMetrics.serviceRequests === 0 ? 'No open requests' : 'Open service requests',
      href: '/admin/requests',
      iconName: 'requests' as const,
      motionType: 'pulse' as const
    },
    {
      label: 'Active Projects',
      value: overviewMetrics.activeProjects,
      note: overviewMetrics.activeProjects === 0 ? 'No active projects' : 'Projects in delivery',
      href: '/admin/projects',
      iconName: 'projects' as const,
      motionType: 'breathe' as const
    },
    {
      label: 'Clients',
      value: overviewMetrics.clients,
      note: overviewMetrics.clients === 0 ? 'No clients yet' : 'Active client accounts',
      href: '/admin/clients',
      iconName: 'clients' as const,
      motionType: 'orbit' as const
    },
    {
      label: 'Open Milestones',
      value: overviewMetrics.openMilestones,
      note: overviewMetrics.openMilestones === 0 ? 'No open milestones' : 'Milestones still in progress',
      href: '/admin/projects',
      iconName: 'milestones' as const,
      motionType: 'tick' as const
    },
    {
      label: 'Pending Quotes',
      value: overviewMetrics.pendingQuotes,
      note: overviewMetrics.pendingQuotes === 0 ? 'No pending quotes' : 'Draft or awaiting response',
      href: '/admin/requests',
      iconName: 'quotes' as const,
      motionType: 'shimmer' as const
    }
  ];

  return (
    <AdminOverviewLayout>
      <h1 className="text-2xl font-semibold tracking-tight">Operations overview</h1>
      <AdminOverviewMetrics metrics={metrics} />

      <section className="grid items-start gap-5 lg:grid-cols-2">
        <div className="min-w-0 space-y-5">
          <AdminProjectsProgress projects={overviewProjects} />

          <AdminOperationsTabs
            tasks={overviewTasks}
            clients={overviewClients}
            notifications={overviewNotifications}
          />
        </div>

        <div className="min-w-0">
          <AdminCurrentProjectProgress projects={activeProjectMonitors} />
        </div>
      </section>

      <AdminFinanceOverview finance={financeOverview} />
    </AdminOverviewLayout>
  );
}
