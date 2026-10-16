import fs from "node:fs";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import ts from "typescript";
function load(file, stubs = {}) {
  const output = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  const m = { exports: {} };
  new Function("require", "module", "exports", output)(
    (name) => {
      if (!(name in stubs)) throw Error("Unmocked: " + name);
      return stubs[name];
    },
    m,
    m.exports,
  );
  return m.exports;
}
const policy = load("features/services/lib/service-selection.ts");
const briefLib = load("features/onboarding/lib/project-brief.ts", {
  "@/features/services/lib/service-selection": policy,
});
const briefData = load("features/onboarding/server/brief-data.ts", {
  "server-only": {},
  "../lib/project-brief": briefLib,
  "@/features/services/lib/service-selection": policy,
});
const tokenLib = load("features/services/server/selection-token.ts", {
  "node:crypto": crypto,
  "../lib/service-selection": policy,
});
const feature = {
  slug: "customer-accounts",
  name: "Customer accounts",
  description: "Private customer accounts and sign-in.",
  expectedOutcome: "Customers can access their own workspace.",
};
const service = {
  id: "service-one",
  slug: "custom-web-application-development",
  name: "Custom web application",
  type: "WEB_APP",
  status: "ACTIVE",
  publishedAt: new Date("2026-01-01"),
  features: [feature, { ...feature, slug: "reports", name: "Reports" }],
};
const choice = {
  serviceSlug: service.slug,
  featureSlugs: [feature.slug],
  needsAdvice: false,
  requirements: "Please discuss account access with us.",
};
const snapshot = policy.makeServiceSelection(service, choice);
assert.equal(
  policy.parseServiceChoice({ ...choice, featureSlugs: ["../admin"] }),
  null,
);
assert.equal(
  policy.parseServiceChoice({
    ...choice,
    featureSlugs: [feature.slug, feature.slug],
  }),
  null,
);
assert.equal(
  policy.parseServiceChoice({ ...choice, requirements: "x".repeat(1001) }),
  null,
);
assert.throws(() =>
  policy.makeServiceSelection(service, {
    ...choice,
    featureSlugs: ["foreign-service-feature"],
  }),
);
assert.throws(() =>
  policy.makeServiceSelection(service, {
    ...choice,
    featureSlugs: [],
    requirements: "",
  }),
);
assert.equal(
  policy.makeServiceSelection(
    { ...service, features: [] },
    { ...choice, featureSlugs: [], needsAdvice: true },
  ).needsAdvice,
  true,
);
const secret = "test-only-service-choice-secret-0123456789";
const sealed = tokenLib.sealServiceChoice(
  choice,
  "customer-one",
  secret,
  100000,
);
assert.deepEqual(
  tokenLib.openServiceChoice(sealed, "customer-one", secret, 100001),
  choice,
);
assert.equal(
  tokenLib.openServiceChoice(sealed, "customer-two", secret, 100001),
  null,
);
assert.equal(
  tokenLib.openServiceChoice(sealed + "x", "customer-one", secret, 100001),
  null,
);
assert.equal(
  tokenLib.openServiceChoice(sealed, "customer-one", secret, 100000 + 7200001),
  null,
);
assert.throws(() => tokenLib.sealServiceChoice(choice, "customer-one", "weak"));
const baseBrief = {
  ...briefLib.emptyBrief,
  build: "application",
  company: "Sample Business",
  title: "Customer portal",
  goals: "Give customers a private place to track their requests.",
  audience: "Our customers",
  features: "Customer accounts and request tracking",
  serviceChoice: choice,
};
assert.deepEqual(briefLib.validateBrief(baseBrief).errors, {});
assert.ok(
  briefLib.validateBrief({ ...baseBrief, serviceChoice: {} }).errors
    .serviceChoice,
);
let metadata,
  creates = 0,
  updated,
  existing = null;
