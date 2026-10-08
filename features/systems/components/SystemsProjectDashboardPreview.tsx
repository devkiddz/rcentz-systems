import Image from 'next/image';
import { Activity, Bell, BookOpen, Check, ChevronDown, ChevronRight, ExternalLink, FileText, GitBranch, Globe2, Layers3, MessageSquare, Search } from 'lucide-react';
import { RcentzBrandSymbol } from '@/ui-shell/brand/RcentzBrandSymbol';
import { RcentzGithubIcon } from '@/ui-shell/brand/RcentzGithubIcon';

const navigation = [
  { label: 'Overview', icon: Layers3 },
  { label: 'Milestones', icon: Check },
  { label: 'Updates', icon: Activity },
  { label: 'Application', icon: Globe2 },
  { label: 'Documents', icon: FileText },
  { label: 'Support', icon: MessageSquare }
] as const;

export function SystemsProjectDashboardPreview() {
  return (
    <div className="flex h-full bg-background text-left">
      <aside aria-label="Illustrated customer portal navigation" className="flex w-10 shrink-0 flex-col border-r border-border sm:w-12 xl:w-36">
        <div className="flex h-12 items-center justify-center gap-2 border-b border-border px-2 xl:justify-start xl:px-3">
          <RcentzBrandSymbol className="size-5 shrink-0" />
          <span className="hidden truncate text-[10px] font-semibold xl:block">Your workspace</span>
        </div>
        <div aria-hidden="true" className="mx-2 mt-3 hidden items-center gap-2 rounded-md border border-border bg-surface-subtle px-2 py-2 text-[9px] text-muted-foreground xl:flex"><Search className="size-3" />Find a project</div>
        <ul className="mt-3 space-y-1 px-1.5">
          {navigation.map(({ label, icon: Icon }, index) => (
            <li key={label} className={['flex items-center justify-center gap-2 rounded-md px-1 py-2 xl:justify-start xl:px-2', index === 0 ? 'bg-surface-muted text-foreground' : 'text-muted-foreground'].join(' ')}>
              <Icon aria-hidden="true" className="size-3.5 shrink-0" /><span className="sr-only text-[10px] xl:not-sr-only">{label}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-center justify-center gap-2 border-t border-border px-2 py-3 xl:justify-start"><span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[8px] font-semibold">N</span><span className="hidden text-[9px] xl:block">Northstar team</span><Bell aria-hidden="true" className="ml-auto hidden size-3 text-muted-foreground xl:block" /></div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="flex h-12 items-center justify-between gap-2 border-b border-border px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-1.5"><h3 className="truncate text-[10px] font-semibold sm:text-xs">Customer Operations Platform</h3><ChevronDown aria-hidden="true" className="size-3 shrink-0 text-muted-foreground" /></div>
          <span className="shrink-0 text-[9px] font-medium">Overview</span>
        </div>
        <div className="space-y-3 p-3 sm:p-4">
          <section className="overflow-hidden rounded-lg border border-border bg-surface-subtle">
            <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-3">
              <h4 className="text-[11px] font-semibold">Latest application preview</h4>
              <div aria-hidden="true" className="flex shrink-0 items-center gap-2"><RcentzGithubIcon className="hidden size-3.5 sm:block" /><span className="flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[9px]">Preview <ExternalLink className="size-3" /></span></div>
            </div>
            <div className="grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="min-w-0">
                <Image src="/portfolio/screenshots/novashad-v01/01-dashboard-top-desktop.webp" alt="NovaShad dashboard screenshot, shown as a portfolio example of the application preview" width={1440} height={1000} unoptimized className="h-32 w-full rounded-md border border-border object-cover object-top sm:h-44" sizes="(min-width: 1280px) 320px, (min-width: 640px) 40vw, 80vw" />
                <p className="mt-1.5 text-[8px] text-muted-foreground">NovaShad · Portfolio screenshot</p>
              </div>
              <dl className="min-w-0 space-y-3 text-[9px]">
                <div><dt className="text-muted-foreground">Preview</dt><dd className="mt-1 break-all font-medium">customer-portal / latest build</dd></div>
                <div><dt className="text-muted-foreground">Application access</dt><dd className="mt-1 flex items-center gap-1 font-medium">Working preview available <ExternalLink aria-hidden="true" className="size-3" /></dd></div>
                <div className="grid grid-cols-2 gap-2"><div><dt className="text-muted-foreground">Status</dt><dd className="mt-1 flex items-center gap-1.5 font-medium"><span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-400" />Ready for review</dd></div><div><dt className="text-muted-foreground">Updated</dt><dd className="mt-1 font-medium">Today · Rcentz team</dd></div></div>
                <div><dt className="text-muted-foreground">Latest change</dt><dd className="mt-1 flex items-center gap-1.5 font-medium"><GitBranch aria-hidden="true" className="size-3 shrink-0" />Customer accounts and team access</dd></div>
              </dl>
            </div>
            <div className="flex items-center gap-2 border-t border-border px-3 py-2 text-[9px]"><ChevronRight aria-hidden="true" className="size-3 text-muted-foreground" /><span className="font-medium">Preview &amp; delivery settings</span><span className="ml-auto rounded-full bg-theme-accent-soft px-2 py-1 text-[8px] text-theme-accent">2 reviews pending</span></div>
          </section>
          <p className="text-[9px] leading-4 text-muted-foreground">Review the latest preview and keep decisions connected to your project.</p>
          <div role="region" aria-label="Project summary cards" tabIndex={0} className="flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
            <section className="w-[88%] shrink-0 snap-start rounded-lg border border-border bg-surface-subtle p-3 sm:w-auto">
              <h4 className="flex items-center justify-between text-[10px] font-semibold">Delivery checklist <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[8px]">2 / 4</span></h4>
              <ul className="mt-3 space-y-1.5 text-[9px]">
                {['Scope approved', 'Accounts completed', 'Review workflows'].map((label, index) => <li key={label} className={['flex items-center gap-1.5 rounded px-2 py-1.5', index < 2 ? 'bg-theme-accent-soft text-theme-accent' : 'bg-surface-muted'].join(' ')}>{index < 2 ? <Check aria-hidden="true" className="size-3 shrink-0" /> : <BookOpen aria-hidden="true" className="size-3 shrink-0" />}{label}</li>)}
              </ul>
            </section>
            <section className="w-[88%] shrink-0 snap-start rounded-lg border border-border bg-surface-subtle p-3 sm:w-auto">
              <h4 className="text-[10px] font-semibold">Project progress</h4>
              <p className="mt-3 text-lg font-semibold">62% <span className="text-[8px] font-normal text-muted-foreground">in development</span></p>
              <div className="mt-2 h-1 rounded-full bg-border"><div className="h-full w-[62%] rounded-full bg-theme-accent" /></div>
              <p className="mt-3 text-[9px] leading-4 text-muted-foreground">Next milestone: request tracking and team permissions.</p>
            </section>
            <section className="w-[88%] shrink-0 snap-start rounded-lg border border-border bg-surface-subtle p-3 sm:w-auto">
              <h4 className="text-[10px] font-semibold">Reviews &amp; support</h4>
              <MessageSquare aria-hidden="true" className="mt-3 size-5 text-muted-foreground" />
              <p className="mt-2 text-[9px] font-medium">Your feedback moves delivery forward.</p>
              <p className="mt-2 text-[9px] leading-4 text-muted-foreground">Keep comments, approvals and support in one place.</p>
            </section>
          </div>
          <p className="text-[8px] leading-4 text-muted-foreground">Illustrative customer portal · RC-2048 · Project data is mocked.</p>
        </div>
      </div>
    </div>
  );
}
