import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServiceBySlug } from "@/features/services/server/get-service-by-slug";
import { getVisitorCurrency } from "@/features/services/server/get-visitor-currency";
import {
  openServiceChoice,
  SERVICE_CHOICE_COOKIE,
} from "@/features/services/server/selection-token";
import {
  makeServiceSelection,
  validServiceSlug,
} from "@/features/services/lib/service-selection";
import { defaultLocale } from "@/i18n/config";
import { emptyBrief } from "@/features/onboarding/lib/project-brief";
import { requireAuth } from "@/features/auth/server/require-auth";
import { uploadsConfigured } from "@/features/onboarding/server/brief-data";
import { ProjectBriefWizard } from "@/features/onboarding/components/ProjectBriefWizard";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Start a project",
  robots: { index: false, follow: false },
};
export default async function StartProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string | string[] }>;
}) {
  const query = await searchParams;
  const slug = validServiceSlug(query.service) ? query.service : null;
  const user = await requireAuth(
    slug ? "/start-project?service=" + slug : "/start-project",
  );
  if (!slug) redirect("/services?choose=1");
  const choice = openServiceChoice(
    (await cookies()).get(SERVICE_CHOICE_COOKIE)?.value,
    user.id,
    process.env.BETTER_AUTH_SECRET || "",
  );
  if (!choice || choice.serviceSlug !== slug)
    redirect("/services/" + slug + "#configure");
  const service = await getServiceBySlug(
    slug,
    await getVisitorCurrency(),
    defaultLocale,
  );
  if (!service) redirect("/services?choose=1");
  try {
    makeServiceSelection(service, choice);
  } catch {
    redirect("/services/" + slug + "#configure");
  }
  const build =
    service.type === "WEBSITE"
      ? "website"
      : service.type === "ECOMMERCE"
        ? "commerce"
        : service.type === "MOBILE_APP"
          ? "mobile"
          : ["WEB_APP", "SAAS", "API", "DESKTOP_APP"].includes(service.type)
            ? "application"
            : "guidance";
  const initialBrief = {
    ...emptyBrief,
    build,
    title: service.name,
    features:
      service.features
        .filter((f) => choice.featureSlugs.includes(f.slug))
        .map((f) => f.name)
        .join("\n") ||
      choice.requirements ||
      "Please help me decide on the right features.",
    serviceChoice: choice,
  };
  return (
    <ProjectBriefWizard
      name={user.name}
      initialBrief={initialBrief}
      serviceOptions={{
        slug: service.slug,
        name: service.name,
        features: service.features.map(
          ({ slug, name, description, expectedOutcome }) => ({
            slug,
            name,
            description,
            expectedOutcome,
          }),
        ),
      }}
      uploadsEnabled={uploadsConfigured()}
    />
  );
}
