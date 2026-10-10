import type { RetentionData } from "../lib/retention";
import { Badge } from "@/components/ui/badge";
import { FinderButton } from "./FinderButton";
const when=(s:string)=>new Date(s).toLocaleString("en-GB",{timeZone:"Africa/Lagos"});
export function RetentionPanel({data}:{data:RetentionData|null}) {
  return <div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2"><h3 className="font-semibold">Retention status</h3><p className="text-sm text-muted-foreground">Cleanup removes old opportunities you have never acted on. Previewing only shows what would qualify; it deletes nothing.</p></div>
      <Badge variant="outline">{data ? (data.retentionEnabled ? "Retention enabled" : "Retention off") : "Status unavailable"}</Badge>
    </div>
    {data ? <>
      <div className="grid gap-5 sm:grid-cols-3">
        {[ ["Saved records",data.total], ["Untouched records",data.untouched], ["Eligible for cleanup",data.eligible] ].map(([name,count])=><div key={name} className="space-y-2"><p className="text-xs text-muted-foreground">{name}</p><p className="text-2xl font-semibold tabular-nums">{count}</p></div>)}
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">Only NEW records with no notes or decision history, outside quarantine, and both unseen and unchanged for more than {data.limits.retentionDays} days qualify. Notes, progressed decisions, quarantined records and recently seen or changed records are excluded.</p>
      <p className="text-xs leading-5 text-muted-foreground">Untouched-record cap: {data.limits.maxUntouched}. Maximum cleanup: {data.limits.maxCleanupPerRun} per qualifying collection. Cleanup runs only after successful discovery; an all-failed batch cannot trigger cleanup.</p>
      {!data.profileExists ? <p className="text-sm">Save your hunt profile before previewing stored opportunities.</p> : null}
      {data.preview ? <div className="space-y-4 border-t border-border pt-5">
        <h3 className="text-sm font-medium">Read-only cleanup preview</h3>
        <p className="text-xs text-muted-foreground">Up to six oldest eligible records. This preview has not deleted anything.</p>
        {data.candidates.length ? <div className="space-y-4">{data.candidates.map(c=><div key={c.id} className="space-y-1 rounded-xl border border-border p-4"><p className="break-words text-sm font-medium">{c.title}</p><p className="break-words text-xs text-muted-foreground">{c.company}</p><p className="text-xs text-muted-foreground">Last seen {when(c.lastSeenAt)} · Updated {when(c.updatedAt)}</p></div>)}</div> : <p className="text-sm text-muted-foreground">No records currently qualify for cleanup.</p>}
      </div> : null}
      <p className="text-xs text-muted-foreground">Checked {when(data.checkedAt)} Lagos time. This is a snapshot; eligibility can change before a collection.</p>
    </> : <p role="status" className="text-sm text-muted-foreground">Retention status could not be loaded. Your profile remains available. Deploy the matching API release, then refresh this preview.</p>}
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
      <p className="max-w-2xl text-xs leading-5 text-muted-foreground">Enablement is controlled in the private API deployment. This page cannot enable deletion or perform manual cleanup.</p>
      <form method="get" action="/admin/opportunities/settings#storage"><input type="hidden" name="preview" value="1" /><FinderButton type="submit" variant="outline">{data?.preview ? "Refresh preview" : "Preview cleanup"}</FinderButton></form>
    </div>
  </div>;
}
