"use client";
import { ClientAvatarEditor } from "./ClientAvatarEditor";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { accountFields, billingFields } from "../../lib/settings";
export function ClientDetailsForm({
  section,
  initial,
  updatedAt,
  avatar,
}: {
  section: "account" | "billing";
  initial: Record<string, string>;
  updatedAt: string | null;
  avatar?: { image: string | null; configured: boolean };
}) {
  const [values, setValues] = useState(initial);
  const [version, setVersion] = useState(updatedAt);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const fields = section === "account" ? accountFields : billingFields;
  return (
    <form
      className="rounded-2xl border border-border bg-card p-5 sm:p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        if (pending || avatarBusy) return;
        setPending(true);
        setError("");
        setSaved(false);
        try {
          const response = await fetch("/api/client/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ section, values, updatedAt: version }),
          });
          const result = await response.json();
          if (!response.ok) {
            setError(result.error || "Your details could not be saved.");
            return;
          }
          setVersion(result.updatedAt);
          setSaved(true);
          router.refresh();
        } catch {
          setError("Your answers are still here. Please try again.");
        } finally {
          setPending(false);
        }
      }}
    >
      {section === "account" && avatar ? <ClientAvatarEditor image={avatar.image} name={values.name || initial.name || "Your"} configured={avatar.configured} updatedAt={version} disabled={pending || avatarBusy} onBusyChange={setAvatarBusy} onSaved={next => { setVersion(next); router.refresh(); }} /> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((f) => (
          <label
            key={f.key}
            className={
              "block text-sm font-medium " +
              (["bio", "address"].includes(f.key) ? "sm:col-span-2" : "")
            }
          >
            {f.label}
            {f.key === "bio" || f.key === "address" ? (
              <textarea
                rows={3}
                value={values[f.key] || ""}
                maxLength={f.max}
                disabled={pending || avatarBusy}
                onChange={(e) => {
                  setValues({ ...values, [f.key]: e.target.value });
                  setSaved(false);
                }}
                className="mt-2 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            ) : (
              <input
                type={
                  f.key === "website"
                    ? "url"
                    : f.key === "phone"
                      ? "tel"
                      : "text"
                }
                autoComplete={
                  f.key === "name"
                    ? "name"
                    : f.key === "phone"
                      ? "tel"
                      : f.key === "companyName"
                        ? "organization"
                        : undefined
                }
                required={f.key === "name"}
                minLength={f.key === "name" ? 2 : undefined}
                maxLength={f.max}
                value={values[f.key] || ""}
                disabled={pending || avatarBusy}
                onChange={(e) => {
                  setValues({ ...values, [f.key]: e.target.value });
                  setSaved(false);
                }}
                className="mt-2 min-h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            )}
          </label>
        ))}
      </div>
      {error ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p role="status" className="mt-4 text-sm text-theme-accent">
          Your details have been saved.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending || avatarBusy}
        className="mt-5 min-h-11 rounded-xl bg-foreground px-5 text-sm font-semibold text-background disabled:opacity-60"
      >
        {pending
          ? "Saving…"
          : "Save " +
            (section === "account" ? "account" : "billing") +
            " details"}
      </button>
    </form>
  );
}
