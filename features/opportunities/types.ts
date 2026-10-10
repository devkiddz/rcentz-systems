import { isCareerReview } from "./lib/career-review";
import { isProjectEvidence, type ProjectEvidence } from "./lib/project-evidence";
import type { Assessment } from "./lib/matching";
export type Research = {
  risk: "HIGH" | "REVIEW" | "UNKNOWN";
  flags: { reason: string; evidence: string }[];
  contacts: {
    email: string;
    sourceUrl: string;
    observedAt: string;
    association: string;
  }[];
  pages: { url: string; status: string }[];
  coverage: string;
  publishedKnown: boolean;
  checkedAt: string;
};
export type FinderAnalytics = {
  total: number;
  quarantined: number;
  publicContacts: number;
  pipeline: { status: string; count: number }[];
  daily: { day: string; discovered: number; applied: number }[];
  sources: {
    source: string;
    runs: number;
    failures: number;
    fetched: number;
    added: number;
    duplicates: number;
    skipped: number;
    lastStatus: string;
    lastRun: string;
    message: string | null;
  }[];
  recordedApplications: number;
  recordedResponses: number;
  responseRate: number | null;
  historyCoverage: string;
  bounded: boolean;
  searchConfigured: boolean;
};
export type FinderPagination = {
  page: number;
  pageSize: 6;
  total: number;
  pages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};
