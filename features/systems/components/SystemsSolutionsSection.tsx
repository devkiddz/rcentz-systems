'use client';

import { projectEntryUrl } from '@/features/systems/lib/project-entry';
import { rcentzTypography } from '@/ui-shell/brand/rcentz-typography';
import { useState } from 'react';
import {
  ArrowUpRight,
  Check,
  Circle,
  Database,
  LayoutDashboard,
  UserRound
} from 'lucide-react';

const views = [
  {
    label: 'Customers',
    title: 'A clear way to reach your business.',
    description:
      'Give business clients a dedicated place to submit requirements, review quotations and follow delivery with your team.',
    capabilities: [
      'Business accounts and client portals',
      'Requests and progress updates',
      'Clear communication'
    ],
    screen: 'Business accounts'
  },
  {
    label: 'Operations',
    title: 'Turn incoming requests into organised work.',
    description:
      'Turn client requirements into assigned work, clear approval stages and delivery milestones. Give your team visibility into who owns each task and what needs to happen next.',
    capabilities: [
      'Assigned tasks and responsibilities',
      'Review and approval workflows',
      'Shared project visibility'
    ],
    screen: 'Team workspace'
  },
  {
    label: 'Information',
    title: 'Keep the whole business working from the same information.',
    description:
      'Connect customer records, project activity and business tools so updates stay useful across your operations.',
    capabilities: [
      'Connected customer and project records',
      'Integrations between business tools',
      'Less repeated data entry'
    ],
    screen: 'Connected records'
  }
] as const;

