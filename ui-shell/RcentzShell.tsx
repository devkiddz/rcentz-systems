import type { CSSProperties, ReactNode } from 'react';



import { RcentzContentFrame } from '@/ui-shell/layout/RcentzContentFrame';

import { RcentzBackToTop } from '@/ui-shell/navigation/RcentzBackToTop';

import { RcentzFooter } from '@/ui-shell/navigation/RcentzFooter';

import { RcentzHeader } from '@/ui-shell/navigation/RcentzHeader';

import { RcentzMobileNavigationPill } from '@/ui-shell/navigation/RcentzMobileNavigationPill';

type RcentzShellProps = {
  children: ReactNode;
  style?: CSSProperties;
};

export function RcentzShell({ children, style }: RcentzShellProps) {
  return (
    <div className="relative isolate min-h-screen overflow-x-clip bg-background" style={style}>


      <div className="relative z-10 flex min-h-screen flex-col">
        <RcentzHeader />

        <main className="flex-1 pb-14 pt-5 sm:pt-6 lg:pt-8">
          <RcentzContentFrame>{children}</RcentzContentFrame>
        </main>

        <RcentzFooter />
      </div>

      <RcentzBackToTop />

      <RcentzMobileNavigationPill />
    </div>
  );
}
