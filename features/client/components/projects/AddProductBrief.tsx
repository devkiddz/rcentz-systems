"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProductBrief } from "../../lib/workspace";
export function AddProductBrief({ projectId }: { projectId: string }) {
  const [brief, setBrief] = useState<ProductBrief>({
    goals: "",
    audience: "",
    features: "",
    notes: "",
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  return (
    <form
      className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        if (pending) return;
        setPending(true);
        setError("");
        try {
          const response = await fetch(
            "/api/client/projects/" + encodeURIComponent(projectId) + "/brief",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(brief),
            },
          );
          const result = await response.json();
          if (!response.ok) {
            setError(result.error || "Could not save your brief.");
            if (response.status === 409) router.refresh();
            return;
          }
          router.refresh();
        } catch {
          setError("Your answers are still here. Please try again.");
        } finally {
          setPending(false);
        }
      }}
    >
      <h2 className="text-lg font-semibold">Add product brief</h2>
      <p className="text-sm leading-6 text-muted-foreground">
        Describe what this project should achieve. The team will review your
        requirements before agreeing changes to scope or cost.
      </p>
      {(
        [
          {
            key: "goals",
            label: "Goals and expected outcome",
            min: 20,
            max: 4000,
          },
          { key: "audience", label: "Who will use it?", min: 3, max: 500 },
          {
            key: "features",
            label: "Required features and workflows",
            min: 10,
            max: 4000,
          },
          {
            key: "notes",
            label: "Additional notes (optional)",
            min: 0,
            max: 2000,
          },
        ] as const
      ).map((f) => (
        <label key={f.key} className="block text-sm font-medium">
          {f.label}
          <textarea
            value={brief[f.key]}
            onChange={(e) => setBrief({ ...brief, [f.key]: e.target.value })}
            required={f.min > 0}
            minLength={f.min}
            maxLength={f.max}
            rows={f.key === "audience" ? 2 : 4}
            disabled={pending}
            className="mt-2 w-full rounded-xl border border-border bg-background p-3 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
      ))}
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <button
        disabled={pending}
        type="submit"
        className="min-h-11 rounded-xl bg-foreground px-5 py-3 text-sm font-semibold text-background disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save product brief"}
      </button>
    </form>
  );
}
