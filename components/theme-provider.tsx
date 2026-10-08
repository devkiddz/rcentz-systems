'use client';

import * as React from 'react';
import { usePalette } from '@/ui-shell/theme/rcentz-palette';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  usePalette();
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
