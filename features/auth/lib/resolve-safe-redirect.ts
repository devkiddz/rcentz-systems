const INTERNAL_REDIRECT_ORIGIN = 'https://rcentz.internal';

export function resolveSafeRedirect(
  value: string | null | undefined,
  fallback: string
) {
  const candidate = value?.trim();

  if (!candidate || !candidate.startsWith('/')) {
    return fallback;
  }

  try {
    const resolved = new URL(candidate, INTERNAL_REDIRECT_ORIGIN);

    if (resolved.origin !== INTERNAL_REDIRECT_ORIGIN) {
      return fallback;
    }

    if (resolved.pathname === '/login' || resolved.pathname === '/register') {
      return fallback;
    }

    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return fallback;
  }
}
