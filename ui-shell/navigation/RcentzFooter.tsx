import Link from 'next/link';
import { RcentzBrandLogo } from '../brand/RcentzBrandLogo';
import { projectEntryUrl } from '@/features/systems/lib/project-entry';

export function RcentzFooter() {
  return (
    <footer className="rcentz-section py-10 sm:py-12">
      <div className="grid gap-8 sm:grid-cols-[1fr_auto]">
        <div>
          <Link href="/" aria-label="Rcentz Systems home" className="inline-flex min-h-11 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <RcentzBrandLogo className="h-auto w-20" />
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            Software built around your business.
          </p>
        </div>
        <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-8 text-sm sm:grid-cols-1">
          {[
            ['Solutions', '/#solutions'],
            ['How we work', '/#how-we-work'],
            ['Scope & pricing', '/#pricing'],
            ['Start a project', projectEntryUrl]
          ].map(([label, href]) => (
            <Link key={href} href={href} className="inline-flex min-h-11 items-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Rcentz Systems.</p>
        <a href="https://rcentz.cc" className="inline-flex min-h-11 items-center hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Rcentz ecosystem</a>
      </div>
    </footer>
  );
}
