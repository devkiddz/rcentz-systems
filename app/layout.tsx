import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { GeistSans as geistSans } from 'geist/font/sans';
import { GeistMono as geistMono } from 'geist/font/mono';

import { NextIntlClientProvider } from 'next-intl';

import { getLocale, getMessages } from 'next-intl/server';

import './globals.css';

import { ThemeProvider } from '@/components/theme-provider';

import { CustomerActivityDock } from '@/features/activity/components/CustomerActivityDock';

import { Toaster } from '@/components/ui/toast';
import { TooltipProvider } from '@/components/ui/tooltip';



export const metadata: Metadata = {
  title: {
    default: 'rcentz',
    template: '%s | rcentz'
  },
  description: 'rcentz builds and operates modern software, digital products, and client systems.'
};

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const locale = await getLocale();

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            themes={['light', 'dark']}
            storageKey="rcentz-theme"
            disableTransitionOnChange>
            <TooltipProvider>{children}</TooltipProvider>

            <CustomerActivityDock />
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
