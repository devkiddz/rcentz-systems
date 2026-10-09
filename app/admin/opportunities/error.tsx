"use client";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
export default function FinderError({ reset }: { reset: () => void }) {
 return <div className="rcentz-dashboard-frame px-4 py-6 sm:px-6 lg:px-8"><Card className="mx-auto w-full max-w-[1200px] p-5"><h2 className="text-lg font-semibold">Opportunity finder is unavailable</h2><p className="text-sm text-muted-foreground">Your saved opportunities are preserved. The API connection or access configuration may need attention.</p><Button onClick={reset}>Try again</Button></Card></div>;
}
