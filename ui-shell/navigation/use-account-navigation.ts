'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type AccountNavigation = { signedIn: boolean; hasProjects: boolean };

export function useAccountNavigation() {
  const pathname = usePathname();
  const [account, setAccount] = useState<AccountNavigation | null>(null);

  useEffect(() => {
    let disposed = false;
    let request: AbortController | null = null;

    async function refresh() {
      if (document.hidden) return;
      request?.abort();
      const controller = new AbortController();
      request = controller;
      try {
        const response = await fetch('/api/navigation', {
          credentials: 'same-origin', cache: 'no-store', signal: controller.signal,
        });
        if (!response.ok) throw new Error('Navigation unavailable');
        const data: unknown = await response.json();
        if (!data || typeof data !== 'object' || !('signedIn' in data) ||
            !('hasProjects' in data) || typeof data.signedIn !== 'boolean' ||
            typeof data.hasProjects !== 'boolean') throw new Error('Invalid navigation status');
        if (!disposed && !controller.signal.aborted) {
          setAccount({ signedIn: data.signedIn, hasProjects: data.signedIn && data.hasProjects });
        }
      } catch {
        if (!disposed && !controller.signal.aborted) setAccount(null);
      }
    }

    void refresh();
    const update = () => { void refresh(); };
    window.addEventListener('focus', update);
    window.addEventListener('pageshow', update);
    document.addEventListener('visibilitychange', update);
    const interval = window.setInterval(update, 60000);
    return () => {
      disposed = true;
      request?.abort();
      window.clearInterval(interval);
      window.removeEventListener('focus', update);
      window.removeEventListener('pageshow', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, [pathname]);

  return account;
}
