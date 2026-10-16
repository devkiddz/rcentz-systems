"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { selectServiceAction } from "../../server/select-service-action";
import type {
  SelectionFeature,
  ServiceChoice,
} from "../../lib/service-selection";
import { ServiceFeaturePicker } from "./ServiceFeaturePicker";
export function ServiceConfigurator({
  slug,
  features,
  canConfigure,
  initialChoice,
}: {
  slug: string;
  features: SelectionFeature[];
  canConfigure: boolean;
  initialChoice?: ServiceChoice;
}) {
  const [choice, setChoice] = useState<ServiceChoice>(
    initialChoice || {
      serviceSlug: slug,
      featureSlugs: [],
      needsAdvice: false,
      requirements: "",
    },
  );
  const [state, action, pending] = useActionState(selectServiceAction, {
    error: "",
  });
  return (
    <section
      id="configure"
      className="scroll-mt-24 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-theme-accent">
            Your service brief
          </p>
          <h2 className="mt-2 text-xl font-semibold">
            Shape it around your business.
          </h2>
        </div>
        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
          1 · Select features
        </span>
      </div>
      <form action={action}>
        <input type="hidden" name="serviceSlug" value={slug} />
        <input type="hidden" name="choice" value={JSON.stringify(choice)} />
        <ServiceFeaturePicker
          features={features}
          choice={choice}
          onChange={setChoice}
          disabled={!canConfigure || pending}
        />
        {state.error ? (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}
        <div className="mt-5 border-t border-border pt-5">
          {canConfigure ? (
            <button
              disabled={pending}
              type="submit"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-semibold text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            >
              {pending ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-4 animate-spin"
                />
              ) : (
                <ArrowRight aria-hidden="true" className="size-4" />
              )}
              Continue to onboarding
            </button>
          ) : (
            <Link
              href={
                "/login?next=" +
                encodeURIComponent("/services/" + slug + "#configure")
              }
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-semibold text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Sign in to select features{" "}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          )}
          <p className="mt-3 text-xs leading-6 text-muted-foreground">
            Your choices start a scope discussion. No payment or delivery
            commitment is made here.
          </p>
        </div>
      </form>
    </section>
  );
}
