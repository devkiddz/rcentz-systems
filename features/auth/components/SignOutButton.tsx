'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export function SignOutButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  async function signOut() {
    setPending(true);
    setError(false);
    try {
      const result = await authClient.signOut();
      if (result.error) {
        setError(true);
        return;
      }
      router.replace('/login');
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => void signOut()}
        className="min-h-11 text-xs underline underline-offset-4 disabled:opacity-50"
      >
        {pending ? 'Signing out…' : 'Sign out'}
      </button>
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          Could not sign out. Try again.
        </p>
      ) : null}
    </div>
  );
}
