import Link from "next/link";
import { requireAuth } from "@/features/auth/server/require-auth";
import { getClientSettings } from "@/features/client/server/settings/get-client-settings";
import { billingFields } from "@/features/client/lib/settings";
import { ClientDetailsForm } from "@/features/client/components/settings/ClientDetailsForm";
import { ClientPageFrame } from "@/features/client/components/shell/ClientPageFrame";
export default async function BillingSettingsPage() {
  const user = await requireAuth("/dashboard/settings/billing");
  const profile = await getClientSettings(user.id);
  return (
    <ClientPageFrame
      title="Billing settings"
      description="Manage the business and address details your billing team should use."
    >
      <div className="flex flex-wrap gap-5">
        <Link
          href="/dashboard/settings"
          className="inline-flex min-h-11 items-center text-sm underline"
        >
          ← Settings
        </Link>
        <Link
          href="/dashboard/billing"
          className="inline-flex min-h-11 items-center text-sm underline"
        >
          Invoices and payments →
        </Link>
      </div>
      <section className="rounded-2xl border border-border bg-card p-5">
        <p className="text-xs text-muted-foreground">Account email</p>
        <p className="mt-2 break-all text-sm font-semibold">{user.email}</p>
        <p className="mt-3 text-xs leading-6 text-muted-foreground">
          These details are saved to your client profile for billing
          preparation. Contact the team to correct an already issued invoice.
        </p>
      </section>
      <ClientDetailsForm
        section="billing"
        initial={Object.fromEntries(
          billingFields.map((f) => [f.key, profile?.[f.key] || ""]),
        )}
        updatedAt={profile?.updatedAt.toISOString() || null}
      />
    </ClientPageFrame>
  );
}
