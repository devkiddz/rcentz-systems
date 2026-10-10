import { validateRetention } from "@/features/opportunities/lib/retention";
import { opportunityRequest } from "@/server/opportunities/client";
import { validateFinderData } from "@/features/opportunities/types";
import { requireFinderOwner } from "@/server/opportunities/access";
import { FinderSettings } from "@/features/opportunities/components/FinderSettings";

export const dynamic = "force-dynamic";
export const metadata = { title: "Configure opportunity hunt", robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ saved?: string; preview?: string }> }) {
  await requireFinderOwner();
  const query = await searchParams;
  const [data, retention] = await Promise.all([
    opportunityRequest<unknown>({ operation: "list", contractVersion: 3, page: 1, queue: "review" }).then(validateFinderData),
    opportunityRequest<unknown>({ operation: "retention", preview: query.preview === "1" }).then(validateRetention).catch(() => null),
  ]);
  return <FinderSettings data={data} saved={query.saved === "1"} retention={retention} />;
}
