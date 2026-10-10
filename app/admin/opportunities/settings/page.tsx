import { opportunityRequest } from "@/server/opportunities/client";
import { validateFinderData } from "@/features/opportunities/types";
import { requireFinderOwner } from "@/server/opportunities/access";
import { FinderSettings } from "@/features/opportunities/components/FinderSettings";

export const dynamic = "force-dynamic";
export const metadata = { title: "Configure opportunity hunt", robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireFinderOwner();
  const query = await searchParams;
  const data = validateFinderData(await opportunityRequest<unknown>({ operation: "list", contractVersion: 3, page: 1, queue: "review" }));
  return <FinderSettings data={data} saved={query.saved === "1"} />;
}
