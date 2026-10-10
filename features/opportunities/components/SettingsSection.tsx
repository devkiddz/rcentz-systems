"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export function SettingsSection({ title, description, children, defaultOpen = false, id, inset = false, grouped = false }: {
  title: string;
  description: string;
  children: ReactNode;
  defaultOpen?: boolean;
  id?: string;
  inset?: boolean;
  grouped?: boolean;
}) {
  return <details id={id} open={defaultOpen}
    onInvalidCapture={event => { event.currentTarget.open = true; }}
    className={inset ? "group/settings [&[open]>summary>svg]:rotate-180 scroll-mt-24 border-b border-border last:border-b-0" : "group/settings [&[open]>summary>svg]:rotate-180 scroll-mt-24 rounded-2xl border border-border bg-surface"}>
    <summary className="flex cursor-pointer list-none items-center justify-between gap-5 rounded-2xl p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:p-6 [&::-webkit-details-marker]:hidden">
      <span className="space-y-2">
        <span className="block font-semibold">{title}</span>
        <span className="block text-sm leading-relaxed text-muted-foreground">{description}</span>
      </span>
      <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none" />
    </summary>
    <div className={grouped ? "border-t border-border" : "space-y-6 border-t border-border p-5 sm:p-6"}>{children}</div>
  </details>;
}
