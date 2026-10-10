import fs from "node:fs";
import assert from "node:assert/strict";
import ts from "typescript";
const module={exports:{}};new Function("module","exports",ts.transpileModule(fs.readFileSync("features/opportunities/lib/retention.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(module,module.exports);
const {validateRetention}=module.exports;
const data={profileExists:true,retentionEnabled:false,preview:true,deletionPerformed:false,checkedAt:"2026-10-10T00:00:00Z",cutoff:"2026-07-12T00:00:00Z",limits:{maxNewPerRun:25,maxStretchPerRun:2,maxUntouched:500,retentionDays:90,maxCleanupPerRun:100},total:10,untouched:4,eligible:3,ineligible:7,candidates:[{id:"old",title:"Old role",company:"Employer",lastSeenAt:"2025-01-01T00:00:00Z",updatedAt:"2025-01-01T00:00:00Z"}]};
assert.equal(validateRetention(data),data);
for(const bad of [{...data,deletionPerformed:true},{...data,eligible:11},{...data,ineligible:8},{...data,candidates:Array(7).fill(data.candidates[0])},{...data,preview:false},{...data,retentionEnabled:"false"},{...data,candidates:[{...data.candidates[0],lastSeenAt:"invalid"}]}])assert.throws(()=>validateRetention(bad));
console.log("PASS: retention response limits, counts, dates, preview flags and non-deletion guarantees validated.");
