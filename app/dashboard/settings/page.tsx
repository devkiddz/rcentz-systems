import Link from "next/link";
import {
  UserRound,
  ReceiptText,
  BadgeCheck,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import { requireAuth } from "@/features/auth/server/require-auth";
import { ClientPageFrame } from "@/features/client/components/shell/ClientPageFrame";
import { ClientAppearanceSettings } from "@/features/client/components/settings/ClientAppearanceSettings";
import { SignOutButton } from "@/features/auth/components/SignOutButton";
export default async function SettingsPage() {
  const user = await requireAuth("/dashboard/settings");
  return (
    <ClientPageFrame
      title="Account and workspace settings"
      description="Manage your profile, membership, billing details and display preferences."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Edit account",
            description: "Update your name, contact number and profile.",
            href: "/dashboard/profile",
            icon: UserRound,
          },
          {
            title: "Membership",
            description:
              "Review your service plans, billing periods and renewal settings.",
            href: "/dashboard/settings/membership",
            icon: BadgeCheck,
          },
          {
            title: "Billing settings",
            description:
              "Manage company details and billing contact information.",
            href: "/dashboard/settings/billing",
            icon: ReceiptText,
          },
        ].map(({ title, description, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center justify-between">
              <Icon aria-hidden="true" className="size-5 text-theme-accent" />
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
            </div>
            <h2 className="mt-4 font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </Link>
        ))}
      </div>
      <ClientAppearanceSettings />
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <ShieldCheck aria-hidden="true" className="size-5" />
          Account and session
        </h2>
        <p className="mt-3 break-all text-sm">{user.email}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {user.emailVerified ? "Verified email" : "Email not verified"} ·
          Active workspace account
        </p>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Sign out when you finish on a shared device.
        </p>
        <SignOutButton />
      </section>
    </ClientPageFrame>
  );
}
