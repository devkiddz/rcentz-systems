import Link from 'next/link';
import { ArrowRight, FileText, Layers3, LockKeyhole } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export function ProjectAccountAccess({
  mode,
  next,
  configured
}: {
  mode: 'login' | 'register';
  next: string;
  configured: boolean;
}) {
  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-8 sm:py-16 lg:grid-cols-2 lg:gap-20">
      <section className="self-center">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Your project starts here
        </p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          A workspace for what
          <br />
          you want to build.
        </h1>
        <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">
          Create your account, tell us about your business and send a clear
          brief. Your request stays connected to your account.
        </p>
        <div
          aria-hidden="true"
          className="mt-8 grid max-w-md grid-cols-3 items-center gap-3 rounded-2xl border border-border bg-surface-subtle p-5"
        >
          {[
            [LockKeyhole, 'Your account'],
            [FileText, 'Your brief'],
            [Layers3, 'Your workspace']
          ].map(([Icon, label], index) => {
            const IllustrationIcon = Icon as typeof LockKeyhole;
            return (
              <div key={index} className="text-center">
                <IllustrationIcon className="mx-auto size-6 text-theme-accent" />
                <p className="mt-3 text-[10px] font-medium">
                  {label as string}
                </p>
                {index < 2 ? (
                  <ArrowRight className="mx-auto mt-3 size-3 text-muted-foreground" />
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
      <section className="rounded-2xl border border-border bg-surface-subtle p-5 sm:p-8">
        <h2 className="text-2xl font-semibold">
          {mode === 'login' ? 'Sign in to continue.' : 'Create your account.'}
        </h2>
        <p className="mb-6 mt-2 text-sm leading-6 text-muted-foreground">
          {mode === 'login'
            ? 'Keep your brief and delivery records in one place.'
            : 'Use the email you want connected to your project.'}
        </p>
        {configured ? (
          mode === 'login' ? (
            <LoginForm />
          ) : (
            <RegisterForm />
          )
        ) : (
          <div
            role="status"
            className="rounded-xl border border-border p-4 text-sm leading-6"
          >
            Account access is temporarily unavailable. Contact{' '}
            <a className="underline" href="mailto:dennis@rcentz.cc">
              dennis@rcentz.cc
            </a>{' '}
            to discuss your project.
          </div>
        )}
        <p className="mt-6 text-sm text-muted-foreground">
          {mode === 'login' ? 'New to Rcentz? ' : 'Already have an account? '}
          <Link
            href={`${mode === 'login' ? '/register' : '/login'}?next=${encodeURIComponent(next)}`}
            className="font-medium text-foreground underline underline-offset-4"
          >
            {mode === 'login' ? 'Create an account' : 'Sign in'}
          </Link>
        </p>
      </section>
    </main>
  );
}