export type FinderData = {
  pagination: FinderPagination;
  profile: {
    skills: string[];
    experienceYears: number;
    enabled: boolean;
    careerContext: string;
    projectEvidence?: ProjectEvidence[];
    targetRoles: string[];
    homeCountry: string;
    relocation: boolean;
    maxWeeklyHours: number | null;
    researchEnabled: boolean;
  } | null;
  jobs: {
    id: string;
    source: string;
    kind: string;
    quarantined: boolean;
    research: Research | null;
    title: string;
    company: string;
    url: string;
    description: string;
    location: string;
    salary: string | null;
    jobType: string;
    publishedAt: string;
    lastSeenAt: string;
    sourceState: string;
    score: number;
    assessment: Assessment;
    status: string;
    notes: string;
  }[];
  runs: {
    id: string;
    startedAt: string;
    status: string;
    fetched: number;
    added: number;
    message: string | null;
  }[];
  analytics: FinderAnalytics | null;
};
function object(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}
function strings(v: unknown): v is string[] {
  return (
    Array.isArray(v) && v.length <= 100 && v.every((x) => typeof x === "string")
  );
}
function number(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= 0;
}
function date(v: unknown) {
  return typeof v === "string" && Number.isFinite(Date.parse(v));
}
function url(v: unknown) {
  if (typeof v !== "string") return false;
  try {
    const u = new URL(v);
    return (
      u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      (!u.port || u.port === "443") &&
      !/^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|\[)/i.test(
        u.hostname,
      ) &&
      !u.hostname.endsWith(".local")
    );
  } catch {
    return false;
  }
}
export function validateFinderData(v: unknown): FinderData {
  if (
    !object(v) ||
    !Array.isArray(v.jobs) ||
    v.jobs.length > 6 ||
    !Array.isArray(v.runs) ||
    v.runs.length > 5
  )
    throw Error("Invalid finder response.");
  const page = v.pagination;
  if (
    !object(page) ||
    !["page", "total", "pages"].every(
      (k) => number(page[k]) && Number.isSafeInteger(page[k]),
    ) ||
    page.pageSize !== 6 ||
    !number(page.page) ||
    !number(page.total) ||
    !number(page.pages) ||
    page.page < 1 ||
    page.pages !== Math.max(1, Math.ceil(page.total / 6)) ||
    page.page > page.pages ||
    page.hasPrevious !== page.page > 1 ||
    page.hasNext !== page.page < page.pages ||
    v.jobs.length !== Math.min(6, Math.max(0, page.total - (page.page - 1) * 6))
  )
    throw Error("Invalid pagination response.");
  const p = v.profile;
  if (
    p !== null &&
    (!object(p) ||
      !strings(p.skills) ||
      (p.projectEvidence !== undefined && !isProjectEvidence(p.projectEvidence)) ||
      !strings(p.targetRoles) ||
      !number(p.experienceYears) ||
      typeof p.enabled !== "boolean" ||
      typeof p.careerContext !== "string" ||
      typeof p.homeCountry !== "string" ||
      typeof p.relocation !== "boolean" ||
      typeof p.researchEnabled !== "boolean" ||
      !(p.maxWeeklyHours === null || number(p.maxWeeklyHours)))
  )
    throw Error("Invalid profile response.");
  for (const j of v.jobs) {
    if (
      !object(j) ||
      ![
        "id",
        "source",
        "kind",
        "title",
        "company",
        "description",
        "location",
        "jobType",
        "sourceState",
        "status",
        "notes",
      ].every((k) => typeof j[k] === "string") ||
      !url(j.url) ||
      !date(j.publishedAt) ||
      !date(j.lastSeenAt) ||
      !number(j.score) ||
      j.score > 100 ||
      typeof j.quarantined !== "boolean" ||
      !(j.salary === null || typeof j.salary === "string")
    )
      throw Error("Invalid opportunity response.");
    const a = j.assessment;
    if (
      !object(a) ||
      !strings(a.matched) ||
      !strings(a.concerns) ||
      !strings(a.questions) ||
      typeof a.eligibility !== "string" ||
      typeof a.verdict !== "string" ||
      (a.careerReview !== undefined && !isCareerReview(a.careerReview)) ||
      (a.evidence !== undefined && !strings(a.evidence)) ||
      (a.unknowns !== undefined && !strings(a.unknowns)) ||
      (a.dimensions !== undefined &&
        (!Array.isArray(a.dimensions) ||
          a.dimensions.length > 20 ||
          a.dimensions.some(
            (d) =>
              !object(d) ||
              typeof d.name !== "string" ||
              typeof d.finding !== "string",
          )))
    )
      throw Error("Invalid assessment response.");
    const r = j.research;
    if (r !== null) {
      if (
        !object(r) ||
        !["HIGH", "REVIEW", "UNKNOWN"].includes(String(r.risk)) ||
        typeof r.coverage !== "string" ||
        typeof r.publishedKnown !== "boolean" ||
        !date(r.checkedAt) ||
        !Array.isArray(r.flags) ||
        r.flags.length > 20 ||
        r.flags.some(
          (f) =>
            !object(f) ||
            typeof f.reason !== "string" ||
            typeof f.evidence !== "string",
        ) ||
        !Array.isArray(r.contacts) ||
        r.contacts.length > 8 ||
        r.contacts.some(
          (c) =>
            !object(c) ||
            typeof c.email !== "string" ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email) ||
            !url(c.sourceUrl) ||
            !date(c.observedAt) ||
            c.association !== "PUBLISHED_CONTACT_UNVERIFIED",
        ) ||
        !Array.isArray(r.pages) ||
        r.pages.length > 12 ||
        r.pages.some(
          (p) => !object(p) || !url(p.url) || typeof p.status !== "string",
        )
      )
        throw Error("Invalid research evidence.");
    }
  }
  for (const r of v.runs)
    if (
      !object(r) ||
      typeof r.id !== "string" ||
      !date(r.startedAt) ||
      typeof r.status !== "string" ||
      !number(r.fetched) ||
      !number(r.added) ||
      !(r.message === null || typeof r.message === "string")
    )
      throw Error("Invalid history response.");
  const a = v.analytics;
  if (a !== null) {
    if (
      !object(a) ||
      ![
        "total",
        "quarantined",
        "publicContacts",
        "recordedApplications",
        "recordedResponses",
      ].every((k) => number(a[k])) ||
      !(
        a.responseRate === null ||
        (number(a.responseRate) && a.responseRate <= 100)
      ) ||
      typeof a.historyCoverage !== "string" ||
      typeof a.bounded !== "boolean" ||
      typeof a.searchConfigured !== "boolean" ||
      !Array.isArray(a.pipeline) ||
      a.pipeline.some(
        (p) => !object(p) || typeof p.status !== "string" || !number(p.count),
      ) ||
      !Array.isArray(a.daily) ||
      a.daily.length > 30 ||
      a.daily.some(
        (d) =>
          !object(d) ||
          !date(d.day) ||
          !number(d.discovered) ||
          !number(d.applied),
      ) ||
      !Array.isArray(a.sources) ||
      a.sources.length > 30 ||
      a.sources.some(
        (s) =>
          !object(s) ||
          typeof s.source !== "string" ||
          typeof s.lastStatus !== "string" ||
          !date(s.lastRun) ||
          !(s.message === null || typeof s.message === "string") ||
          ![
            "runs",
            "failures",
            "fetched",
            "added",
            "duplicates",
            "skipped",
          ].every((k) => number(s[k])),
      )
    )
      throw Error("Invalid analytics response.");
  }
  return v as FinderData;
}

export function validateOpportunityDetail(
  value: unknown,
): FinderData["jobs"][number] | null {
  if (!object(value) || !("job" in value))
    throw Error("Invalid opportunity detail");
  if (value.job === null) return null;
  return validateFinderData({
    profile: null,
    jobs: [value.job],
    runs: [],
    analytics: null,
    pagination: {
      page: 1,
      pageSize: 6,
      total: 1,
      pages: 1,
      hasPrevious: false,
      hasNext: false,
    },
  }).jobs[0];
}
