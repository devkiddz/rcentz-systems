'use client';

import { useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { resolveSafeRedirect } from '@/features/auth/lib/resolve-safe-redirect';

import { authClient } from '@/lib/auth-client';

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    const normalizedName = name.trim();
    const normalizedEmail = email.trim();

    if (!normalizedName) {
      setError('Enter your name to continue.');
      return;
    }

    if (password.length < 8) {
      setError('Your password must contain at least 8 characters.');

      return;
    }

    if (password !== confirmPassword) {
      setError('Your passwords do not match.');
      return;
    }

    setIsPending(true);

    try {
      const result = await authClient.signUp.email({
        name: normalizedName,
        email: normalizedEmail,
        password
      });
      if (result.error) {
        setError('We could not create your account with those details.');
        return;
      }
      const next = resolveSafeRedirect(
        searchParams.get('next'),
        '/start-project'
      );
      router.push(`/login?registered=1&next=${encodeURIComponent(next)}`);
      router.refresh();
    } catch {
      setError('Connection interrupted. Please try again.');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="register-name"
          className="mb-2 block text-xs font-medium text-foreground"
        >
          Full name
        </label>

        <div className="relative">
          <UserRound
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
          />

          <Input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your full name"
            className="h-12 rounded-xl bg-background/70 pl-10"
            required
            disabled={isPending}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="register-email"
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
            id="register-email"
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
          htmlFor="register-password"
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
            id="register-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimum 8 characters"
            className="h-12 rounded-xl bg-background/70 px-10"
            minLength={8}
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

        <p className="mt-2 text-[11px] leading-5 text-muted">
          Use at least 8 characters.
        </p>
      </div>

      <div>
        <label
          htmlFor="register-confirm-password"
          className="mb-2 block text-xs font-medium text-foreground"
        >
          Confirm password
        </label>

        <div className="relative">
          <LockKeyhole
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
          />

          <Input
            id="register-confirm-password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat your password"
            className="h-12 rounded-xl bg-background/70 px-10"
            minLength={8}
            required
            disabled={isPending}
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword((value) => !value)}
            disabled={isPending}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-foreground disabled:pointer-events-none"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? (
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
            Creating account
          </>
        ) : (
          'Create account'
        )}
      </Button>

      <p className="text-center text-[11px] leading-5 text-muted">
        By creating an account, you agree to use Rcentz services responsibly.
      </p>
    </form>
  );
}
