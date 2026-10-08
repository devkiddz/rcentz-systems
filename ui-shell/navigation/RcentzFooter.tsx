import Link from 'next/link';
import { ArrowUpRight, Mail } from 'lucide-react';
import { RcentzBrandLogo } from '../brand/RcentzBrandLogo';
import { RcentzGithubIcon } from '../brand/RcentzGithubIcon';
import { projectEntryUrl } from '@/features/systems/lib/project-entry';

const groups = [
  {
    title: 'Build with us',
    links: [
      ['Solutions', '/solutions'],
      ['Our tools', '/tools'],
      ['How we work', '/how-we-work'],
      ['Scope & pricing', '/pricing']
    ]
  },
  {
    title: 'Your project',
    links: [
      ['Start a project', projectEntryUrl],
      ['Your workspace', '/workspace'],
      ['Remote delivery', '/remote-delivery'],
      ['Contact the team', 'mailto:contact@rcentz.cc']
    ]
  },
  {
    title: 'Around Rcentz',
    links: [
      ['Company', 'https://rcentz.cc/about'],
      ['Products', 'https://products.rcentz.cc'],
      ['Contact', 'https://rcentz.cc/contact'],
      ['GitHub', 'https://github.com/devkiddz/rcentz-systems']
    ]
  }
] as const;

export function RcentzFooter() {
  return (
    <footer className="rcentz-section border-t border-border pb-8 pt-12 sm:pt-16">
      <div className="flex flex-col items-start justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            A clear brief. A better starting point.
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Tell us what your business needs. We will work through the scope
            together.
          </p>
        </div>
        <Link
          href={projectEntryUrl}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Start a project
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-6 py-8 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="col-span-2 lg:col-span-1">
          <Link
            href="/"
            aria-label="Rcentz Systems home"
            className="inline-flex min-h-11 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RcentzBrandLogo className="h-auto w-20" />
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
            Applications, connected workflows and digital infrastructure built
            around your business.
          </p>
          <p className="mt-4 text-xs leading-6 text-muted-foreground">
            Clear scope. Shared progress. Remote collaboration.
          </p>
          <div className="mt-4 flex gap-2">
            <a
              href="mailto:contact@rcentz.cc"
              aria-label="Email Rcentz"
              className="flex size-11 items-center justify-center rounded-full border border-border hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Mail aria-hidden="true" className="size-4" />
            </a>
            <a
              href="https://github.com/devkiddz/rcentz-systems"
              aria-label="Rcentz Systems on GitHub"
              className="flex size-11 items-center justify-center rounded-full border border-border hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <RcentzGithubIcon className="size-4" />
            </a>
          </div>
        </div>
        {groups.map((group) => (
          <nav
            key={group.title}
            aria-label={group.title + ' footer links'}
            className={
              group.title === 'Around Rcentz'
                ? 'col-span-2 lg:col-span-1'
                : undefined
            }
          >
            <h3 className="text-xs font-semibold">{group.title}</h3>
            <ul
              className={
                group.title === 'Around Rcentz'
                  ? 'mt-3 grid grid-cols-2 gap-x-8 gap-y-1 lg:block lg:space-y-1'
                  : 'mt-3 space-y-1'
              }
            >
              {group.links.map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="inline-flex min-h-11 items-center text-xs text-muted-foreground sm:min-h-9 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Rcentz Systems.</p>
        <div className="flex flex-wrap items-center gap-5">
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center hover:text-foreground"
          >
            Account access
          </Link>
          <a
            href="mailto:contact@rcentz.cc"
            className="inline-flex min-h-11 items-center hover:text-foreground"
          >
            contact@rcentz.cc
          </a>
        </div>
      </div>
    </footer>
  );
}
