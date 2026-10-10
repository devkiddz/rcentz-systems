import type { FinderData } from "../types";
export function opportunityHref(
  job: Pick<FinderData["jobs"][number], "id" | "title">,
) {
  const title =
    job.title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80)
      .replace(/-$/g, "") || "opportunity";
  return `/admin/opportunities/${title}~${encodeURIComponent(job.id)}`;
}
export function queueQuery(query: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  if (query.queue === "quarantine") params.set("queue", "quarantine");
  if (["EMPLOYMENT", "CONTRACT", "PROJECT", "PROSPECT"].includes(query.kind || ""))
    params.set("kind", query.kind!);
  if (
    [
      "NEW",
      "SHORTLISTED",
      "APPLIED",
      "REPLIED",
      "INTERVIEW",
      "OFFER",
      "CONTRACT_WON",
      "REJECTED",
      "ARCHIVED",
      "CLOSED",
    ].includes(query.status || "")
  )
    params.set("status", query.status!);
  const page = Number(query.page);
  if (Number.isSafeInteger(page) && page > 1) params.set("page", String(page));
  return params.size ? `?${params}` : "";
}
