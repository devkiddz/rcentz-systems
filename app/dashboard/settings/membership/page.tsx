import Link from "next/link";
import { requireAuth } from "@/features/auth/server/require-auth";
import { getClientMemberships } from "@/features/client/server/settings/get-client-settings";
import { ClientPageFrame } from "@/features/client/components/shell/ClientPageFrame";
export default async function MembershipPage() {
  const user = await requireAuth("/dashboard/settings/membership");
  const plans = await getClientMemberships(user.id);
  return (
    <ClientPageFrame
      title="Membership and service plans"
      description="Review the service plans connected to your account."
    >
      <Link
        href="/dashboard/settings"
        className="inline-flex min-h-11 items-center text-sm underline"
      >
        ← Settings
      </Link>
      {plans.length ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {plans.map((plan) => (
            <section
              key={plan.id}
              className="rounded-2xl border border-border bg-card p-5 sm:p-6"
            >
              <div className="flex flex-wrap justify-between gap-3">
                <h2 className="text-lg font-semibold">{plan.plan.name}</h2>
                <span className="rounded-full border border-border px-3 py-1 text-xs capitalize">
                  {plan.status.toLowerCase().replaceAll("_", " ")}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {plan.subscriptionNumber}
              </p>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  [
                    "Plan amount",
                    plan.currency + " " + plan.priceAmount.toString(),
                  ],
                  [
                    "Billing interval",
                    String(plan.intervalCount) +
                      " " +
                      plan.intervalUnit.toLowerCase().replaceAll("_", " "),
                  ],
                  [
                    "Current period ends",
                    plan.currentPeriodEnd?.toLocaleDateString("en-GB", {
                      timeZone: "Africa/Lagos",
                    }) || "Not scheduled",
                  ],
                  [
                    "Next billing",
                    plan.nextBillingAt?.toLocaleDateString("en-GB", {
                      timeZone: "Africa/Lagos",
                    }) || "Not scheduled",
                  ],
                  [
                    "Renewal preference",
                    plan.cancelAtPeriodEnd
                      ? "Ends after current period"
                      : plan.autoRenew
                        ? "Automatic renewal recorded"
                        : "Manual renewal",
                  ],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-1 break-words text-sm font-medium">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <Link
                href="/dashboard/billing"
                className="mt-5 inline-flex min-h-11 items-center text-sm underline"
              >
                Review billing →
              </Link>
            </section>
          ))}
        </div>
      ) : (
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">
            No service plan is attached yet
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Your workspace remains available for projects and conversations.
            Discuss ongoing maintenance or a service plan with the Rcentz team.
          </p>
          <Link
            href="/dashboard/messages"
            className="mt-4 inline-flex min-h-11 items-center text-sm underline"
          >
            Discuss a service plan →
          </Link>
        </section>
      )}
      <p className="text-xs leading-6 text-muted-foreground">
        Plan records are shown as configured. Contact the team to change or
        cancel a plan; automatic payment collection still requires the payment
        integration.
      </p>
    </ClientPageFrame>
  );
}
