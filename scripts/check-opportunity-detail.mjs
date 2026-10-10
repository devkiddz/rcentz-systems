import fs from "node:fs";
import assert from "node:assert/strict";
import ts from "typescript";
function load(file, stubs = {}) {
  const out = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  const m = { exports: {} };
  new Function("require", "module", "exports", out)(
    (name) => {
      if (!(name in stubs)) throw Error("Unmocked " + name);
      return stubs[name];
    },
    m,
    m.exports,
  );
  return m.exports;
}
const navigation = load("features/opportunities/lib/navigation.ts");
const { opportunityHref, queueQuery } = navigation;
assert.equal(
  opportunityHref({ title: "Senior React / Next.js Engineer", id: "one" }),
  "/admin/opportunities/senior-react-next-js-engineer~one",
);
assert.notEqual(
  opportunityHref({ title: "Same title", id: "one" }),
  opportunityHref({ title: "Same title", id: "two" }),
);
assert.equal(
  opportunityHref({ title: "✨", id: "one" }),
  "/admin/opportunities/opportunity~one",
);
assert.equal(
  queueQuery({
    queue: "quarantine",
    kind: "CONTRACT",
    status: "ARCHIVED",
    page: "3",
  }),
  "?queue=quarantine&kind=CONTRACT&status=ARCHIVED&page=3",
);
assert.equal(
  queueQuery({
    queue: "https://attacker",
    kind: "invalid",
    status: "invalid",
    page: "-1",
  }),
  "",
);
const types = load("features/opportunities/types.ts", {"./lib/project-evidence": load("features/opportunities/lib/project-evidence.ts")});
assert.equal(types.validateOpportunityDetail({ job: null }), null);
assert.throws(() => types.validateOpportunityDetail({ job: {} }));
let authorized = false,
  reads = 0;
const notFound = () => {
  throw Error("NOT_FOUND");
};
const page = load("app/admin/opportunities/[slug]/page.tsx", {
  "react/jsx-runtime": { jsx: () => null, jsxs: () => null },
  "next/link": { default: () => null },
  "next/navigation": {
    notFound,
    redirect: () => {
      throw Error("REDIRECT");
    },
  },
  "lucide-react": { ArrowLeft: () => null },
  "@/components/ui/button": { Button: () => null },
  "@/server/opportunities/access": {
    requireFinderOwner: async () => {
      if (!authorized) throw Error("DENIED");
    },
  },
  "@/server/opportunities/client": {
    opportunityRequest: async (payload) => {
      reads++;
      assert.equal(payload.operation, "detail");
      return { job: null };
    },
  },
  "@/features/opportunities/types": types,
  "@/features/opportunities/lib/navigation": navigation,
  "@/features/opportunities/components/OpportunityDetail": {
    OpportunityDetail: () => null,
  },
}).default;
const props = (slug) => ({
  params: Promise.resolve({ slug }),
  searchParams: Promise.resolve({}),
});
await assert.rejects(page(props("role~owned")), /DENIED/);
assert.equal(reads, 0);
authorized = true;
await assert.rejects(page(props("bad-path")), /NOT_FOUND/);
assert.equal(reads, 0);
await assert.rejects(page(props("role~owned")), /NOT_FOUND/);
assert.equal(reads, 1);
console.log(
  "PASS: unique canonical slugs, safe queue return links, detail contract validation, authorization before fetching, malformed paths and missing-record handling.",
);
