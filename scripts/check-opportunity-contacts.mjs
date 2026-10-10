import fs from 'node:fs';import ts from 'typescript';import assert from 'node:assert/strict';
const m={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync('features/opportunities/lib/contacts.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(m,m.exports);
const {validateContacts}=m.exports;
const page={page:1,pageSize:6,pages:1,total:1,hasNext:false,hasPrevious:false};const c={opportunityId:'one',title:'RFP for portal',company:'Acme',kind:'PROJECT',email:'procurement@acme.example',sourceUrl:'https://acme.example/rfp',observedAt:new Date().toISOString(),purpose:'Procurement'};
assert.equal(validateContacts({pagination:page,contacts:[c]}).contacts.length,1);
for(const patch of [{sourceUrl:'javascript:alert(1)'},{sourceUrl:'https://localhost/source'},{email:'wrong'},{opportunityId:'../other'},{observedAt:'invalid'}])assert.throws(()=>validateContacts({pagination:page,contacts:[{...c,...patch}]}));
assert.throws(()=>validateContacts({pagination:page,contacts:Array(7).fill(c)}));
const route=fs.readFileSync('app/admin/opportunities/contacts/page.tsx','utf8');assert.ok(route.indexOf('await requireFinderOwner()')<route.indexOf('await opportunityRequest('));assert.match(route,/validateContacts/);assert.match(route,/CopyEmail/);assert.match(route,/noopener noreferrer/);
console.log('PASS: contacts guard before transport, six-item contract, safe published links, malformed identifiers/dates/addresses rejected and copy UI wired.');
