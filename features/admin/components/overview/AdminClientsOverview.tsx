import Link from 'next/link';

import { BriefcaseBusiness, MessageSquareText } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import type { OverviewClient } from '@/features/admin/server/overview/get-overview-clients';

type AdminClientsOverviewProps = {
  clients: OverviewClient[];
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(namePart => namePart.charAt(0).toUpperCase())
    .join('');
}

function clampProgress(progress: number) {
  return Math.min(Math.max(progress, 0), 100);
}

function getProgressClassName(progress: number) {
  if (progress >= 95) {
    return 'bg-theme-accent';
  }

  if (progress >= 70) {
    return 'bg-sky-500';
  }

  if (progress >= 40) {
    return 'bg-amber-500';
  }

  return 'bg-rose-500';
}

function getProgressTextClassName(progress: number) {
  if (progress >= 95) {
    return 'text-theme-accent';
  }

  if (progress >= 70) {
    return 'text-sky-500';
  }

  if (progress >= 40) {
    return 'text-amber-500';
  }

  return 'text-rose-500';
}

function ClientRow({ client, isPreview }: { client: OverviewClient; isPreview: boolean }) {
  const displayName = client.companyName ?? client.name;

  const avatarImage = client.companyLogo ?? client.image;

  const projectProgress = clampProgress(client.averageProjectProgress);

  const content = (
    <div className="rounded-2xl border border-border bg-background p-4 transition-colors hover:bg-surface-raised">
      <div className="flex items-center gap-3">
        <Avatar className="size-11 shrink-0">
          {avatarImage ? <AvatarImage src={avatarImage} alt={displayName} /> : null}

          <AvatarFallback className="bg-surface-muted text-xs font-semibold">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>

              <p className="mt-1 truncate text-xs text-muted">{client.email}</p>
            </div>

            {client.activeProjectCount > 0 ? (
              <span
                className={`shrink-0 text-sm font-semibold ${getProgressTextClassName(projectProgress)}`}>
                {projectProgress}%
              </span>
            ) : (
              <span className="shrink-0 text-xs text-muted">No active project</span>
            )}
          </div>

          {client.activeProjectCount > 0 ? (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-muted">
              <div
                className={`h-full rounded-full ${getProgressClassName(projectProgress)}`}
                style={{
                  width: `${projectProgress}%`
                }}
              />
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <BriefcaseBusiness className="size-3" />
              {client.activeProjectCount} active projects
            </span>

            <span className="flex items-center gap-1.5">
              <MessageSquareText className="size-3" />
              {client.openRequestCount} requests
            </span>

            {client.lastSeenAt ? (
              <span className="ml-auto flex items-center gap-1.5 text-theme-accent">
                <span className="size-1.5 rounded-full bg-theme-accent" />
                Active
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  if (isPreview) {
    return content;
  }

  return (
    <Link id={"client-" + client.id} href={`/admin/clients#client-${client.id}`} className="block">
      {content}
    </Link>
  );
}

export function AdminClientsOverview({ clients }: AdminClientsOverviewProps) {
  const isPreview = false;

  const visibleClients = clients;

  const clientsWithProjects = visibleClients.filter(client => client.activeProjectCount > 0).length;

  const openRequests = visibleClients.reduce(
    (requestTotal, client) => requestTotal + client.openRequestCount,
    0
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 px-1 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">Client accounts</p>

              {isPreview ? (
                <span className="rounded-full border border-border bg-surface-raised px-2 py-0.5 text-xs font-medium uppercase tracking-[0.08em] text-muted">
                  Preview
                </span>
              ) : null}
            </div>

            <p className="mt-1 text-xs text-muted">Clients, projects and open requests.</p>
          </div>

          <Link
            href="/admin/clients"
            className="text-xs font-medium text-muted transition-colors hover:text-foreground">
            View all
          </Link>
        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
          <span>
            <strong className="font-semibold text-foreground">{visibleClients.length}</strong> clients
          </span>

          <span>
            <strong className="font-semibold text-foreground">{clientsWithProjects}</strong> with projects
          </span>

          <span>
            <strong className="font-semibold text-foreground">{openRequests}</strong> requests
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="space-y-2.5">
          {visibleClients.map(client => (
            <ClientRow key={client.id} client={client} isPreview={isPreview} />
          ))}
        </div>
      </div>
    </div>
  );
}