const tx = {
  $executeRaw: async () => {},
  serviceRequest: {
    findFirst: async (query) => {
      assert.equal(query.where.userId, "customer-one");
      return existing;
    },
    create: async ({ data }) => {
      creates++;
      assert.equal(data.serviceId, service.id);
      assert.ok(data.description.includes(feature.name));
      assert.ok(data.description.includes(choice.requirements));
      return { id: "request-one", serviceId: service.id };
    },
    update: async ({ data }) => {
      updated = data;
      return { updatedAt: new Date("2026-10-16T12:00:01Z") };
    },
  },
  serviceOnboardingQuestion: {
    upsert: async () => ({
      id: "brief-question",
      label: "Project brief workspace",
      type: "LONG_TEXT",
    }),
  },
  serviceRequestAnswer: {
    deleteMany: async () => {},
    upsert: async ({ create }) => {
      metadata = create.metadata;
    },
  },
  service: {
    findFirst: async () => ({
      ...service,
      name: "Renamed catalogue service",
      features: [{ ...feature, name: "Renamed feature" }, service.features[1]],
    }),
  },
};
const prisma = {
  service: {
    findFirst: async (query) => {
      assert.equal(query.where.slug, service.slug);
      assert.equal(query.where.status, "ACTIVE");
      assert.ok(query.where.publishedAt.not === null);
      return service;
    },
  },
  $transaction: async (fn) => fn(tx),
};
const create = load("features/onboarding/server/create-project-brief.ts", {
  "server-only": {},
  "./brief-data": briefData,
  "../lib/project-brief": briefLib,
  "@/lib/prisma": { prisma },
  "@/features/services/lib/service-selection": policy,
});
assert.deepEqual(await create.createProjectBrief("customer-one", baseBrief), {
  id: "request-one",
});
assert.deepEqual(metadata.serviceSelection, snapshot);
assert.equal(creates, 1);
const savedMetadata = structuredClone(metadata);
savedMetadata.attachments = [
  {
    id: "file-one",
    name: "Brief.pdf",
    pathname: "private/brief.pdf",
    type: "application/pdf",
    size: 100,
  },
];
existing = { id: "request-one" };
await create.createProjectBrief("customer-one", baseBrief);
assert.equal(creates, 1);
assert.equal(
  await create.createProjectBrief("customer-one", {
    ...baseBrief,
    serviceChoice: { ...choice, featureSlugs: ["foreign"] },
  }),
  null,
);
assert.equal(creates, 1);
assert.equal(
  briefData.readBriefData({ ...savedMetadata, serviceSelection: undefined })
    .serviceSelection,
  undefined,
);
assert.deepEqual(
  briefData.readBriefData(savedMetadata).serviceSelection,
  snapshot,
);
const origin = "https://systems.rcentz.cc";
process.env.BETTER_AUTH_URL = origin;
process.env.BETTER_AUTH_SECRET = secret;
let actor = { id: "customer-one", status: "ACTIVE", name: "Sample customer" };
const patch = load("app/api/project-briefs/[requestId]/route.ts", {
  "@/features/auth/server/get-current-user": {
    getCurrentUser: async () => actor,
  },
  "@/features/onboarding/lib/project-brief": briefLib,
  "@/features/onboarding/server/brief-data": briefData,
  "@/features/services/lib/service-selection": policy,
  "@/lib/prisma": { prisma },
});
const saved = {
  id: "request-one",
  serviceId: service.id,
  status: "PENDING",
  project: null,
  updatedAt: new Date("2026-10-16T12:00:00Z"),
  answers: [{ metadata: savedMetadata }],
};
existing = saved;
const args = { params: Promise.resolve({ requestId: "request-one" }) };
const request = (input, requestOrigin = origin) =>
  new Request(origin + "/api/project-briefs/request-one", {
    method: "PATCH",
    headers: { origin: requestOrigin, "content-type": "application/json" },
    body: JSON.stringify({
      ...input,
      updatedAt: saved.updatedAt.toISOString(),
    }),
  });
assert.equal((await patch.PATCH(request(baseBrief), args)).status, 200);
assert.equal(metadata.serviceSelection.serviceName, service.name);
assert.equal(metadata.serviceSelection.features[0].name, feature.name);
assert.deepEqual(metadata.attachments, savedMetadata.attachments);
assert.ok(updated.description.includes("Selected catalogue features"));
assert.equal(updated.serviceId, service.id);
assert.equal(
  (
    await patch.PATCH(
      request({
        ...baseBrief,
        serviceChoice: { ...choice, serviceSlug: "different-service" },
      }),
      args,
    )
  ).status,
  409,
);
assert.equal(
  (await patch.PATCH(request(baseBrief, "https://attacker.example"), args))
    .status,
  403,
);
existing = null;
assert.equal((await patch.PATCH(request(baseBrief), args)).status, 404);
existing = { ...saved, status: "REVIEWING" };
assert.equal((await patch.PATCH(request(baseBrief), args)).status, 409);
existing = { ...saved, updatedAt: new Date("2026-10-16T12:01:00Z") };
assert.equal((await patch.PATCH(request(baseBrief), args)).status, 412);
actor = { ...actor, status: "SUSPENDED" };
assert.equal((await patch.PATCH(request(baseBrief), args)).status, 401);
let reads = 0,
  cookie,
  signedIn = false,
  destination;
