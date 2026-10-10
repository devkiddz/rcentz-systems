export type RetentionData = {
  profileExists: boolean; retentionEnabled: boolean; preview: boolean; deletionPerformed: false;
  checkedAt: string; cutoff: string;
  limits: {maxNewPerRun:number; maxStretchPerRun:number; maxUntouched:number; retentionDays:number; maxCleanupPerRun:number};
  total:number; untouched:number; eligible:number; ineligible:number;
  candidates: {id:string; title:string; company:string; lastSeenAt:string; updatedAt:string}[];
};
export function validateRetention(value: unknown): RetentionData {
  const v=value as RetentionData;
  const integer=(n: unknown)=>Number.isSafeInteger(n) && Number(n)>=0;
  const date=(d: unknown)=>typeof d==="string" && Number.isFinite(Date.parse(d));
  if(!v || typeof v!=="object" || typeof v.profileExists!=="boolean" || typeof v.retentionEnabled!=="boolean" || typeof v.preview!=="boolean" || v.deletionPerformed!==false || !date(v.checkedAt) || !date(v.cutoff) || !v.limits || !Object.values(v.limits).every(integer) || ![v.limits.maxNewPerRun,v.limits.maxStretchPerRun,v.limits.maxUntouched,v.limits.retentionDays,v.limits.maxCleanupPerRun].every(integer) || ![v.total,v.untouched,v.eligible,v.ineligible].every(integer) || v.untouched>v.total || v.eligible>v.untouched || v.ineligible!==v.total-v.eligible || !Array.isArray(v.candidates) || v.candidates.length>6 || v.candidates.length>v.eligible || (!v.preview && v.candidates.length>0) || v.candidates.some(c=>!c || typeof c.id!=="string" || c.id.length>160 || typeof c.title!=="string" || c.title.length>180 || typeof c.company!=="string" || c.company.length>100 || !date(c.lastSeenAt) || !date(c.updatedAt)) || new Set(v.candidates.map(c=>c.id)).size!==v.candidates.length) throw Error("Invalid retention response");
  return v;
}
