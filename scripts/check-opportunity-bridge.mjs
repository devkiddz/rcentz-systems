import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
import * as crypto from 'node:crypto';
function load(file, stubs={}) {
 const output=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const evaluated={exports:{}};new Function('require','module','exports',output)(name=>{if(!(name in stubs))throw Error('Unmocked '+name);return stubs[name];},evaluated,evaluated.exports);return evaluated.exports;
}
let user={id:'other'};process.env.OPPORTUNITY_OWNER_ID='local-owner';
const access=load('server/opportunities/access.ts',{'server-only':{},'next/navigation':{notFound:()=>{throw Error('NOT_FOUND');}},'@/features/auth/server/require-admin':{requireAdmin:async()=>user}});
await assert.rejects(access.requireFinderOwner(),/NOT_FOUND/);user={id:'local-owner'};
process.env.RCENTZ_API_URL='https://api.example';process.env.RCENTZ_SYSTEMS_API_SECRET='test-only-secret-with-at-least-32-characters';
let requests=0;
globalThis.fetch=async(url,init)=>{requests++;assert.equal(url.href,'https://api.example/api/v1/internal/systems/opportunities');assert.equal(init.headers['x-rcentz-subject'],'local-owner');assert.equal(init.cache,'no-store');assert.equal(init.redirect,'error');
 const h=init.headers;const canonical=JSON.stringify(['rcentz-api:v1','POST',url.pathname,h['x-rcentz-app'],h['x-rcentz-subject'],h['x-rcentz-issued-at'],h['x-rcentz-nonce'],init.body]);
 assert.equal(h['x-rcentz-signature'],crypto.createHmac('sha256',process.env.RCENTZ_SYSTEMS_API_SECRET).update(canonical).digest('hex'));
 return Response.json({success:true,data:{saved:true}});
};
const client=load('server/opportunities/client.ts',{'server-only':{},'node:crypto':crypto,'./access':access});
await client.opportunityRequest({operation:'profile'});assert.equal(requests,1);
user={id:'other'};await assert.rejects(client.opportunityRequest({operation:'profile'}),/NOT_FOUND/);assert.equal(requests,1);user={id:'local-owner'};
process.env.RCENTZ_API_URL='https://api.example?unsafe=true';await assert.rejects(client.opportunityRequest({operation:'list'}),/Invalid API/);assert.equal(requests,1);
const contract=load('features/opportunities/types.ts');assert.deepEqual(contract.validateFinderData({profile:null,jobs:[],runs:[]}),{profile:null,jobs:[],runs:[]});assert.throws(()=>contract.validateFinderData({profile:null,jobs:[{}],runs:[]}));
const source=fs.readFileSync('server/opportunities/client.ts','utf8')+fs.readFileSync('features/opportunities/server/actions.ts','utf8')+fs.readFileSync('app/admin/opportunities/page.tsx','utf8');assert.doesNotMatch(source,/prisma/);
console.log('PASS: local owner guard precedes transport, signed fixed-route requests, HTTPS configuration, no-store transport and response validation.');
