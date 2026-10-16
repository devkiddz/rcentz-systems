import { Fragment } from 'react';
import Link from 'next/link';
import { ArrowUpRight, BriefcaseBusiness, ExternalLink, Globe2, Search } from 'lucide-react';

import {
  clientStateLabels,
  publicEvidenceUrl,
  type Prospect,
} from '@/features/opportunities/commercial-types';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export function CommercialLeadCard({ prospect }: { prospect: Prospect }) {
  const rawTitle = typeof prospect.qualification.title === 'string' && prospect.qualification.title.trim()
    ? prospect.qualification.title.trim()
    : prospect.businessName;
  const title = rawTitle
    .replace(/^r\/[a-z0-9_]+ on Reddit:\s*/i, '')
    .replace(/\s*\|\s*(?:Freelancer|Upwork)\s*$/i, '');
  const summary = prospect.summary.replace(/\s+/g, ' ').trim();
  const prefix = rawTitle.replace(/\s+/g, ' ').trim();
  const excerpt = (summary.startsWith(prefix) ? summary.slice(prefix.length) : summary)
    .replace(/^[\s:|.\u2026–—-]+/, '').trim();
  const hasExcerpt = excerpt.length >= 20 && /[\p{L}\p{N}]/u.test(excerpt);
  const sourceUrl = prospect.evidenceLinks.find(publicEvidenceUrl)
    ?? (publicEvidenceUrl(prospect.qualification.sourceUrl) ? prospect.qualification.sourceUrl : null);
  const source = sourceUrl ? new URL(sourceUrl) : null;
  const community = source?.hostname.replace(/^www\./, '') === 'reddit.com'
    ? source.pathname.match(/^\/r\/([a-z0-9_]+)(?:\/|$)/i)?.[1] : null;
  const sourceLabel = source
    ? source.hostname.replace(/^www\./, '') + (community ? ` · r/${community}` : '')
    : prospect.businessName;
  const research = prospect.qualification.kind === 'RESEARCH_LEAD';
  const request = prospect.qualification.kind === 'REQUEST_SIGNAL';
  const KindIcon = research ? Search : BriefcaseBusiness;
  const capturedAt = typeof prospect.qualification.capturedAt === 'string'
    && Number.isFinite(Date.parse(prospect.qualification.capturedAt))
    ? prospect.qualification.capturedAt : null;
  const foundDate = capturedAt ? new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Lagos',
  }).format(new Date(capturedAt)) : null;

  return (
    <article className="flex h-full min-w-0 flex-col rounded-xl border border-border bg-card text-card-foreground ring-1 ring-transparent transition-colors hover:border-border-strong focus-within:ring-ring/30">
      <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 rounded-md bg-theme-accent-faint px-2.5 py-1 text-xs font-medium text-theme-accent">
            <KindIcon aria-hidden="true" className="size-3.5 shrink-0" />
            {research ? 'Research prospect' : request ? 'Possible buyer request' : 'Public notice'}
          </span>
          <span className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
            {clientStateLabels[prospect.state]}
          </span>
        </div>

        <header className="space-y-2">
          <p className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <Globe2 aria-hidden="true" className="size-3.5 shrink-0" />
            <span className="truncate" title={sourceLabel}>{sourceLabel}</span>
          </p>
          <h2 className="break-words text-base font-semibold leading-snug tracking-tight">
            <Link href={`/admin/opportunities/clients/${prospect.id}`} className={`rounded-sm hover:underline ${focusRing}`}>
              {title.split('/').map((part, index, parts) => (
                <Fragment key={index}>{part}{index < parts.length - 1 ? <>/<wbr /></> : null}</Fragment>
              ))}
            </Link>
          </h2>
        </header>

        <p className={`min-h-16 text-sm leading-relaxed ${hasExcerpt ? 'line-clamp-3 text-muted-foreground' : 'text-muted-foreground'}`}>
          {hasExcerpt ? excerpt : 'The saved preview is incomplete. Open the original source to check the request, scope and current availability.'}
        </p>

        <dl className="grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
          <div className="min-w-0 space-y-1">
            <dt className="text-xs text-muted-foreground" title="Published source amount, not an agreed price.">Budget</dt>
            <dd className="break-words font-medium">{prospect.budgetSignal || 'Not recorded'}</dd>
          </div>
          <div className="min-w-0 space-y-1">
            <dt className="text-xs text-muted-foreground">Location</dt>
            <dd className="break-words font-medium">{prospect.country || 'Not confirmed'}</dd>
          </div>
        </dl>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span title="Text relevance only. This does not establish buying intent, eligibility or a chance of winning.">
            {prospect.fitScore === null ? 'Subject match not assessed' : `Subject match ${prospect.fitScore}/100`}
          </span>
          <span>{prospect.matches.length ? `${prospect.matches.length} capability ${prospect.matches.length === 1 ? 'link' : 'links'} to review` : 'Capability fit needs review'}</span>
          {capturedAt && foundDate ? (
            <time dateTime={capturedAt} title="Collection date; the source publication date still needs checking." className="w-full">
              Found {foundDate}
            </time>
          ) : null}
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4 sm:px-6">
        <Link href={`/admin/opportunities/clients/${prospect.id}`} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 ${focusRing}`}>
          Review lead
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
        {sourceUrl ? (
          <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-10 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:text-foreground ${focusRing}`}>
            Open source
            <ExternalLink aria-hidden="true" className="size-3.5" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : null}
      </footer>
    </article>
  );
}
