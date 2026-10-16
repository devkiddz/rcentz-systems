"use client";
import type {
  SelectionFeature,
  ServiceChoice,
} from "../../lib/service-selection";
export function ServiceFeaturePicker({
  features,
  choice,
  onChange,
  disabled = false,
}: {
  features: SelectionFeature[];
  choice: ServiceChoice;
  onChange: (choice: ServiceChoice) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-5">
      <fieldset disabled={disabled}>
        <legend className="text-base font-semibold">
          What would you like to include?
        </legend>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Choose the capabilities your business needs. We will confirm scope,
          delivery and cost together.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {features.map((feature) => {
            const checked = choice.featureSlugs.includes(feature.slug);
            return (
              <label
                key={feature.slug}
                className={
                  "flex min-w-0 items-start gap-3 rounded-xl border p-4 transition-colors focus-within:ring-2 focus-within:ring-ring " +
                  (checked
                    ? "border-theme-accent bg-theme-accent-faint"
                    : "border-border bg-background") +
                  (disabled
                    ? " opacity-75"
                    : " cursor-pointer hover:bg-muted/30")
                }
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    onChange({
                      ...choice,
                      featureSlugs: checked
                        ? choice.featureSlugs.filter((s) => s !== feature.slug)
                        : [...choice.featureSlugs, feature.slug],
                    })
                  }
                  className="mt-1 size-4 shrink-0 accent-current"
                  disabled={!checked && choice.featureSlugs.length >= 30}
                />
                <span className="min-w-0">
                  <span className="block break-words text-sm font-semibold">
                    {feature.name}
                  </span>
                  {feature.description ? (
                    <span className="mt-2 block break-words text-xs leading-6 text-muted-foreground">
                      {feature.description}
                    </span>
                  ) : null}
                  {feature.expectedOutcome ? (
                    <span className="mt-2 block break-words text-xs leading-6 text-muted-foreground">
                      Outcome: {feature.expectedOutcome}
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
        {!features.length ? (
          <p className="mt-4 rounded-xl bg-muted/30 p-4 text-sm leading-6">
            This service is scoped individually. Describe what you need below,
            or ask us to help you decide.
          </p>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground" aria-live="polite">
            {choice.featureSlugs.length} selected · Up to 30 features
          </p>
        )}
      </fieldset>
      <fieldset disabled={disabled} className="space-y-4">
        <legend className="sr-only">
          Additional requirements and guidance
        </legend>
        <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-border p-4">
          <input
            type="checkbox"
            checked={choice.needsAdvice}
            onChange={(e) =>
              onChange({ ...choice, needsAdvice: e.target.checked })
            }
            className="mt-1 size-4 shrink-0 accent-current"
          />
          <span>
            <span className="block text-sm font-semibold">Help me decide</span>
            <span className="mt-1 block text-xs leading-6 text-muted-foreground">
              I know the business problem, but would like guidance on the right
              features.
            </span>
          </span>
        </label>
        <label className="block text-sm font-medium">
          Additional requirements{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
          <textarea
            value={choice.requirements}
            onChange={(e) =>
              onChange({ ...choice, requirements: e.target.value })
            }
            maxLength={1000}
            rows={4}
            placeholder="Tell us about anything else your business needs."
            className="mt-2 w-full rounded-xl border border-border bg-background p-3 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <span className="mt-1 block text-xs font-normal text-muted-foreground">
            {choice.requirements.length}/1,000 characters
          </span>
        </label>
      </fieldset>
    </div>
  );
}
