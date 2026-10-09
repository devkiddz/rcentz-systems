import type { Assessment } from './lib/matching';
export type FinderData = {
 profile: { skills: string[]; experienceYears: number; enabled: boolean } | null;
 jobs: { id: string; title: string; company: string; url: string; description: string; location: string; salary: string | null; jobType: string; publishedAt: string; lastSeenAt: string; sourceState: string; score: number; assessment: Assessment; status: string; notes: string }[];
 runs: { id: string; startedAt: string; status: string; fetched: number; added: number; message: string | null }[];
};

function object(value: unknown): value is Record<string, unknown> { return !!value && typeof value === 'object' && !Array.isArray(value); }
function strings(value: unknown): value is string[] { return Array.isArray(value) && value.every(item => typeof item === 'string'); }
export function validateFinderData(value: unknown): FinderData {
 if (!object(value) || !Array.isArray(value.jobs) || !Array.isArray(value.runs) || value.jobs.length > 100 || value.runs.length > 5) throw new Error('Invalid finder response.');
 const p = value.profile;
 if (p !== null && (!object(p) || !strings(p.skills) || typeof p.experienceYears !== 'number' || typeof p.enabled !== 'boolean')) throw new Error('Invalid profile response.');
 for (const job of value.jobs) {
  if (!object(job) || !['id','title','company','url','description','location','jobType','publishedAt','lastSeenAt','sourceState','status','notes'].every(key => typeof job[key] === 'string') || !(job.salary === null || typeof job.salary === 'string') || typeof job.score !== 'number' || !Number.isFinite(job.score)) throw new Error('Invalid opportunity response.');
  const a=job.assessment;
  if (!object(a) || !strings(a.matched) || !strings(a.concerns) || !strings(a.questions) || typeof a.eligibility !== 'string' || typeof a.verdict !== 'string') throw new Error('Invalid assessment response.');
  const url=new URL(job.url as string);
  if (url.protocol !== 'https:' || !['remotive.com','www.remotive.com'].includes(url.hostname) || url.username || url.password || !Number.isFinite(Date.parse(job.publishedAt as string)) || !Number.isFinite(Date.parse(job.lastSeenAt as string))) throw new Error('Invalid listing source.');
 }
 for (const run of value.runs) if (!object(run) || typeof run.id !== 'string' || typeof run.startedAt !== 'string' || !Number.isFinite(Date.parse(run.startedAt)) || typeof run.status !== 'string' || typeof run.fetched !== 'number' || typeof run.added !== 'number' || !(run.message === null || typeof run.message === 'string')) throw new Error('Invalid history response.');
 return value as FinderData;
}
