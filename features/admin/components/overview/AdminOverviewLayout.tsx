import type { ReactNode } from 'react';

type AdminOverviewLayoutProps = {
  children: ReactNode;
};

export function AdminOverviewLayout({ children }: AdminOverviewLayoutProps) {
  return (
    <div className="rcentz-dashboard-frame px-4 py-6 sm:px-6 lg:px-8">
      <div className="rcentz-dashboard-inner mx-auto w-full max-w-[1200px] space-y-5">{children}</div>
    </div>
  );
}
