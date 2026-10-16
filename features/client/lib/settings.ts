export const accountFields = [
  { key: "name", label: "Full name", max: 120, required: true },
  { key: "phone", label: "Contact phone", max: 40 },
  { key: "bio", label: "About you", max: 1000 },
] as const;
export const billingFields = [
  { key: "companyName", label: "Company or billing name", max: 120 },
  { key: "phone", label: "Billing contact phone", max: 40 },
  { key: "website", label: "Company website (https://)", max: 500 },
  { key: "address", label: "Billing address", max: 500 },
  { key: "city", label: "City", max: 100 },
  { key: "state", label: "State or region", max: 100 },
  { key: "country", label: "Country", max: 100 },
] as const;
export function parseSettings(
  section: unknown,
  value: unknown,
): Record<string, string> | null {
  if (
    (section !== "account" && section !== "billing") ||
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  )
    return null;
  const fields = section === "account" ? accountFields : billingFields;
  const source = value as Record<string, unknown>;
  const allowed = new Set<string>(fields.map((f) => f.key));
  if (Object.keys(source).some((k) => !allowed.has(k))) return null;
  const values: Record<string, string> = {};
  for (const f of fields) {
    const v = source[f.key];
    if (
      typeof v !== "string" ||
      v.length > f.max ||
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v)
    )
      return null;
    values[f.key] = v.trim();
  }
  if (section === "account" && values.name.length < 2) return null;
  if (values.phone && !/^[+\d\s().-]{5,40}$/.test(values.phone)) return null;
  if (values.website) {
    try {
      const url = new URL(values.website);
      if (url.protocol !== "https:" || url.username || url.password)
        return null;
    } catch {
      return null;
    }
  }
  return values;
}
