"""Guarded rehearsal-only authorization repair. No production database or secrets changed."""
from pathlib import Path
from urllib.parse import urlsplit
import os, re, json, subprocess, sys

ROOT = Path.home() / 'Desktop' / 'Rcentz-Recovery'
API = ROOT / 'rcentz-api'
SYSTEMS = ROOT / 'rcentz-systems'
HOST = 'ep-tiny-sun-b522zm7v.c-7.us-east-2.aws.neon.tech'
REQUIRED = ['opportunities:read', 'company-capabilities:read', 'company-capabilities:write']
MIGRATION = '20261010190000_oa02_company_capability_foundation'

def load(path):
    if not path.is_file() or path.is_symlink():
        raise SystemExit('STOP: Expected local environment file not found or is a symlink: ' + path.name)
    out = {}
    for line in path.read_text(encoding='utf-8-sig').splitlines():
        m = re.match(r'^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$', line)
        if m:
            v = m.group(2).strip()
            if len(v)>1 and v[0] in "\"'" and v[-1] == v[0]: v=v[1:-1]
            if m.group(1) in out: raise SystemExit('STOP: Duplicate environment key: '+m.group(1))
            out[m.group(1)]=v
    return out

print('=== RCENTZ OA-02 REHEARSAL OWNER/SCOPE REPAIR ===',flush=True)
if not (API/'.git').is_dir() or not (SYSTEMS/'.git').is_dir():
    raise SystemExit('STOP: Expected local repositories not found')
sysenv=load(SYSTEMS/'.env.local')
rehenv=load(API/'.env.oa02-rehearsal')
owner=sysenv.get('OPPORTUNITY_OWNER_ID','')
if not re.fullmatch(r'[a-zA-Z0-9_-]{8,160}',owner):
    raise SystemExit('STOP: Local owner ID missing/invalid')
if sysenv.get('RCENTZ_API_URL')!='http://127.0.0.1:3002':
    raise SystemExit('STOP: Local Systems is not pointed at rehearsal API port 3002')
if len(sysenv.get('RCENTZ_SYSTEMS_API_SECRET','')) < 32:
    raise SystemExit('STOP: Local API signing secret missing')
url=rehenv.get('DIRECT_URL') or rehenv.get('DATABASE_URL','')
p=urlsplit(url)
if p.scheme not in ('postgres','postgresql') or p.hostname!=HOST or p.path!='/neondb' or p.port not in (None,5432):
    raise SystemExit('STOP: Expected dedicated rehearsal Neon endpoint not verified')
for key in ('DATABASE_URL','DIRECT_URL'):
    value=rehenv.get(key)
    if value:
        q=urlsplit(value)
        if q.scheme not in ('postgres','postgresql') or q.hostname not in (HOST,HOST.replace('.c-7.','-pooler.c-7.')) or q.path!='/neondb':
            raise SystemExit('STOP: Conflicting database endpoint in rehearsal file')
for key in ('DATABASE_URL','DIRECT_URL'):
    prod=load(API/'.env').get(key,'')
    if prod and urlsplit(prod).hostname==HOST:
        raise SystemExit('STOP: Rehearsal host unexpectedly equals production host')
if subprocess.run(['git','check-ignore','-q','.env.oa02-rehearsal'],cwd=API,stdout=subprocess.DEVNULL).returncode:
    raise SystemExit('STOP: Rehearsal connection file is not Git-ignored')

