import fs from "node:fs";
import assert from "node:assert/strict";
import ts from "typescript";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
function load(file, stubs) {
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX}}).outputText;
  const module = {exports: {}};
  new Function("require", "module", "exports", source)(name => {
    if (name === "react/jsx-runtime") return require(name);
    if (!(name in stubs)) throw Error("Unmocked " + name);
    return stubs[name];
  }, module, module.exports);
  return module.exports;
}
let allowed = false, fetches = 0;
const page = load("app/admin/opportunities/settings/page.tsx", {
  "@/server/opportunities/access": {requireFinderOwner: async () => {if (!allowed) throw Error("Denied");}},
  "@/server/opportunities/client": {opportunityRequest: async payload => {fetches++; assert.equal(payload.operation,"list"); assert.equal(payload.contractVersion,3); assert.equal(payload.page,1); return {}; }},
  "@/features/opportunities/types": {validateFinderData: value => value},
  "@/features/opportunities/components/FinderSettings": {FinderSettings: () => null},
});
await assert.rejects(page.default({searchParams:Promise.resolve({})}), /Denied/);
assert.equal(fetches,0);
allowed=true;
await page.default({searchParams:Promise.resolve({saved:"1"})});
assert.equal(fetches,1);
let payload, redirects=[], invalidated=[];
const actions=load("features/opportunities/server/actions.ts", {
  "next/cache": {revalidatePath: path => invalidated.push(path)},
  "next/navigation": {redirect: path => redirects.push(path)},
  "@/server/opportunities/client": {opportunityRequest: async body => {payload=body;return {}; }},
});
const form=new FormData();form.set("returnTo","settings");form.set("projectName0","Project");form.set("projectUrl0","https://example.com");form.set("projectSkills0","React, TypeScript");form.set("projectContribution0","Implemented interface");
await actions.saveProfile(form);
assert.equal("careerContext" in payload,false);
assert.equal(payload.projectEvidence[0].name,"Project");
assert.deepEqual(redirects,["/admin/opportunities/settings?saved=1"]);
assert.ok(invalidated.includes("/admin/opportunities/settings"));
form.set("returnTo","https://untrusted.example");redirects=[];
await actions.saveProfile(form);assert.equal(redirects.length,0);
for(const path of ["features/opportunities/components/FinderWorkspace.tsx","features/opportunities/components/FinderSettings.tsx"]){
 const text=fs.readFileSync(path,"utf8");assert.doesNotMatch(text, /Â·|â€”|â€“/);
}
console.log("PASS: settings owner guard before fetching, bounded contract, preserved career context/project entries, fixed return target and clean UTF-8 labels.");
