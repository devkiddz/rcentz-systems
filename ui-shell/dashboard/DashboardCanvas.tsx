import type { ReactNode } from "react";

type DashboardCanvasProps = {
  children: ReactNode;
  className?: string;
  fluid?: boolean;
};

export function DashboardCanvas({
  children,
  className = "",
  fluid = false,
}: DashboardCanvasProps) {
  return (
    <div
      className={[
        "rcentz-dashboard-frame",
        "mx-auto",
        "w-full",
        fluid ? "max-w-none" : "max-w-[1200px]",

        "px-4",
        "pb-14",
        "sm:px-6",
        "lg:px-8",

        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
