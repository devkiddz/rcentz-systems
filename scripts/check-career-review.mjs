import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as jsx from 'react/jsx-runtime';
function load(file,stubs={}){const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;const m={exports:{}};new Function('require','module','exports',out)(n=>{if(!(n in stubs))throw Error('Unmocked '+n);return stubs[n];},m,m.exports);return m.exports;}
const contract=load('features/opportunities/types.ts',{'./lib/career-review':load('features/opportunities/lib/career-review.ts'),'./lib/project-evidence':load('features/opportunities/lib/project-evidence.ts')});
const review={version:1,assessedAt:'2026-10-10T00:00:00Z',recommendation:'CLARIFY',reason:'A skill tag needs a personal contribution.',coverage:'Bounded source review; owner-recorded evidence.',requirements:[{name:'React',kind:'SKILL',priority:'REQUIRED',evidence:'CLAIMED',quote:'<script>alert(1)</script> React required',finding:'Prepare your contribution example.',projects:['My delivery']}],nextSteps:['Confirm the full requirement.']};
const job={id:'one',source:'REMOTIVE',kind:'EMPLOYMENT',title:'Frontend Developer',company:'Acme',url:'https://example.com',description:'Source description',location:'Worldwide',jobType:'full_time',sourceState:'LISTED',status:'SHORTLISTED',notes:'Keep my decision',publishedAt:review.assessedAt,lastSeenAt:review.assessedAt,score:90,quarantined:false,salary:null,research:null,assessment:{matched:['React'],concerns:[],questions:[],eligibility:'Unconfirmed',verdict:'Worth reviewing',careerReview:review}};
assert.equal(contract.validateOpportunityDetail({job}).status,'SHORTLISTED');
for(const patch of [{recommendation:'AUTO_APPLY'},{requirements:Array(21).fill(review.requirements[0])},{nextSteps:['x'.repeat(701)]},{assessedAt:'invalid'},{requirements:[{...review.requirements[0],evidence:'VERIFIED'}]}])assert.throws(()=>contract.validateOpportunityDetail({job:{...job,assessment:{...job.assessment,careerReview:{...review,...patch}}}}));
const box=({children,...props})=>React.createElement('div',props,children);
const {OpportunityDetail}=load('features/opportunities/components/OpportunityDetail.tsx',{'react/jsx-runtime':jsx,'./FinderButton':{finderButtonVariants:()=>''},'@/components/ui/card':{Card:box},'@/components/ui/badge':{Badge:({children})=>React.createElement('span',null,children)},'@/components/ui/textarea':{Textarea:props=>React.createElement('textarea',props)},'../server/actions':{updateOpportunity:()=>{}},'../lib/matching':load('features/opportunities/lib/matching.ts'),'./SubmitButton':{SubmitButton:({children})=>React.createElement('button',null,children)},'./OpportunityCard':{selectClass:'',label:s=>s.toLowerCase().replaceAll('_',' ')}});
const html=renderToStaticMarkup(React.createElement(OpportunityDetail,{job}));
assert.match(html,/Clarify before pursuing/);assert.match(html,/Claim needs example/);assert.match(html,/Keep my decision/);assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script>alert/);
const legacy=renderToStaticMarkup(React.createElement(OpportunityDetail,{job:{...job,assessment:{...job.assessment,careerReview:undefined}}}));assert.match(legacy,/older assessment remains below/);
console.log('PASS: bounded career-detail contract, recommendations and evidence render, untrusted source text escapes, legacy fallback and saved decisions remain visible.');
