import { opportunityRequest } from "@/server/opportunities/client";
import { validateFinderData } from "@/features/opportunities/types";
import { requireFinderOwner } from "@/server/opportunities/access";
import { FinderWorkspace } from "@/features/opportunities/components/FinderWorkspace";
import { statuses } from "@/features/opportunities/lib/matching";
export const dynamic = "force-dynamic";
export const maxDuration = 300;
export const metadata = {
  title: "Opportunity finder",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    kind?: string;
    queue?: string;
    run?: string;
    page?: string;
  }>;
}) {
  await requireFinderOwner();
  const query = await searchParams;
  const status = (statuses as readonly string[]).includes(query.status || "")
    ? query.status
    : undefined;
  const kind = ["EMPLOYMENT", "CONTRACT", "PROJECT", "PROSPECT"].includes(query.kind || "")
    ? query.kind
    : undefined;
  const queue = query.queue === "quarantine" ? "quarantine" : "review";
  const data = validateFinderData(
    await opportunityRequest<unknown>({
      operation: "list",
      contractVersion: 3,
      page: Number(query.page) || 1,
      status,
      kind,
      queue,
    }),
  );
  return <FinderWorkspace data={data} query={query} />;
}
