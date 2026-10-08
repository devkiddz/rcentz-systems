import Image from 'next/image';
import { Bell, Check, FileText, Home, Layers3, MessageSquare, Search } from 'lucide-react';
import { RcentzBrandSymbol } from '@/ui-shell/brand/RcentzBrandSymbol';

const updates = [
  ['Preview ready', 'Customer accounts are ready to review.'],
  ['Workflow update', 'Request tracking is in development.'],
  ['Your next review', 'Confirm team roles before release.']
] as const;

export function SystemsProjectDashboardPreview() {
  return (
    <div className="flex h-full bg-surface-subtle text-left">
      <aside aria-label="Illustrated workspace navigation" className="flex w-10 shrink-0 flex-col items-center gap-5 border-r border-border bg-background py-4 sm:w-12">
        <RcentzBrandSymbol className="size-5" />
        {[Home, Layers3, FileText, MessageSquare].map((Icon, index) => (
          <span key={index} aria-hidden="true" className={index === 0 ? 'rounded-lg bg-theme-accent-soft p-1.5 text-theme-accent' : 'p-1.5 text-muted-foreground'}><Icon className="size-3.5" /></span>
        ))}
      </aside>
      <div className="min-w-0 flex-1 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
          <div className="min-w-0"><p className="text-xs font-semibold">Welcome, Northstar.</p><p className="mt-1 text-[9px] text-muted-foreground">Project workspace / RC-2048</p></div>
          <div aria-hidden="true" className="flex items-center gap-2 text-muted-foreground"><Search className="size-3.5" /><Bell className="size-3.5" /></div>
        </div>
        <div className="mt-3 flex items-start justify-between gap-2">
          <div className="min-w-0"><h3 className="text-sm font-semibold leading-5">Customer Operations Platform</h3><p className="mt-1 text-[9px] text-muted-foreground">Customer accounts · Requests · Team access</p></div>
          <span className="shrink-0 rounded-full border border-border px-2 py-1 text-[8px] text-muted-foreground">Example</span>
        </div>
        <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_150px]">
          <div className="min-w-0 space-y-3">
            <div className="grid grid-cols-[minmax(0,1fr)_100px] gap-2 sm:grid-cols-[minmax(0,1fr)_120px]">
              <section className="min-w-0 rounded-xl border border-border bg-background p-3">
                <h4 className="text-[10px] font-semibold">Delivery progress</h4>
                <p className="mt-1 text-lg font-semibold">62% <span className="text-[8px] font-normal text-muted-foreground">in development</span></p>
                <svg role="img" aria-label="Illustrative progress rising through plan, build and review" viewBox="0 0 220 85" className="mt-2 h-20 w-full text-theme-accent">
                  {[20, 45, 70].map(y => <path key={y} d={`M0 ${y}H220`} stroke="var(--border)" strokeWidth="1" />)}
                  <path d="M0 75L28 70L55 56L83 60L110 39L138 43L165 22L192 26L220 10V85H0Z" fill="currentColor" opacity="0.1" />
                  <path d="M0 75L28 70L55 56L83 60L110 39L138 43L165 22L192 26L220 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                <div className="flex justify-between text-[8px] text-muted-foreground"><span>Plan</span><span>Build</span><span>Review</span></div>
              </section>
              <section className="rounded-xl border border-border bg-background p-3">
                <h4 className="text-[10px] font-semibold">Milestones</h4>
                <div role="img" aria-label="2 of 4 milestones completed" className="relative mx-auto mt-4 flex size-16 items-center justify-center rounded-full" style={{ background: 'conic-gradient(var(--theme-accent) 50%, var(--border) 0)' }}>
                  <span className="absolute inset-[6px] rounded-full bg-background" /><span className="relative text-sm font-semibold">2 / 4</span>
                </div>
                <p className="mt-3 text-center text-[8px] text-muted-foreground">Next: workflow review</p>
              </section>
            </div>
            <section className="overflow-hidden rounded-xl border border-border bg-background">
              <div className="flex items-center justify-between gap-2 px-3 py-2"><h4 className="text-[10px] font-semibold">Application preview</h4><span className="text-[8px] text-muted-foreground">Portfolio example</span></div>
              <Image src="/portfolio/screenshots/shelsea-commerce/01-home-desktop.webp" alt="Example commerce application screenshot from the Rcentz portfolio" width={1440} height={1000} unoptimized className="h-28 w-full border-y border-border object-cover object-top sm:h-36" sizes="(min-width: 1280px) 400px, 80vw" />
              <p className="px-3 py-2 text-[8px] leading-4 text-muted-foreground">Your project screenshot will appear here alongside its delivery records.</p>
            </section>
          </div>
          <section className="min-w-0 rounded-xl border border-border bg-background p-3">
            <h4 className="text-[10px] font-semibold">Latest updates</h4>
            <ol className="mt-3 grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
              {updates.map(([title, detail], index) => <li key={title} className={['rounded-lg bg-surface-subtle p-2', index > 0 ? 'hidden sm:block' : ''].join(' ')}><p className="flex items-center gap-1.5 text-[9px] font-semibold"><Check aria-hidden="true" className="size-3 shrink-0 text-theme-accent" />{title}</p><p className="mt-1 text-[8px] leading-4 text-muted-foreground">{detail}</p></li>)}
            </ol>
          </section>
        </div>
        <p className="mt-3 text-[8px] leading-4 text-muted-foreground">Illustrative project data · Preview hosted on Vercel · Target: 18 Nov 2026</p>
      </div>
    </div>
  );
}
