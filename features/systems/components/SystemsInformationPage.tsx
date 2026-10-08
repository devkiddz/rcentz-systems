import Link from 'next/link';
import { ArrowUpRight, Check, Layers3 } from 'lucide-react';
import { informationPages } from '../content/information-pages';
import { projectEntryUrl } from '../lib/project-entry';

export function SystemsInformationPage({
  slug
}: {
  slug: keyof typeof informationPages;
}) {
  const page = informationPages[slug];
  return (
    <div className="rcentz-section py-8 sm:py-12">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center text-xs text-muted-foreground hover:text-foreground"
      >
        Rcentz Systems / {page.label}
      </Link>
      <section className="max-w-4xl pb-10 pt-5 sm:pb-14">
        <p className="text-xs font-medium text-muted-foreground">
          {page.label}
        </p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
          {page.title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
          {page.description}
        </p>
        <Link
          href={projectEntryUrl}
          className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background"
        >
          Start a project
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </section>
      <section
        aria-label={page.label + ' details'}
        className="grid gap-4 md:grid-cols-3"
      >
        {page.cards.map((card) => (
          <article
            key={card.title}
            className="rounded-2xl border border-border bg-surface-subtle p-5 sm:p-6"
          >
            <Layers3 aria-hidden="true" className="size-5 text-theme-accent" />
            <h2 className="mt-5 text-lg font-semibold tracking-tight">
              {card.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {card.text}
            </p>
            <ul className="mt-5 space-y-3">
              {card.points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2 text-xs leading-5"
                >
                  <Check
                    aria-hidden="true"
                    className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                  />
                  {point}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
      <section className="my-12 grid gap-6 border-y border-border py-8 sm:my-16 sm:py-10 lg:grid-cols-2">
        <h2 className="max-w-lg text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
          {page.nextTitle}
        </h2>
        <p className="max-w-xl text-sm leading-7 text-muted-foreground">
          {page.nextText}
        </p>
      </section>
      <section className="max-w-3xl pb-10">
        <h2 className="text-xl font-semibold">A few useful details.</h2>
        <div className="mt-5 divide-y divide-border">
          {page.questions.map(([question, answer]) => (
            <details key={question} className="py-4">
              <summary className="cursor-pointer text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {question}
              </summary>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
