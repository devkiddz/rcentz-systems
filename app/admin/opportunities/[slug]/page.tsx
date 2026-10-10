import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FinderButton as Button } from "@/features/opportunities/components/FinderButton";
import { requireFinderOwner } from "@/server/opportunities/access";
import { opportunityRequest } from "@/server/opportunities/client";
import { validateOpportunityDetail } from "@/features/opportunities/types";
import {
  opportunityHref,
  queueQuery,
} from "@/features/opportunities/lib/navigation";
import { OpportunityDetail } from "@/features/opportunities/components/OpportunityDetail";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Opportunity brief",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireFinderOwner();
  const { slug } = await params;
  const id = slug.split("~").at(-1) || "";
  if (!slug.includes("~") || !/^[a-zA-Z0-9_-]{1,160}$/.test(id)) notFound();
  const job = validateOpportunityDetail(
    await opportunityRequest<unknown>({ operation: "detail", id }),
  );
  if (!job) notFound();
  const query = queueQuery(await searchParams);
  const canonical = opportunityHref(job);
  if (`/admin/opportunities/${slug}` !== canonical) redirect(canonical + query);
  return (
    <main className="rcentz-dashboard-frame px-4 py-6 sm:px-6 lg:px-8">
      <div className="rcentz-dashboard-inner mx-auto w-full max-w-[1200px] space-y-8">
        <Button
          variant="ghost"
          nativeButton={false}
          render={
            <Link
              href={"/admin/opportunities" + query + "#review-queue"}
              prefetch={false}
            />
          }
        >
          <ArrowLeft aria-hidden className="size-4" />
          Back to opportunities
        </Button>
        <OpportunityDetail job={job} />
      </div>
    </main>
  );
}
