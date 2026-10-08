'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Activity, Bell, BookOpen, Check, ChevronDown, ChevronRight, ExternalLink, FileText, GitBranch, Globe2, Layers3, MessageSquare, Search, X } from 'lucide-react';
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

const messages = {
  Review: 'Review the latest application preview and send your approval or feedback.',
  Support: 'Keep support requests and delivery records connected to your project.',
} as const;

export function SystemsProjectDashboardPreview() {
  const [activeAction, setActiveAction] = useState<keyof typeof messages | null>(null);

  return (
    <div className="relative flex h-full bg-background text-left">
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
          <div className="flex items-center justify-end gap-2">
            {([{ label: 'Review', icon: MessageSquare }] as const).map(({ label, icon: Icon }) => (
              <button key={label} type="button" aria-expanded={activeAction === label} aria-controls="portal-demo-message" onClick={() => setActiveAction(current => current === label ? null : label)} className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-border px-2 text-[9px] font-medium hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Icon aria-hidden="true" className="size-3" />{label}</button>
            ))}
          </div>
          <div id="portal-demo-message" hidden={!activeAction} className="absolute bottom-16 right-3 z-30 w-64 max-w-[calc(100%-24px)] rounded-xl border border-border bg-background p-3 shadow-lg">
            {activeAction ? <div className="flex items-start justify-between gap-3"><div role="status"><p className="text-[10px] font-semibold">{activeAction} · Workspace demo</p><p className="mt-1 text-[9px] leading-4 text-muted-foreground">{messages[activeAction]}</p></div><button type="button" onClick={() => setActiveAction(null)} aria-label="Close workspace message" className="flex size-8 shrink-0 items-center justify-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><X aria-hidden="true" className="size-3" /></button></div> : null}
          </div>
          <section className="overflow-hidden rounded-lg border border-border bg-surface-subtle">
            <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-3">
              <h4 className="text-[11px] font-semibold">Latest application preview</h4>
              <div aria-hidden="true" className="flex shrink-0 items-center gap-2"><RcentzGithubIcon className="hidden size-3.5 sm:block" /><span className="flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[9px]">Preview <ExternalLink className="size-3" /></span></div>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.65fr)] items-start gap-2 p-2 sm:gap-3 sm:p-3">
              <div className="min-w-0">
                <Image src="/portfolio/screenshots/novashad-v01/01-dashboard-top-desktop.webp" alt="NovaShad dashboard screenshot, shown as a portfolio example of the application preview" width={1440} height={1000} unoptimized className="h-28 w-full rounded-md border border-border object-cover object-top sm:h-44" sizes="(min-width: 1280px) 320px, (min-width: 640px) 40vw, 80vw" />
                <p className="mt-1.5 text-[8px] text-muted-foreground">NovaShad · Portfolio screenshot</p>
              </div>
              <dl className="min-w-0 space-y-2 text-[7px] sm:space-y-3 sm:text-[9px]">
                <div><dt className="text-muted-foreground">Preview</dt><dd className="mt-1 break-all font-medium">customer-portal / latest build</dd></div>
                <div><dt className="text-muted-foreground">Application access</dt><dd className="mt-1 flex items-center gap-1 font-medium">Working preview available <ExternalLink aria-hidden="true" className="size-3" /></dd></div>
                <div className="grid grid-cols-2 gap-2"><div><dt className="text-muted-foreground">Status</dt><dd className="mt-1 flex items-center gap-1.5 font-medium"><span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-400" />Ready for review</dd></div></div>
                <div><dt className="text-muted-foreground">Latest change</dt><dd className="mt-1 flex items-center gap-1.5 font-medium"><GitBranch aria-hidden="true" className="size-3 shrink-0" />Customer accounts and team access</dd></div>
              </dl>
              <div className="min-w-0">
                <h4 className="text-center text-[8px] font-semibold sm:text-[10px]">Project progress</h4>
              <div role="img" aria-label="Illustrative project progress: 62 percent completed" className="relative mx-auto mt-3 flex size-14 sm:size-20 items-center justify-center rounded-full" style={{ background: 'conic-gradient(#38bdf8 0% 25%, #818cf8 25% 45%, #34d399 45% 62%, var(--border) 62% 100%)' }}>
                <span className="absolute inset-1.5 sm:inset-2 rounded-full bg-surface-subtle" /><span className="relative text-xs sm:text-lg font-semibold">62%</span>
              </div>
              <p className="mt-2 text-center text-[8px] text-muted-foreground">In development</p>
              <p className="mt-3 text-center text-[7px] sm:text-[8px] leading-4 text-muted-foreground">Last updated<br /><time dateTime="2026-10-08T14:20:00+01:00" className="font-medium text-foreground">08 Oct 2026 · 2:20 PM WAT</time></p>
              </div>
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
              <h4 className="text-[10px] font-semibold">Performance analytics</h4>
              <p className="mt-2 text-[9px] text-muted-foreground">Application activity · Last 6 days</p>
              <svg role="img" aria-label="Illustrative application activity rising from October 3 to 8" viewBox="0 0 180 110" className="mt-3 h-28 w-full">
                {[20, 50, 80].map(y => <path key={y} d={`M4 ${y}H176`} stroke="var(--border)" strokeWidth="0.5" />)}
                <path d="M8 86L36 75L64 69L92 48L120 38L148 23L172 13V95H8Z" fill="var(--theme-accent)" opacity="0.06" />
                <path d="M8 86L36 75L64 69L92 48L120 38L148 23L172 13" fill="none" stroke="var(--theme-accent)" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                {[3, 4, 5, 6, 7, 8].map((day, index) => <text key={day} x={12 + index * 31} y="107" textAnchor="middle" fontSize="7" fill="var(--muted-foreground)">{day} Oct</text>)}
              </svg>
              <p className="mt-2 text-[9px] leading-4 text-muted-foreground"><span className="font-semibold text-foreground">99.9% uptime</span> · 240 ms response</p>
              <p className="mt-1 text-[8px] text-muted-foreground">Illustrative performance readings</p>
            </section>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[8px] leading-4 text-muted-foreground">Illustrative customer portal · RC-2048 · Project data is mocked.</p>
            <button type="button" aria-label="Open workspace support chat" aria-expanded={activeAction === 'Support'} aria-controls="portal-demo-message" onClick={() => setActiveAction(current => current === 'Support' ? null : 'Support')} className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><MessageSquare aria-hidden="true" className="size-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
