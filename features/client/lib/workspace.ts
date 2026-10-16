export type ProductBrief = {
  goals: string;
  audience: string;
  features: string;
  notes: string;
};
export function parseProductBrief(input: unknown): ProductBrief | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const v = input as Record<string, unknown>;
  if (
    Object.keys(v).some(
      (k) => !["goals", "audience", "features", "notes"].includes(k),
    )
  )
    return null;
  for (const [key, min, max] of [
    ["goals", 20, 4000],
    ["audience", 3, 500],
    ["features", 10, 4000],
    ["notes", 0, 2000],
  ] as const)
    if (
      typeof v[key] !== "string" ||
      v[key].trim().length < min ||
      v[key].length > max
    )
      return null;
  return {
    goals: (v.goals as string).trim(),
    audience: (v.audience as string).trim(),
    features: (v.features as string).trim(),
    notes: (v.notes as string).trim(),
  };
}
export const PRODUCT_BRIEF_KIND = "CLIENT_PRODUCT_BRIEF_V1";
export function hasProjectBrief(project: {
  description?: string | null;
  purpose?: string | null;
  vision?: string | null;
  expectedOutcome?: string | null;
  serviceRequest?: { id: string } | null;
  activities?: unknown[];
}) {
  return Boolean(
    project.serviceRequest ||
      project.description?.trim() ||
      project.purpose?.trim() ||
      project.vision?.trim() ||
      project.expectedOutcome?.trim() ||
      project.activities?.length,
  );
}
export function safeProjectImage(url: string | null | undefined) {
  if (!url) return null;
  if (url.startsWith("/") && !url.startsWith("//") && !url.includes("\\"))
    return url;
  try {
    const u = new URL(url);
    return u.protocol === "https:" &&
      u.hostname === "res.cloudinary.com" &&
      !u.username &&
      !u.password
      ? u.href
      : null;
  } catch {
    return null;
  }
}
export function projectInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0] || "")
      .join("")
      .toUpperCase() || "P"
  );
}
export function isProjectLogo(value: {
  fileName?: string | null;
  alt?: string | null;
  caption?: string | null;
}) {
  return [value.fileName, value.alt, value.caption].some(
    (s) => s && /(^|[^a-z])(?:logo|logomark|brand-mark)(?:[^a-z]|$)/i.test(s),
  );
}
