import fs from "node:fs";
import assert from "node:assert/strict";
import ts from "typescript";
function load(file, stubs = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  const m = { exports: {} };
  new Function("require", "module", "exports", code)(
    (name) => {
      if (!(name in stubs)) throw Error("Unmocked " + name);
      return stubs[name];
    },
    m,
    m.exports,
  );
  return m.exports;
}
const workspace = load("features/client/lib/workspace.ts");
const settings = load("features/client/lib/settings.ts");
assert.equal(workspace.hasProjectBrief({ description: "   " }), false);
assert.equal(
  workspace.hasProjectBrief({ description: "Original brief" }),
  true,
);
assert.equal(
  workspace.hasProjectBrief({ activities: [{ id: "brief" }] }),
  true,
);
assert.equal(workspace.safeProjectImage("javascript:alert(1)"), null);
assert.equal(
  workspace.safeProjectImage("https://attacker.example/logo.png"),
  null,
);
assert.ok(
  workspace.safeProjectImage(
    "https://res.cloudinary.com/rcentz/image/upload/logo.png",
  ),
);
assert.equal(workspace.isProjectLogo({ caption: "Project logo" }), true);
assert.equal(workspace.isProjectLogo({ caption: "blogosphere" }), false);
assert.equal(workspace.projectInitials("Rcentz Systems"), "RS");
const productBrief = {
  goals: "Provide a clear project workspace for our customers.",
  audience: "Our customers",
  features: "Project tracking and customer account access.",
  notes: "Please review our requirements.",
};
assert.ok(workspace.parseProductBrief(productBrief));
assert.equal(
  workspace.parseProductBrief({ ...productBrief, ownerId: "foreign" }),
  null,
);
assert.equal(
  settings.parseSettings("account", {
    name: "Client",
    phone: "",
    bio: "",
    role: "ADMIN",
  }),
  null,
);
assert.equal(
  settings.parseSettings("account", {
    name: "Client",
    phone: "",
    bio: "",
    email: "other@example.com",
  }),
  null,
);
assert.equal(
  settings.parseSettings("billing", {
    companyName: "X",
    phone: "",
    website: "javascript:alert(1)",
    address: "",
    city: "",
    state: "",
    country: "",
  }),
  null,
);
let actor = { id: "customer-one", status: "ACTIVE" };
let queries = 0;
let project = {
  id: "project-one",
  description: null,
  purpose: null,
  vision: null,
  expectedOutcome: null,
  serviceRequest: null,
  activities: [],
};
let activity;
let audit = 0;
let currentVersion = new Date("2026-10-16T14:00:00Z");
let profile = null;
let userUpdate;
const mutation = load("features/client/server/client-mutation.ts", {
  "server-only": {},
  "@/features/auth/server/get-current-user": {
    getCurrentUser: async () => actor,
  },
});
const tx = {
  $executeRaw: async () => {},
  project: {
    findFirst: async ({ where }) => {
      queries++;
      assert.equal(where.clientId, "customer-one");
      return project;
    },
  },
  projectActivity: {
    create: async ({ data }) => {
      activity = data;
      project = { ...project, activities: [{ id: "brief-one" }] };
    },
  },
  user: {
    findFirst: async ({ where }) => {
      assert.equal(where.id, "customer-one");
      return actor?.status === "ACTIVE" ? { id: actor.id } : null;
    },
    updateMany: async ({ where, data }) => {
      assert.equal(where.id, "customer-one");
      assert.equal(where.status, "ACTIVE");
      assert.ok(!("email" in data));
      assert.ok(!("role" in data));
      if (where.updatedAt.toISOString() !== currentVersion.toISOString())
        return { count: 0 };
      userUpdate = data;
      currentVersion = data.updatedAt;
      return { count: 1 };
    },
  },
  auditLog: {
    create: async () => {
      audit++;
    },
  },
  clientProfile: {
    findUnique: async ({ where }) => {
      assert.equal(where.userId, "customer-one");
      return profile;
    },
    create: async ({ data }) => {
      assert.equal(data.userId, "customer-one");
      profile = { id: "profile-one", ...data, updatedAt: new Date() };
      return profile;
    },
    updateMany: async ({ where, data }) => {
      assert.equal(where.userId, "customer-one");
      profile = { ...profile, ...data };
      return { count: 1 };
    },
  },
};
const prisma = { $transaction: async (fn) => fn(tx) };
const origin = "https://systems.rcentz.cc";
process.env.BETTER_AUTH_URL = origin;
const req = (body, from = origin) =>
  new Request(origin + "/api/client/settings", {
    method: "POST",
    headers: { origin: from, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
const briefRoute = load("app/api/client/projects/[projectId]/brief/route.ts", {
  "@/lib/prisma": { prisma },
  "@/features/client/server/client-mutation": mutation,
  "@/features/client/lib/workspace": workspace,
});
const args = { params: Promise.resolve({ projectId: "project-one" }) };
actor = null;
assert.equal((await briefRoute.POST(req(productBrief), args)).status, 401);
assert.equal(queries, 0);
actor = { id: "customer-one", status: "SUSPENDED" };
assert.equal((await briefRoute.POST(req(productBrief), args)).status, 401);
assert.equal(queries, 0);
actor = { id: "customer-one", status: "ACTIVE" };
assert.equal(
  (await briefRoute.POST(req(productBrief, "https://attacker.example"), args))
    .status,
  403,
);
assert.equal(queries, 0);
project = null;
assert.equal((await briefRoute.POST(req(productBrief), args)).status, 404);
project = {
  id: "project-one",
  description: null,
  purpose: null,
  vision: null,
  expectedOutcome: null,
  serviceRequest: null,
  activities: [],
};
assert.equal((await briefRoute.POST(req(productBrief), args)).status, 201);
assert.equal(activity.projectId, "project-one");
assert.equal(activity.userId, "customer-one");
assert.equal(activity.visibility, "CLIENT");
assert.equal(activity.metadata.kind, workspace.PRODUCT_BRIEF_KIND);
assert.ok(activity.description.includes(productBrief.features));
assert.equal((await briefRoute.POST(req(productBrief), args)).status, 409);
project = {
  ...project,
  description: "Existing agreed context",
  activities: [],
};
assert.equal((await briefRoute.POST(req(productBrief), args)).status, 409);
project = {
  ...project,
  description: null,
  serviceRequest: { id: "original-onboarding" },
};
assert.equal((await briefRoute.POST(req(productBrief), args)).status, 409);
const route = load("app/api/client/settings/route.ts", {
  "@/lib/prisma": { prisma },
  "@/features/client/server/client-mutation": mutation,
  "@/features/client/lib/settings": settings,
});
const account = {
  section: "account",
  values: {
    name: "Updated customer",
    phone: "+234 800 000 0000",
    bio: "Sample profile",
  },
  updatedAt: currentVersion.toISOString(),
  userId: "ignored-foreign",
};
assert.equal(
  (
    await route.POST(
      req({ ...account, values: { ...account.values, role: "ADMIN" } }),
    )
  ).status,
  400,
);
assert.equal(audit, 0);
assert.equal((await route.POST(req(account))).status, 200);
assert.equal(userUpdate.name, "Updated customer");
assert.equal(audit, 1);
assert.equal((await route.POST(req(account))).status, 409);
const billing = {
  section: "billing",
  values: {
    companyName: "Customer Company",
    phone: "",
    website: "https://example.com",
    address: "Sample billing address",
    city: "Warri",
    state: "Delta",
    country: "Nigeria",
  },
  updatedAt: null,
};
assert.equal((await route.POST(req(billing))).status, 200);
assert.equal(profile.userId, "customer-one");
assert.equal(profile.companyName, "Customer Company");
assert.equal((await route.POST(req(billing))).status, 409);
const version = profile.updatedAt.toISOString();
assert.equal(
  (
    await route.POST(
      req({
        ...billing,
        values: { ...billing.values, city: "Lagos" },
        updatedAt: version,
      }),
    )
  ).status,
  200,
);
assert.equal(profile.city, "Lagos");
assert.equal(
  (
    await route.POST(
      req({ section: "account", values: account.values, updatedAt: "invalid" }),
    )
  ).status,
  400,
);
assert.equal((await route.POST(req("x".repeat(17000)))).status, 413);
const jsx = {
  "react/jsx-runtime": {
    jsx: (type, props) => ({ type, props }),
    jsxs: (type, props) => ({ type, props }),
  },
};
function expand(node) {
  if (!node || typeof node !== "object") return node;
  if (Array.isArray(node)) return node.map(expand);
  if (typeof node.type === "function") return expand(node.type(node.props));
  return {
    ...node,
    props: { ...node.props, children: expand(node.props?.children) },
  };
}
const icons = Object.fromEntries(
  [
    "Check",
    "Circle",
    "ArrowUpRight",
    "Activity",
    "BarChart3",
    "ArrowRight",
    "CalendarDays",
    "Plus",
    "Layers3",
  ].map((k) => [k, k]),
);
const progress = load(
  "features/client/components/overview/ClientProjectsProgress.tsx",
  {
    ...jsx,
    "next/link": { default: "Link" },
    "lucide-react": icons,
    "@/components/ui/avatar": {
      Avatar: "Avatar",
      AvatarImage: "AvatarImage",
      AvatarFallback: "AvatarFallback",
    },
    "@/features/client/lib/workspace": workspace,
  },
);
const card = progress.ClientProjectsProgress({
  projects: [
    {
      id: "p",
      name: "A complete long project name that must remain visible",
      status: "DEVELOPMENT",
      progress: 70,
      logo: { url: "https://res.cloudinary.com/rcentz/image/upload/logo.png" },
      domain: "example.com",
      liveUrl: null,
      milestoneSummary: { total: 5, completed: 3 },
      nextMilestone: { title: "Customer review" },
      health: { reason: "One milestone awaiting review" },
      expectedEndAt: new Date(),
      updatedAt: new Date(),
    },
  ],
});
const cardText = JSON.stringify(card);
assert.ok(cardText.includes("A complete long project name"));
assert.ok(cardText.includes("Customer review"));
assert.ok(cardText.includes('\"aria-valuenow\":70'));
assert.ok(cardText.includes("logo.png"));
const summary = load(
  "features/client/components/overview/ProjectDecisionSummary.tsx",
  { ...jsx, "next/link": { default: "Link" }, "lucide-react": icons },
);
const rendered = JSON.stringify(
  expand(
    summary.ProjectDecisionSummary({
      project: {
        deliverables: Array.from({ length: 8 }, (_, i) => ({
          id: "d" + i,
          title: "Deliverable " + i,
          status: i < 3 ? "ACCEPTED" : "PLANNED",
        })),
        approvals: [],
        supportTickets: [],
      },
      analytics: { available: false, reason: "NOT_CONFIGURED" },
    }),
  ),
);
assert.ok(rendered.includes("Deliverable 7"));
assert.ok(rendered.includes("Scrollable delivery checklist"));
assert.ok(rendered.includes("Observability"));
assert.ok(rendered.includes("Discuss analytics"));
assert.ok(!rendered.includes("Function invocations"));
let admin = false;
const adminGetter = load(
  "features/admin/server/projects/get-admin-project.ts",
  {
    "server-only": {},
    react: { cache: (fn) => fn },
    "@/features/auth/server/require-admin": {
      requireAdmin: async () => {
        if (!admin) throw Error("DENIED");
      },
    },
    "@/lib/prisma": {
      prisma: { project: { findUnique: async () => ({ id: "p" }) } },
    },
  },
);
await assert.rejects(adminGetter.getAdminProject("p"), /DENIED/);
admin = true;
assert.deepEqual(await adminGetter.getAdminProject("p"), { id: "p" });
console.log(
  "PASS: active-account and origin gates before reads; owner-scoped, one-time product briefs; original briefs and agreed scope preserved; account and billing field allowlists, role/email protection and concurrent-save conflicts; safe logo fallback; complete cards, scrollable checklist and truthful analytics states; admin authorization before brief reads. Controlled fixtures only; no live database writes.",
);
