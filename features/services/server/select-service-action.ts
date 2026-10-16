"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireAuth } from "@/features/auth/server/require-auth";
import { defaultLocale } from "@/i18n/config";
import { getServiceBySlug } from "./get-service-by-slug";
import { getVisitorCurrency } from "./get-visitor-currency";
import {
  makeServiceSelection,
  parseServiceChoice,
  validServiceSlug,
  ServiceChoiceError,
} from "../lib/service-selection";
import { sealServiceChoice, SERVICE_CHOICE_COOKIE } from "./selection-token";
export async function selectServiceAction(
  _state: { error: string },
  form: FormData,
): Promise<{ error: string }> {
  const slug = form.get("serviceSlug");
  if (!validServiceSlug(slug)) return { error: "Choose a valid service." };
  const user = await requireAuth("/services/" + slug + "#configure");
  let choice;
  try {
    choice = parseServiceChoice(
      JSON.parse(String(form.get("choice") || "null")),
    );
    if (!choice || choice.serviceSlug !== slug)
      return { error: "Review your feature selections." };
    const service = await getServiceBySlug(
      slug,
      await getVisitorCurrency(),
      defaultLocale,
    );
    if (!service) return { error: "This service is no longer available." };
    makeServiceSelection(service, choice);
    const token = sealServiceChoice(
      choice,
      user.id,
      process.env.BETTER_AUTH_SECRET || "",
    );
    (await cookies()).set(SERVICE_CHOICE_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7200,
    });
  } catch (error) {
    return {
      error:
        error instanceof ServiceChoiceError
          ? error.message
          : "We could not prepare this service. Please try again.",
    };
  }
  redirect("/start-project?service=" + encodeURIComponent(slug));
}
