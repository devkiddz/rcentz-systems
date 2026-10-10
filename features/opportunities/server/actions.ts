"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { opportunityRequest } from "@/server/opportunities/client";
export async function saveProfile(form: FormData) {
  await opportunityRequest({
    operation: "profile",
    projectEvidence: Array.from({length:6},(_,i)=>({name:String(form.get(`projectName${i}`)||"").trim(),url:String(form.get(`projectUrl${i}`)||"").trim(),skills:String(form.get(`projectSkills${i}`)||"").split(",").map(s=>s.trim()).filter(Boolean),contribution:String(form.get(`projectContribution${i}`)||"").trim()})).filter(p=>p.name || p.url || p.contribution || p.skills.length),
    skills: String(form.get("skills") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    experienceYears: Number(form.get("experienceYears")),
    enabled: form.get("enabled") === "on",
    targetRoles: String(form.get("targetRoles") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    ...(form.has("careerContext")
      ? { careerContext: String(form.get("careerContext") || "") }
      : {}),
    homeCountry: String(form.get("homeCountry") || ""),
    relocation: form.get("relocation") === "on",
    researchEnabled: form.get("researchEnabled") === "on",
    maxWeeklyHours: form.get("maxWeeklyHours")
      ? Number(form.get("maxWeeklyHours"))
      : null,
  });
  revalidatePath("/admin/opportunities", "layout");
  revalidatePath("/admin/opportunities/settings");
  if (form.get("returnTo") === "settings") redirect("/admin/opportunities/settings?saved=1");
}
export async function collectNow() {
  const result = await opportunityRequest<{ status: string }>({
    operation: "collect",
  });
  revalidatePath("/admin/opportunities");
  redirect("/admin/opportunities?run=" + result.status);
}
export async function updateOpportunity(form: FormData) {
  await opportunityRequest({
    operation: "decision",
    id: String(form.get("id") || ""),
    status: String(form.get("status") || ""),
    notes: String(form.get("notes") || ""),
  });
  revalidatePath("/admin/opportunities", "layout");
}
