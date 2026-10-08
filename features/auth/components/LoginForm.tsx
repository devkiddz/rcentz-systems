'use client';

import { useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { resolveSafeRedirect } from '@/features/auth/lib/resolve-safe-redirect';

import { authClient } from '@/lib/auth-client';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const registered = searchParams.get('registered') === '1';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setIsPending(true);

    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password
      });
      if (result.error) {
        setError('We could not sign you in with those credentials.');
        return;
      }
      const destination = resolveSafeRedirect(
        searchParams.get('next'),
        '/start-project'
      );
      router.push(destination);
      router.refresh();
    } catch {
      setError('Connection interrupted. Please try again.');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {registered ? (
        <div className="flex gap-3 rounded-2xl border border-theme-accent/20 bg-theme-accent/5 px-4 py-3.5">
          <div className="mt-1 size-1.5 shrink-0 rounded-full bg-theme-accent" />

          <p className="text-sm leading-6 text-foreground/80">
            Your account has been created. Sign in to continue.
          </p>
        </div>
      ) : null}

      <div>
        <label
          htmlFor="login-email"
          className="mb-2 block text-xs font-medium text-foreground"
        >
          Email address
        </label>

        <div className="relative">
          <Mail
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
          />

          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="h-12 rounded-xl bg-background/70 pl-10"
            required
            disabled={isPending}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="login-password"
          className="mb-2 block text-xs font-medium text-foreground"
        >
          Password
        </label>

        <div className="relative">
          <LockKeyhole
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
          />

          <Input
            id="login-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            className="h-12 rounded-xl bg-background/70 px-10"
            required
            disabled={isPending}
          />

          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            disabled={isPending}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-foreground disabled:pointer-events-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" className="size-4" />
            ) : (
              <Eye aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive"
        >
          {error}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-xl"
      >
        {isPending ? (
          <>
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            Signing in
          </>
        ) : (
          'Sign in'
        )}
      </Button>
    </form>
  );
}
