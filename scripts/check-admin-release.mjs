import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import ts from 'typescript';
function load(file, stubs) {
 const output = ts.transpileModule(fs.readFileSync(file,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const evaluated = {exports:{}};
 new Function('require','module','exports',output)(name=> {if (!(name in stubs)) throw Error('Unmocked import ' + name); return stubs[name];},evaluated,evaluated.exports);
 return evaluated.exports;
}
(async()=>{
 let user=null;
 const redirect = target=> {const e=Error(target);e.target=target;throw e;};
 const guard=load('features/auth/server/require-admin.ts',{'server-only':{},'next/navigation':{redirect},'./get-current-user':{getCurrentUser:async()=>user}});
 for(const [identity,target] of [[null,'/adminlogin/login?next=/admin'],[{status:'SUSPENDED',role:'SUPER_ADMIN'},'/'],[{status:'ACTIVE',role:'CLIENT'},'/dashboard']]) {
 user=identity;await assert.rejects(guard.requireAdmin(), e=>e.target===target);
 }
 for(const role of ['ADMIN','SUPER_ADMIN']) {user={id:'staff',status:'ACTIVE',role};assert.equal((await guard.requireAdmin()).role,role);}
 console.log('PASS: guests, inactive staff and customers denied; active admin roles accepted.');
 let authorized=true, transactions=0,created=0,logs=[],notifications=[],savedProject=null;
 let brief={id:'brief1',status:'PENDING',title:'Customer brief',userId:'customer1',description:'Scope',currency:'USD',budget:9999,project:null};
 let mutex=Promise.resolve();
 const tx={
 $executeRaw:async()=>{},
 serviceRequest:{findUnique:async()=>({...brief,project:savedProject}),findUniqueOrThrow:async()=>brief,update:async({data})=>Object.assign(brief,data),updateMany:async({where,data})=>{if(brief.status!==where.status)return{count:0};Object.assign(brief,data);return{count:1};}},
 project:{create:async({data})=>{created++;assert.equal(data.clientId,'customer1');assert.equal(data.serviceRequestId,'brief1');assert.equal(data.status,'PLANNING');assert.equal(data.visibility,'PRIVATE');assert.equal(data.budget,undefined);savedProject={id:'project1'};return savedProject;}},
 auditLog:{create:async({data})=>logs.push(data)},notification:{create:async({data})=>notifications.push(data)}
 };
 const actions=load('features/admin/server/requests/brief-actions.ts',{
 'next/cache':{revalidatePath:()=>{}},'next/navigation':{redirect},
 '@/features/auth/server/require-admin':{requireAdmin:async()=>{if(!authorized)throw Error('DENIED');return{id:'staff'};}},
 '@/lib/prisma':{prisma:{$transaction: async fn=>{transactions++; const p=mutex.then(()=>fn(tx));mutex=p.catch(()=>{});return p;}}}
 });
 const form=new FormData();form.set('requestId','brief1');
 authorized=false; await assert.rejects(actions.createPlanningProject(form),/DENIED/);assert.equal(transactions,0);authorized=true;
 await actions.reviewBrief(form);await actions.reviewBrief(form);assert.equal(logs.length,1);assert.equal(notifications.length,1);assert.equal(brief.status,'REVIEWING');
 const outcomes=await Promise.allSettled([actions.createPlanningProject(form),actions.createPlanningProject(form)]);
 assert.equal(created,1);assert.equal(brief.status,'CONVERTED');assert.equal(logs.length,2);assert.equal(notifications.length,2);assert.ok(outcomes.every(r=>r.reason?.target==='/admin/projects/project1'));
 savedProject=null;brief.status='DRAFT';await assert.rejects(actions.createPlanningProject(form),/not available/);assert.equal(created,1);
 console.log('PASS: actions authorize before writes; review idempotent; duplicate conversions reuse one private planning project; drafts rejected; requested budget not agreed.');
 const files=[];function walk(dir){for(const d of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,d.name);if(d.isDirectory())walk(f);else if(d.name==='page.tsx')files.push(f);}}walk('app/admin');
 for(const file of files)assert.match(fs.readFileSync(file,'utf8'),/await requireAdmin\(/,file+' lacks its own guard');
 console.log('PASS: every admin page guards its own data access.');
 let query;
 const fileRoute=load('app/api/project-briefs/[requestId]/files/[fileId]/route.ts',{
 '@vercel/blob':{get:async()=>null},'@/lib/prisma':{prisma:{serviceRequest:{findFirst:async q=>{query=q;return null;}}}},
 '@/features/auth/server/get-current-user':{getCurrentUser:async()=>user},
 '@/features/onboarding/server/brief-data':{BRIEF_KEY:'key',readBriefData:()=>null}
 });
 const request=new Request('https://systems.rcentz.cc/api/project-briefs/b/files/f');const args={params:Promise.resolve({requestId:'b',fileId:'f'})};
 user=null;assert.equal((await fileRoute.GET(request,args)).status,401);
 user={id:'client',role:'CLIENT',status:'ACTIVE'};assert.equal((await fileRoute.GET(request,args)).status,404);assert.equal(query.where.userId,'client');
 user={id:'staff',role:'ADMIN',status:'ACTIVE'};assert.equal((await fileRoute.GET(request,args)).status,404);assert.equal(query.where.userId,undefined);assert.deepEqual(query.where.status,{not:'DRAFT'});
 console.log('PASS: reference downloads preserve customer ownership; active staff limited to submitted briefs.');
})().catch(e=>{console.error(e);process.exit(1)});
