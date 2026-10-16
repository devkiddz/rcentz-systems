export type ServiceChoice = {
  serviceSlug: string;
  featureSlugs: string[];
  needsAdvice: boolean;
  requirements: string;
};
export type SelectionFeature = {
  slug: string;
  name: string;
  description: string | null;
  expectedOutcome: string | null;
};
export type ServiceSelection = {
  version: 1;
  serviceSlug: string;
  serviceName: string;
  features: SelectionFeature[];
  needsAdvice: boolean;
  requirements: string;
};
export class ServiceChoiceError extends Error {}
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const validServiceSlug = (value: unknown): value is string =>
  typeof value === "string" && value.length <= 160 && slugPattern.test(value);
export function parseServiceChoice(value: unknown): ServiceChoice | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  if (
    !validServiceSlug(v.serviceSlug) ||
    !Array.isArray(v.featureSlugs) ||
    v.featureSlugs.length > 30 ||
    !v.featureSlugs.every(validServiceSlug) ||
    new Set(v.featureSlugs).size !== v.featureSlugs.length ||
    typeof v.needsAdvice !== "boolean" ||
    typeof v.requirements !== "string" ||
    v.requirements.length > 1000
  )
    return null;
  return {
    serviceSlug: v.serviceSlug,
    featureSlugs: v.featureSlugs,
    needsAdvice: v.needsAdvice,
    requirements: v.requirements.trim(),
  };
}
export function makeServiceSelection(
  service: { slug: string; name: string; features: SelectionFeature[] },
  choice: ServiceChoice,
): ServiceSelection {
  if (
    service.slug !== choice.serviceSlug ||
    choice.featureSlugs.some(
      (slug) => !service.features.some((f) => f.slug === slug),
    )
  )
    throw new ServiceChoiceError(
      "Some features are no longer available. Return to the service and review your choices.",
    );
  if (
    !choice.featureSlugs.length &&
    !choice.needsAdvice &&
    !choice.requirements
  )
    throw new ServiceChoiceError(
      "Select a feature, describe your requirements, or ask for help deciding.",
    );
  return {
    version: 1,
    serviceSlug: service.slug,
    serviceName: service.name,
    features: service.features
      .filter((f) => choice.featureSlugs.includes(f.slug))
      .map((f) => ({
        slug: f.slug,
        name: f.name,
        description: f.description,
        expectedOutcome: f.expectedOutcome,
      })),
    needsAdvice: choice.needsAdvice,
    requirements: choice.requirements,
  };
}
export function readServiceSelection(value: unknown): ServiceSelection | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const v = value as ServiceSelection;
  if (
    v.version !== 1 ||
    !validServiceSlug(v.serviceSlug) ||
    typeof v.serviceName !== "string" ||
    v.serviceName.length > 300 ||
    !Array.isArray(v.features) ||
    v.features.length > 30 ||
    typeof v.needsAdvice !== "boolean" ||
    typeof v.requirements !== "string" ||
    v.requirements.length > 1000
  )
    return null;
  if (
    !v.features.every(
      (f) =>
        f &&
        validServiceSlug(f.slug) &&
        typeof f.name === "string" &&
        f.name.length <= 300 &&
        (f.description === null || typeof f.description === "string") &&
        (f.expectedOutcome === null || typeof f.expectedOutcome === "string"),
    )
  )
    return null;
  return v;
}

export function describeServiceSelection(selection: ServiceSelection) {
  return [
    "Requested service: " +
      selection.serviceName +
      " (" +
      selection.serviceSlug +
      ")",
    "Selected catalogue features:\n" +
      (selection.features
        .map((f) => "- " + f.name + (f.description ? ": " + f.description : ""))
        .join("\n") || "No predefined features selected."),
    "Feature guidance: " +
      (selection.needsAdvice ? "Requested" : "Not requested"),
    "Additional service requirements:\n" + (selection.requirements || "None"),
  ].join("\n\n");
}
