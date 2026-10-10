import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <div className="rcentz-dashboard-frame px-4 py-6 sm:px-6 lg:px-8">
      <Card className="rcentz-dashboard-inner mx-auto w-full max-w-[1200px] gap-3 p-5">
        <h1 className="text-xl font-semibold">Opportunity unavailable</h1>
        <p className="text-sm text-muted-foreground">
          This brief could not be found in your private opportunities.
        </p>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/admin/opportunities" />}
        >
          Back to opportunities
        </Button>
      </Card>
    </div>
  );
}
