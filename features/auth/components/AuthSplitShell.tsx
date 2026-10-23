import type { ReactNode } from 'react';

import Link from 'next/link';

import { Activity, ArrowUpRight, CheckCircle2, LockKeyhole, Rocket, ServerCog } from 'lucide-react';

import { RcentzBrandLockup } from '@/ui-shell/brand/RcentzBrandLockup';
import { RcentzBrandSymbol } from '@/ui-shell/brand/RcentzBrandSymbol';

type AuthMode = 'login' | 'register';

type AuthSplitShellProps = {
  children: ReactNode;
  mode: AuthMode;
};

const authCopy = {
  login: {
    eyebrow: 'Welcome back',
    title: 'Sign in to Rcentz',
    description: 'Access your workspace, projects, updates and account activity.',
    switchText: 'New to Rcentz?',
    switchAction: 'Create account',
    switchHref: '/register'
  },

  register: {
    eyebrow: 'Create your account',
    title: 'Join Rcentz',
    description: 'Create your account to access services, projects and your private workspace.',
    switchText: 'Already have an account?',
    switchAction: 'Sign in',
    switchHref: '/login'
  }
} satisfies Record<
  AuthMode,
  {
    eyebrow: string;
    title: string;
    description: string;
    switchText: string;
    switchAction: string;
    switchHref: string;
  }
>;