const redirect = (path) => {
  const error = new Error("REDIRECT:" + path);
  error.destination = path;
  throw error;
};
const auth = {
  requireAuth: async (next) => {
    destination = next;
    if (!signedIn) redirect("/login?next=" + encodeURIComponent(next));
    return { id: "customer-one", name: "Sample customer" };
  },
};
const api = {
  getServiceBySlug: async () => {
    reads++;
    return service;
  },
};
const cookies = {
  cookies: async () => ({
    set: (name, value, options) => {
      assert.equal(options.httpOnly, true);
      cookie = value;
    },
    get: () => (cookie ? { value: cookie } : undefined),
  }),
};
const action = load("features/services/server/select-service-action.ts", {
  "next/headers": cookies,
  "next/navigation": { redirect },
  "@/features/auth/server/require-auth": auth,
  "@/i18n/config": { defaultLocale: "en" },
  "./get-service-by-slug": api,
  "./get-visitor-currency": { getVisitorCurrency: async () => "NGN" },
  "../lib/service-selection": policy,
  "./selection-token": tokenLib,
});
const form = new FormData();
form.set("serviceSlug", service.slug);
form.set("choice", JSON.stringify(choice));
await assert.rejects(
  action.selectServiceAction({ error: "" }, form),
  /REDIRECT:\/login/,
);
assert.equal(reads, 0);
assert.equal(cookie, undefined);
signedIn = true;
await assert.rejects(
  action.selectServiceAction({ error: "" }, form),
  /REDIRECT:\/start-project/,
);
assert.equal(reads, 1);
assert.ok(cookie);
form.set("choice", JSON.stringify({ ...choice, featureSlugs: ["foreign"] }));
assert.ok((await action.selectServiceAction({ error: "" }, form)).error);
const jsx = {
  "react/jsx-runtime": {
    jsx: (type, props) => ({ type, props }),
    jsxs: (type, props) => ({ type, props }),
  },
};
const page = load("app/(account)/start-project/page.tsx", {
  ...jsx,
  "next/navigation": { redirect },
  "next/headers": cookies,
  "@/features/auth/server/require-auth": auth,
  "@/features/services/server/get-service-by-slug": api,
  "@/features/services/server/get-visitor-currency": {
    getVisitorCurrency: async () => "NGN",
  },
  "@/features/services/server/selection-token": tokenLib,
  "@/features/services/lib/service-selection": policy,
  "@/i18n/config": { defaultLocale: "en" },
  "@/features/onboarding/lib/project-brief": briefLib,
  "@/features/onboarding/server/brief-data": { uploadsConfigured: () => false },
  "@/features/onboarding/components/ProjectBriefWizard": {
    ProjectBriefWizard: "Wizard",
  },
});
const rendered = await page.default({
  searchParams: Promise.resolve({ service: service.slug }),
});
assert.deepEqual(rendered.props.initialBrief.serviceChoice, choice);
assert.ok(rendered.props.initialBrief.features.includes(feature.name));
assert.equal(rendered.props.initialBrief.build, "application");
await assert.rejects(
  page.default({ searchParams: Promise.resolve({}) }),
  /REDIRECT:\/services\?choose=1/,
);
cookie = undefined;
await assert.rejects(
  page.default({ searchParams: Promise.resolve({ service: service.slug }) }),
  /REDIRECT:\/services\/custom-web-application-development#configure/,
);
signedIn = false;
reads = 0;
await assert.rejects(
  page.default({ searchParams: Promise.resolve({ service: service.slug }) }),
  /REDIRECT:\/login/,
);
assert.equal(reads, 0);
assert.ok(destination.includes(service.slug));
console.log(
  "PASS: authenticated selection before API access; owner-bound, signed, expiring handoff; selected-service onboarding; canonical feature membership; guidance/custom scope; persisted snapshots and idempotent creation; edit preservation across catalogue renames; owner/status/origin/concurrency gates; legacy brief compatibility. Controlled fixtures only; no network or database writes.",
);

const postRoute = load("app/api/project-briefs/route.ts", {
  "@/features/auth/server/get-current-user": {
    getCurrentUser: async () => actor,
  },
  "@/features/onboarding/lib/project-brief": briefLib,
  "@/features/onboarding/server/create-project-brief": create,
});
const postRequest = (input, from = origin) =>
  new Request(origin + "/api/project-briefs", {
    method: "POST",
    headers: { origin: from, "content-type": "application/json" },
    body: JSON.stringify(input),
  });
assert.equal((await postRoute.POST(postRequest(baseBrief))).status, 403);
actor = { id: "customer-one", status: "ACTIVE" };
existing = null;
assert.equal(
  (await postRoute.POST(postRequest(baseBrief, "https://attacker.example")))
    .status,
  403,
);
assert.equal(
  (
    await postRoute.POST(
      postRequest({
        ...baseBrief,
        serviceChoice: { ...choice, featureSlugs: ["foreign"] },
      }),
    )
  ).status,
  409,
);
assert.equal((await postRoute.POST(postRequest(baseBrief))).status, 201);
assert.deepEqual(metadata.serviceSelection, snapshot);
console.log(
  "PASS: actual submission route rejects inactive accounts, cross-origin requests and foreign features; accepted requests persist the canonical service selection.",
);
