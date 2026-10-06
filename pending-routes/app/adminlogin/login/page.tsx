import Link from 'next/link';

import { ArrowLeft, ArrowUpRight, CircleCheck, ServerCog, ShieldCheck, Workflow } from 'lucide-react';

import { getTranslations } from 'next-intl/server';

import { AdminLoginForm } from '@/features/auth/components/AdminLoginForm';

export default async function AdminLoginPage() {
  const t = await getTranslations('AdminLogin');

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--grid-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-line)_1px,transparent_1px)] bg-[size:64px_64px] opacity-35"
      />

      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-border" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 sm:px-8 lg:px-12 xl:px-16">
        <header className="flex h-20 items-center justify-between border-b border-border/70">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-sm font-semibold tracking-[-0.02em] text-foreground">
            <div className="flex size-9 items-center justify-center rounded-full border border-border bg-foreground text-sm font-bold text-background">
              R
            </div>

            <span>Rcentz Systems</span>
          </Link>

          <div className="hidden items-center gap-2 sm:flex">
            <span className="size-1.5 rounded-full bg-theme-accent" />

            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              Private workspace
            </span>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-14 py-12 lg:grid-cols-[minmax(0,1fr)_440px] lg:py-16">
          <section className="max-w-2xl">
            <div className="mb-8 flex size-11 items-center justify-center rounded-2xl border border-border bg-surface-muted text-theme-accent">
              <ShieldCheck aria-hidden="true" className="size-4.5" />
            </div>

            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-theme-accent">
              {t('eyebrow')}
            </p>

            <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-5xl lg:text-6xl">
              {t('title')}
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-muted sm:text-base sm:leading-8">
              {t('description')}
            </p>

            <div className="mt-10 flex max-w-xl flex-col border-y border-border/70 sm:flex-row sm:items-stretch">
              <div className="flex flex-1 items-center gap-3 border-b border-border/70 py-4 sm:border-b-0 sm:border-r sm:pr-5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-muted text-theme-accent">
                  <ServerCog aria-hidden="true" className="size-4" />
                </div>

                <div className="min-w-0">
                  <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted">Environment</p>

                  <p className="mt-1 text-sm font-medium text-foreground">Production</p>
                </div>
              </div>

              <div className="flex flex-1 items-center gap-3 border-b border-border/70 py-4 sm:border-b-0 sm:border-r sm:px-5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-muted text-theme-accent">
                  <CircleCheck aria-hidden="true" className="size-4" />
                </div>

                <div className="min-w-0">
                  <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted">Access</p>

                  <p className="mt-1 text-sm font-medium text-foreground">Authorized only</p>
                </div>
              </div>

              <div className="flex flex-1 items-center gap-3 py-4 sm:pl-5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-muted text-theme-accent">
                  <Workflow aria-hidden="true" className="size-4" />
                </div>

                <div className="min-w-0">
                  <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted">System</p>

                  <p className="mt-1 text-sm font-medium text-foreground">Rcentz Core</p>
                </div>
              </div>
            </div>

            <div className="mt-8 hidden lg:block">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 text-xs text-muted transition-colors hover:text-foreground">
                Public website
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </section>

          <section className="w-full">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">Authentication</p>

                <p className="mt-2 text-sm font-medium text-foreground">Secure administrator access</p>
              </div>

              <span className="size-1.5 rounded-full bg-theme-accent" />
            </div>

            <AdminLoginForm />

            <div className="mt-6 flex items-center justify-between gap-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs text-muted transition-colors hover:text-foreground">
                <ArrowLeft aria-hidden="true" className="size-3.5" />

                {t('form.backHome')}
              </Link>

              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                Rcentz Systems
              </span>
            </div>
          </section>
        </div>

        <footer className="flex min-h-16 items-center justify-between border-t border-border/70 py-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">Rcentz Systems</p>

          <p className="hidden font-mono text-[9px] uppercase tracking-[0.14em] text-muted sm:block">
            Secure Operations
          </p>
        </footer>
      </div>
    </main>
  );
}