js=r'''const {Client}=require('pg');
const say=(x)=>console.log(JSON.stringify(x));
(async()=>{
const c=new Client({connectionString:process.env.OA_DB,connectionTimeoutMillis:12000,query_timeout:12000,statement_timeout:12000});
let tx=false;
try {
 await c.connect(); await c.query('BEGIN');tx=true;
 await c.query("SET LOCAL lock_timeout='5s'");
 const m=(await c.query(`SELECT count(*)::int total, count(*) FILTER (WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL)::int applied, count(*) FILTER (WHERE migration_name=$1 AND finished_at IS NOT NULL AND rolled_back_at IS NULL)::int oa02 FROM public._prisma_migrations`,[process.env.OA_MIGRATION])).rows[0];
 if(m.total!==21||m.applied!==21||m.oa02!==1)throw Error('MIGRATION_HISTORY_MISMATCH');
 const r=await c.query(`SELECT ai.id,ai.subject,ai."userId",ai.enabled,ai.scopes,u.role,u.status FROM public."ApplicationIdentity" ai JOIN public."user" u ON u.id=ai."userId" WHERE ai."applicationId"='systems' AND (ai.subject=$1 OR ai."userId"=$1) FOR UPDATE OF ai`,[process.env.OA_OWNER]);
 if(r.rows.length!==1 || r.rows[0].subject!==process.env.OA_OWNER || r.rows[0].userId!==process.env.OA_OWNER)throw Error('OWNER_IDENTITY_MISSING_OR_AMBIGUOUS');
 const a=r.rows[0];
 if(!a.enabled || a.status!=='ACTIVE' || !['SUPER_ADMIN','ADMIN'].includes(a.role))throw Error('OWNER_IDENTITY_NOT_ACTIVE_ADMIN');
 if(!Array.isArray(a.scopes))throw Error('INVALID_EXISTING_SCOPES');
 const required=JSON.parse(process.env.OA_SCOPES), missing=required.filter(s=>!a.scopes.includes(s));
 say({phase:'preview',status:'PASS',ownerIdentityVerified:true,activeAdmin:true,existingScopeCount:a.scopes.length,needed:required,missing,otherRowsUntouched:true});
 if(process.env.OA_APPLY!=='yes') {await c.query('ROLLBACK');tx=false;say({phase:'complete',status:'READ_ONLY'});return;}
 const scopes=[...a.scopes,...missing];
 if(missing.length){const u=await c.query(`UPDATE public."ApplicationIdentity" SET scopes=$1::text[],"updatedAt"=now() WHERE id=$2 AND scopes=$3::text[]`,[scopes,a.id,a.scopes]);if(u.rowCount!==1)throw Error('CONCURRENT_SCOPE_CHANGE');}
 const check=(await c.query(`SELECT scopes FROM public."ApplicationIdentity" WHERE id=$1`,[a.id])).rows[0];
 if(!check || !required.every(s=>check.scopes.includes(s)) || !a.scopes.every(s=>check.scopes.includes(s)))throw Error('VERIFICATION_FAILED');
 await c.query('COMMIT');tx=false;
 say({phase:'complete',status:'PASS',added:missing.length,existingScopesPreserved:true,otherRowsUntouched:true});
}catch(e){if(tx)try{await c.query('ROLLBACK')}catch{};say({phase:'error',code:/^[A-Z_]+$/.test(e.message)?e.message:'DATABASE_ERROR',rolledBack:true});process.exitCode=1;}finally{await c.end().catch(()=>{});}
})();'''
env=os.environ.copy();env.update(OA_DB=url,OA_OWNER=owner,OA_SCOPES=json.dumps(REQUIRED),OA_MIGRATION=MIGRATION,NODE_OPTIONS='')
def call(mode):
    env['OA_APPLY']='yes' if mode=='apply' else 'no'
    try:r=subprocess.run(['node','-e',js],cwd=API,env=env,capture_output=True,text=True,errors='replace',timeout=60)
    except (OSError,subprocess.TimeoutExpired):raise SystemExit('STOP: Database preflight unavailable or timed out')
    records=[]
    for line in r.stdout.splitlines():
        try:
            data=json.loads(line)
            if isinstance(data,dict) and 'phase' in data:records.append(data);print(json.dumps(data),flush=True)
        except ValueError:pass
    if r.returncode or not records or records[-1].get('phase')=='error':
        raise SystemExit('STOP: Authorization preflight failed; no grant committed if transaction failed.')
    return records
print('Database target: verified OA-02 rehearsal only; no Vercel or production edits.',flush=True)
call('preview')
if input('Type GRANT-REHEARSAL-ACCESS to add missing scopes: ').strip()!='GRANT-REHEARSAL-ACCESS':
    raise SystemExit('CANCELLED: No changes made')
call('apply')
print('NEXT: Refresh localhost:3001/admin/opportunities and /capabilities. Do not collect opportunities yet.',flush=True)