function WorkspacePreview({ selected }: { selected: number }) {
  const view = views[selected];

  return (
    <div
      className="h-[440px] min-w-0 overflow-hidden rounded-2xl border border-border-strong bg-surface-raised sm:h-[460px]"
      aria-label={view.screen + ' example'}>
      <div className="flex h-12 items-center justify-between gap-3 border-b border-border px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground text-xs font-semibold text-background">
            R
          </span>
          <span className="truncate text-xs font-medium">Rcentz workspace</span>
        </div>
        <span className="shrink-0 rounded-full border border-border px-2 py-1 text-[10px] text-muted-foreground">
          Example
        </span>
      </div>

      <div className="flex h-[calc(100%-3rem)]">
        <aside
          aria-hidden="true"
          className="hidden w-36 shrink-0 border-r border-border bg-surface-subtle p-3 xl:block">
          <p className="px-2 py-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Workspace
          </p>
          {views.map((item, index) => (
            <div
              key={item.label}
              className={[
                'mt-1 rounded-lg px-2 py-2 text-xs',
                selected === index
                  ? 'bg-surface-muted font-medium text-foreground'
                  : 'text-muted-foreground'
              ].join(' ')}>
              {item.label}
            </div>
          ))}
          <div className="mt-8 border-t border-border px-2 pt-3">
            <p className="text-[10px] text-muted-foreground">Project reference</p>
            <p className="mt-1 font-mono text-xs">RC-2048</p>
          </div>
        </aside>

        <div className="min-w-0 flex-1 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {view.screen}
              </p>
              <h3 className={rcentzTypography.className + ' mt-2 text-base font-medium tracking-normal sm:text-lg'}>
                {selected === 0
                  ? 'Manage your business relationships.'
                  : selected === 1
                    ? 'Keep work moving.'
                    : 'One connected record.'}
              </h3>
            </div>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-subtle">
              {selected === 0
                ? <UserRound aria-hidden="true" className="size-4" />
                : selected === 1
                  ? <LayoutDashboard aria-hidden="true" className="size-4" />
                  : <Database aria-hidden="true" className="size-4" />}
            </span>
          </div>

          {selected === 0 ? (
            <div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  ['Accounts', '24'],
                  ['Requests', '8'],
                  ['Quotes', '3']
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg bg-surface-subtle px-3 py-2">
                    <p className="text-[10px] text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-1 text-lg font-semibold tracking-tight">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-border p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold">Business account overview</p>
                <span className="text-[10px] text-muted-foreground">
                  Account activity
                </span>
              </div>

              <table className="w-full table-fixed text-left">
                <caption className="sr-only">
                  Example business accounts, requests, quotation stages and account teams
                </caption>
                <thead className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th scope="col" className="w-[44%] pb-2 font-medium sm:w-[36%]">
                      Account
                    </th>
                    <th scope="col" className="w-[20%] pb-2 font-medium sm:w-[16%]">
                      Requests
                    </th>
                    <th scope="col" className="pb-2 font-medium">Quote stage</th>
                    <th scope="col" className="hidden w-[23%] pb-2 font-medium sm:table-cell">
                      Account team
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Northstar Ltd.', initials: 'N', requests: '3', status: 'Quoted', owner: 'Delivery' },
                    { name: 'Harbour Co.', initials: 'H', requests: '2', status: 'Review', owner: 'Accounts' },
                    { name: 'Atlas Studio', initials: 'A', requests: '1', status: 'Approved', owner: 'Delivery' }
                  ].map(customer => (
                    <tr key={customer.name}>
                      <th scope="row" className="py-2 pr-2 font-medium">
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[10px]">
                            {customer.initials}
                          </span>
                          <span className="truncate text-[11px]">
                            {customer.name}
                          </span>
                        </div>
                      </th>
                      <td className="py-2 text-[11px] text-muted-foreground">
                        {customer.requests}
                      </td>
                      <td className="py-2">
                        <span className="inline-flex rounded-full bg-surface-muted px-2 py-1 text-[9px] font-medium">
                          {customer.status}
                        </span>
                      </td>
                      <td className="hidden py-2 text-[10px] text-muted-foreground sm:table-cell">
                        {customer.owner}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          ) : selected === 1 ? (
            <div className="mt-4">
              <div className="rounded-xl bg-surface-subtle p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      RC-2048 / Northstar Ltd.
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      Customer workspace
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-background px-2 py-1 text-[10px] font-medium">
                    In review
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
                      Delivery owner
                    </p>
                    <p className="mt-1 text-[11px] font-medium">
                      Implementation team
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
                      Next milestone
                    </p>
                    <p className="mt-1 text-[11px] font-medium">
                      Scope approval
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-border p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold">Delivery queue</p>
                  <span className="text-[10px] text-muted-foreground">
                    1 of 3 complete
                  </span>
                </div>

                {[
                  {
                    title: 'Review business requirements',
                    team: 'Discovery team',
                    status: 'Complete'
                  },
                  {
                    title: 'Approve scope and quotation',
                    team: 'Client account',
                    status: 'In review'
                  },
                  {
                    title: 'Prepare implementation plan',
                    team: 'Delivery team',
                    status: 'Next'
                  }
                ].map((task, index) => (
                  <div
                    key={task.title}
                    className="flex items-center gap-2 py-2">
                    {index === 0
                      ? <Check aria-hidden="true" className="size-3.5 shrink-0" />
                      : <Circle aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium leading-4">
                        {task.title}
                      </p>
                      <p className="text-[9px] leading-4 text-muted-foreground">
                        {task.team}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-surface-subtle px-2 py-1 text-[9px]">
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-xl border border-border">
              {[
                ['Business account', 'Northstar Ltd.'],
                ['Project', 'RC-2048'],
                ['Current status', 'In review'],
                ['Shared with', 'Client and delivery team']
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <span className="shrink-0 text-[11px] text-muted-foreground">{label}</span>
                  <span className="text-right text-[11px] font-medium">{value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 text-[10px] text-muted-foreground">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-theme-accent" />
            {selected === 0
              ? 'Requests, quotations and account ownership together'
              : selected === 1
                ? 'Customer and team share the same project status'
                : 'Linked across the customer portal and team workspace'}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SystemsSolutionsSection() {
  const [selected, setSelected] = useState(0);
  const view = views[selected];

  return (
    <section
      id="solutions"
      aria-labelledby="systems-solutions-title"
      className="rcentz-section scroll-mt-24 border-b border-border py-12 sm:py-20">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.7fr] lg:gap-12">
        <p className="inline-flex h-fit w-fit self-start items-center gap-2 rounded-full border border-border bg-surface-subtle px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-theme-accent" />
          Solutions
        </p>
        <div className="min-w-0">
          <h2
            id="systems-solutions-title"
            className={rcentzTypography.className + ' font-extrabold tracking-normal text-3xl sm:text-4xl lg:text-[2.5rem] leading-[1.18]'}>
            <span className="block font-semibold text-muted-foreground lg:pl-12">
              Built for your customers.
            </span>
            <span className="mt-2 block font-extrabold text-foreground">
              Connected to your operations.
            </span>
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 sm:text-base sm:leading-7 text-muted-foreground">
            <strong className="font-medium text-foreground">
              Bring us your business needs. We build the software.
            </strong>{' '}
            Connect client requests, team approvals and delivery in one workspace.
          </p>
        </div>
      </div>

      <div className="mt-10 grid items-center gap-8 sm:mt-14 lg:grid-cols-[0.8fr_1.7fr] lg:gap-12">
        <div className="min-w-0">
          <div
            role="group"
            aria-label="Explore business solutions"
            className="flex flex-wrap gap-1 border-b border-border pb-3">
            {views.map((item, index) => (
              <button
                key={item.label}
                type="button"
                aria-pressed={selected === index}
                aria-controls="systems-solution-preview"
                onClick={() => setSelected(index)}
                className={[
                  'min-h-11 rounded-lg px-3 text-xs font-medium',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  selected === index
                    ? 'bg-surface-muted text-foreground'
                    : 'text-muted-foreground hover:bg-surface-subtle hover:text-foreground'
                ].join(' ')}>
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-6 min-h-36">
            <h3 className={rcentzTypography.className + ' text-lg sm:text-xl font-medium leading-tight tracking-normal'}>
              {view.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {view.description}
            </p>
          </div>

          <p className="mt-5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            What this brings together
          </p>
          <ul className="mt-3 space-y-3">
            {view.capabilities.map(capability => (
              <li key={capability} className="flex items-start gap-2 text-sm">
                <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-theme-accent" />
                {capability}
              </li>
            ))}
          </ul>

          <a
            href={projectEntryUrl}
            className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Start a project
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </a>
        </div>

        <div id="systems-solution-preview" className="min-w-0">
          <WorkspacePreview selected={selected} />
        </div>
      </div>
    </section>
  );
}