export function AuthSplitShell({ children, mode }: AuthSplitShellProps) {
  const copy = authCopy[mode];

  return (
    <main className="min-h-screen">
      <div className="mx-auto grid min-h-screen w-full max-w-[1440px] lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)]">
        <section className="relative hidden min-h-screen border-r border-border/70 px-10 py-10 lg:flex lg:flex-col xl:px-14 xl:py-12">
          <div className="flex items-center justify-between gap-8">
            <Link href="/" aria-label="Rcentz home" className="inline-flex items-center gap-2.5">
              <RcentzBrandLockup className="w-26 shrink-0 md:w-36 xl:w-40" />
            </Link>

            <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
              <span className="size-1.5 rounded-full bg-theme-accent" />
              Production
            </div>
          </div>

          <div className="my-auto max-w-2xl py-14">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-theme-accent">Rcentz Core</p>

            <h2 className="mt-5 max-w-xl text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-foreground xl:text-5xl">
              Where projects move from idea to production.
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-muted xl:text-base xl:leading-8">
              One operating space for services, project delivery, collaboration and everything that comes
              after launch.
            </p>

            <div className="relative mt-10 overflow-hidden rounded-[30px] border border-border/80 bg-background/55 p-2 shadow-2xl shadow-black/10 backdrop-blur-xl">
              <div className="overflow-hidden rounded-[24px] border border-border/70 bg-background/80">
                <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-xl border border-border bg-background">
                      <RcentzBrandSymbol className="size-4" />
                    </div>

                    <div>
                      <p className="text-xs font-medium text-foreground">Client Production</p>

                      <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-muted">
                        rcentz.cc / workspace
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-full border border-border px-2.5 py-1">
                    <span className="size-1.5 rounded-full bg-theme-accent" />

                    <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">Live</span>
                  </div>
                </div>

                <div className="grid gap-4 p-5 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-5">
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-muted">
                          Active project
                        </p>

                        <h3 className="mt-3 text-lg font-semibold tracking-[-0.03em] text-foreground">
                          Production Workspace
                        </h3>

                        <p className="mt-1 text-xs text-muted">System implementation</p>
                      </div>

                      <div className="flex size-9 items-center justify-center rounded-xl bg-theme-accent/10 text-theme-accent">
                        <Rocket aria-hidden="true" className="size-4" />
                      </div>
                    </div>

                    <div className="mt-8">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted">Delivery progress</span>

                        <span className="font-mono text-[10px] text-foreground">84%</span>
                      </div>

                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                        <div className="h-full w-[84%] rounded-full bg-theme-accent" />
                      </div>
                    </div>

                    <div className="mt-7 grid grid-cols-3 gap-2">
                      <div className="rounded-xl border border-border/70 px-3 py-3">
                        <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted">Phase</p>

                        <p className="mt-1.5 text-xs font-medium text-foreground">Production</p>
                      </div>

                      <div className="rounded-xl border border-border/70 px-3 py-3">
                        <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted">Health</p>

                        <p className="mt-1.5 text-xs font-medium text-foreground">Stable</p>
                      </div>

                      <div className="rounded-xl border border-border/70 px-3 py-3">
                        <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted">Access</p>

                        <p className="mt-1.5 text-xs font-medium text-foreground">Secured</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <ProductionStatus icon={ServerCog} label="Deployment" value="Active" />

                    <ProductionStatus icon={Activity} label="Project control" value="Synced" />

                    <ProductionStatus icon={LockKeyhole} label="Client access" value="Protected" />

                    <div className="flex min-h-20 items-center gap-3 rounded-2xl border border-border/70 bg-theme-accent/5 px-4">
                      <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-theme-accent" />

                      <div>
                        <p className="text-xs font-medium text-foreground">Production ready</p>

                        <p className="mt-1 text-[10px] leading-4 text-muted">Systems operating normally.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border/70 px-5 py-3">
                  <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">
                    Rcentz production environment
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="size-1 rounded-full bg-theme-accent/40" />
                    <span className="size-1 rounded-full bg-theme-accent/70" />
                    <span className="size-1 rounded-full bg-theme-accent" />
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/"
              className="group mt-8 inline-flex items-center gap-2 text-xs text-muted transition-colors hover:text-foreground">
              Explore Rcentz
              <ArrowUpRight
                aria-hidden="true"
                className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <div className="flex items-center justify-between gap-8 border-t border-border/70 pt-6 font-mono text-[8px] uppercase tracking-[0.15em] text-muted">
            <span>Rcentz Systems</span>

            <span>Software Â· Systems Â· Production</span>
          </div>
        </section>

        <section className="relative flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-10 xl:px-14">
          <div className="w-full max-w-[460px]">
            <div className="mb-12 flex items-center justify-between lg:hidden">
              <Link href="/" aria-label="Rcentz home" className="inline-flex items-center gap-2.5">
                <RcentzBrandLockup className="w-26 shrink-0 md:w-36 xl:w-40" />
              </Link>

              <div className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.15em] text-muted">
                <span className="size-1.5 rounded-full bg-theme-accent" />
                Secure
              </div>
            </div>

            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-theme-accent">
                {copy.eyebrow}
              </p>

              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-foreground sm:text-4xl">
                {copy.title}
              </h1>

              <p className="mt-3 max-w-md text-sm leading-6 text-muted">{copy.description}</p>
            </div>

            <div className="mt-8">{children}</div>

            <p className="mt-7 text-center text-sm text-muted">
              {copy.switchText}{' '}
              <Link
                href={copy.switchHref}
                className="font-medium text-foreground transition-colors hover:text-theme-accent">
                {copy.switchAction}
              </Link>
            </p>

            <p className="mx-auto mt-5 max-w-sm text-center text-[11px] leading-5 text-muted">
              By continuing, you agree to Rcentz{' '}
              <span className="font-medium text-foreground">Terms &amp; Conditions</span> and acknowledge our{' '}
              <span className="font-medium text-foreground">Privacy Policy</span>.
            </p>

            <div className="mt-10 flex items-center justify-center gap-3 font-mono text-[8px] uppercase tracking-[0.14em] text-muted">
              <LockKeyhole aria-hidden="true" className="size-3" />
              Secure Rcentz account access
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

type ProductionStatusProps = {
  icon: typeof Activity;
  label: string;
  value: string;
};

function ProductionStatus({ icon: Icon, label, value }: ProductionStatusProps) {
  return (
    <div className="flex min-h-20 items-center gap-3 rounded-2xl border border-border/70 bg-background/70 px-4">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-theme-accent">
        <Icon aria-hidden="true" className="size-3.5" />
      </div>

      <div className="min-w-0">
        <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">{label}</p>

        <p className="mt-1 text-xs font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
