import type { FinderPagination } from "../types";
export type FinderContact = {opportunityId:string;title:string;company:string;kind:string;email:string;sourceUrl:string;observedAt:string;purpose:string};
export function validateContacts(value: unknown): {contacts:FinderContact[];pagination:FinderPagination} {
  if (!value || typeof value !== "object") throw Error("Invalid contacts response");
  const v = value as Record<string,unknown>, p = v.pagination as FinderPagination;
  if (!p || ![p.page,p.pages,p.total].every(n=>Number.isSafeInteger(n)&&n>=0) || p.pageSize !== 6 || p.page < 1 || p.pages !== Math.max(1,Math.ceil(p.total/6)) || p.page > p.pages || p.hasNext !== (p.page<p.pages) || p.hasPrevious !== (p.page>1) || !Array.isArray(v.contacts) || v.contacts.length !== Math.min(6,Math.max(0,p.total-(p.page-1)*6))) throw Error("Invalid contact pagination");
  for (const item of v.contacts) {
    if (!item || typeof item !== "object") throw Error("Invalid contact");
    const c = item as FinderContact;
    if (!/^[a-zA-Z0-9_-]{1,160}$/.test(c.opportunityId) || ![c.title,c.company,c.kind,c.purpose].every(x=>typeof x==="string"&&x.length<=300) || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(c.email) || c.email.length>254 || typeof c.observedAt !== "string" || !Number.isFinite(Date.parse(c.observedAt))) throw Error("Invalid contact fields");
    try {const u=new URL(c.sourceUrl);if(u.protocol!=="https:"||u.username||u.password||u.port||/^(localhost|127\.|10\.|192\.168\.|169\.254\.|\[)/i.test(u.hostname)||u.hostname.endsWith(".local")) throw Error();} catch {throw Error("Invalid contact source");}
  }
  return {contacts:v.contacts as FinderContact[],pagination:p};
}
