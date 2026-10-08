"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export function AnalyticsLiveRefresh({ active }: { active: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      if (!document.hidden && document.hasFocus()) router.refresh();
    }, 30000);
    return () => window.clearInterval(timer);
  }, [active, router]);
  return null;
}
