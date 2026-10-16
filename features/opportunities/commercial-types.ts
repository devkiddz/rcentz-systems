export const clientStates=['NEW','REVIEW','QUALIFIED','PURSUING','WON','LOST','ARCHIVED'] as const;
export const clientStateLabels:Record<string,string>={NEW:'New',REVIEW:'Reviewing',QUALIFIED:'Qualified',PURSUING:'In discussion',WON:'Won',LOST:'Lost',ARCHIVED:'Archived'};
export type Prospect={id:string;businessName:string;summary:string;source:string;state:string;notes:string;country:string|null;budgetSignal:string|null;evidenceLinks:string[];fitScore:number|null;updatedAt:string;qualification:Record<string,unknown>;matches:{capabilityId:string;score:number|null;rationale:string}[]};
export type DiscoveryRun={id:string;startedAt:string;status?:string;added?:number;existing?:number;message?:string;sources?:{key:string;label:string;query:string;status:string;fetched:number;new:number;existing:number;skipped:number;pagesFetched?:number;requests?:number}[]};
export type CommercialOverview={total:number;page:number;pageSize:number;prospects:Prospect[];settings:{discoveryEnabled:boolean}|null;discovery:{searchConfigured:boolean;runs:DiscoveryRun[];schedule:string;cooldownHours:number;maxNewPerRun:number}};
const record=(v:unknown):v is Record<string,unknown>=>typeof v==='object'&&v!==null&&!Array.isArray(v);
const text=(v:unknown,max:number):v is string=>typeof v==='string'&&v.length<=max;
const count=(v:unknown)=>typeof v==='number'&&Number.isInteger(v)&&v>=0;
export function publicEvidenceUrl(v:unknown):v is string{
 if(!text(v,2048))return false;
 try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&!u.hostname.startsWith('[')&&!/^\d+(\.\d+){3}$/.test(u.hostname)&&u.hostname.includes('.')&&!/\.(?:local|internal|localhost)$/.test(u.hostname);}catch{return false;}
}
export function validateProspect(v:unknown):Prospect{
 if(!record(v)||!text(v.id,160)||!/^[A-Za-z0-9_-]+$/.test(v.id)||!text(v.businessName,180)||!text(v.summary,8000)||!text(v.source,100)||!text(v.notes,6000)||typeof v.state!=='string'||!(clientStates as readonly string[]).includes(v.state)||typeof v.updatedAt!=='string'||!Number.isFinite(Date.parse(v.updatedAt))||!record(v.qualification)||!Array.isArray(v.evidenceLinks)||v.evidenceLinks.length>10||!v.evidenceLinks.every(publicEvidenceUrl)||!Array.isArray(v.matches)||v.matches.length>20||!v.matches.every(m=>record(m)&&text(m.capabilityId,160)&&text(m.rationale,3000)&&(m.score===null||(count(m.score)&&Number(m.score)<=100)))||(v.fitScore!==null&&(!count(v.fitScore)||Number(v.fitScore)>100))||(v.country!==null&&!text(v.country,100))||(v.budgetSignal!==null&&!text(v.budgetSignal,300)))throw Error('Invalid commercial lead response.');
 return v as Prospect;
}
export function validateCommercialOverview(v:unknown):CommercialOverview{
 if(!record(v)||!count(v.total)||!count(v.page)||Number(v.page)<1||v.pageSize!==30||!Array.isArray(v.prospects)||v.prospects.length>30||v.prospects.length>Number(v.total)||Number(v.page)>Math.max(1,Math.ceil(Number(v.total)/30))||!record(v.discovery)||typeof v.discovery.searchConfigured!=='boolean'||!text(v.discovery.schedule,200)||v.discovery.cooldownHours!==20||v.discovery.maxNewPerRun!==25||!Array.isArray(v.discovery.runs)||v.discovery.runs.length>10||(v.settings!==null&&(!record(v.settings)||typeof v.settings.discoveryEnabled!=='boolean')))throw Error('Invalid acquisition overview.');
 v.prospects.forEach(validateProspect);
 for(const run of v.discovery.runs){if(!record(run)||!text(run.id,160)||typeof run.startedAt!=='string'||!Number.isFinite(Date.parse(run.startedAt))||(run.message!==undefined&&!text(run.message,1000))||(run.status!==undefined&&!['RUNNING','SUCCESS','PARTIAL','FAILED'].includes(String(run.status)))||(run.sources!==undefined&&(!Array.isArray(run.sources)||run.sources.length>8||!run.sources.every(s=>record(s)&&text(s.key,120)&&text(s.label,200)&&text(s.query,600)&&['SUCCESS','PARTIAL','FAILED'].includes(String(s.status))&&['fetched','new','existing','skipped'].every(k=>count(s[k]))&&['pagesFetched','requests'].every(k=>s[k]===undefined||(count(s[k])&&Number(s[k])<=3))))))throw Error('Invalid commercial source history.');}
 return v as CommercialOverview;
}
export type LeadDetail={prospect:Prospect;history:{id:string;createdAt:string;metadata:Record<string,unknown>|null}[]};
export function validateLeadDetail(v:unknown):LeadDetail{
 if(!record(v)||!Array.isArray(v.history)||v.history.length>50||!v.history.every(h=>record(h)&&text(h.id,160)&&typeof h.createdAt==='string'&&Number.isFinite(Date.parse(h.createdAt))&&(h.metadata===null||record(h.metadata))))throw Error('Invalid lead history.');
 validateProspect(v.prospect);return v as LeadDetail;
}
