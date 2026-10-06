import type { ReactNode } from 'react';

import { RcentzDataField } from '@/ui-shell/layers/RcentzDataField';

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background">
      <RcentzDataField />

      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
}
