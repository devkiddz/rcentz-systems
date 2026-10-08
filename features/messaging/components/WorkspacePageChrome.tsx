"use client";
import { usePathname } from "next/navigation";
export function WorkspacePageChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  return usePathname() === "/dashboard/messages" ? null : children;
}
