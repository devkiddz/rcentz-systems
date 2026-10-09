import Link from 'next/link';
import { ArrowUpRight, CalendarDays, FolderKanban } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DeliveryProgress } from '@/components/ui/DeliveryProgress';
import type { OverviewProject } from '@/features/admin/server/overview/get-overview-projects';

function humanize(value: string) {
  return value.toLowerCase().split('_').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}
export function AdminProjectsProgress({ projects }: { projects: OverviewProject[] }) {
  return (
    <section className="flex h-96 flex-col overflow-hidden rounded-2xl border border-border bg-surface">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div><h2 className="text-sm font-semibold">Projects</h2><p className="mt-1 text-xs text-muted">Delivery progress and the next step</p></div>
        <Link href="/admin/projects" className="inline-flex min-h-10 shrink-0 items-center gap-2 text-xs font-medium text-muted hover:text-foreground">View all <ArrowUpRight aria-hidden="true" className="size-4" /></Link>
      </header>
      {projects.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center"><FolderKanban aria-hidden="true" className="size-6 text-theme-accent" /><p className="text-sm font-medium">No active projects</p><p className="text-xs text-muted">Projects appear here when planning begins.</p></div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-3">
            {projects.map(project => {
              const client = project.client?.name ?? 'Internal project';
              const progress = Math.min(100, Math.max(0, project.progress));
              return <Link key={project.id} href={`/admin/projects/${project.id}`} className="group flex min-w-0 flex-col rounded-xl border border-border bg-background p-4 transition-colors hover:border-theme-accent/50 hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <div className="flex items-start gap-3">
                  <Avatar className="size-9 shrink-0"><AvatarImage src={project.client?.image ?? undefined} alt={client} /><AvatarFallback className="bg-surface-muted text-xs font-semibold">{client.split(/\s+/).slice(0,2).map(part=>part.charAt(0)).join('')}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1"><h3 className="break-words text-sm font-semibold leading-5">{project.name}</h3><p className="mt-1 break-words text-xs text-muted">{client}</p></div>
                  <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-muted transition-colors group-hover:text-theme-accent" />
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-muted">Overall progress</span><span className="rounded-md border border-border bg-surface-subtle px-2 py-1 text-xs font-medium">{humanize(project.status)}</span></div>
                <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{progress}<span className="ml-1 text-sm text-muted">%</span></div>
                <DeliveryProgress value={progress} label={`${project.name} progress`} />
                <div className="mt-2 flex-1 border-t border-border pt-3"><p className="text-xs text-muted">Next milestone</p><p className="mt-1 break-words text-sm font-medium leading-5">{project.nextMilestone?.title ?? 'No open milestone'}</p></div>
                <p className="mt-4 flex items-center gap-2 text-xs text-muted"><CalendarDays aria-hidden="true" className="size-3.5 shrink-0" />{project.expectedEndAt ? new Intl.DateTimeFormat('en-NG', { month:'short', day:'numeric' }).format(project.expectedEndAt) : 'Target date not set'}</p>
              </Link>;
            })}
          </div>
        </div>
      )}
    </section>
  );
}
