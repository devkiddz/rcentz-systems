import type { ReactNode } from 'react';

type DashboardCanvasProps = {
  children: ReactNode;
  className?: string;
};

export function DashboardCanvas({ children, className = '' }: DashboardCanvasProps) {
  return (
    <div
      className={[
        'rcentz-dashboard-frame',
        'mx-auto',
        'w-full',
        'max-w-[1200px]',

        'px-4',
        'pb-14',
        'sm:px-6',
        'lg:px-8',

        className
      ].join(' ')}>
      {children}
    </div>
  );
}
