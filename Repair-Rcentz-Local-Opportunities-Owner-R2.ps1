# Rcentz Systems local owner recovery (R2) — never touches production credentials or DB data.
$ErrorActionPreference = 'Stop'
$root = Join-Path $env:USERPROFILE 'Desktop\Rcentz-Recovery\rcentz-systems'
$envFile = Join-Path $root '.env.local'
$jsFile = Join-Path $root ('.rcentz-owner-repair-' + [guid]::NewGuid().ToString('N') + '.cjs')
$oldNodeOptions = $env:NODE_OPTIONS
try {
  if (!(Test-Path -LiteralPath $envFile -PathType Leaf)) { throw 'Local .env.local not found.' }
  if (!(Test-Path -LiteralPath (Join-Path $root 'node_modules\pg') -PathType Container)) { throw 'pg dependency not installed. No changes.' }
  $js = @'
const fs = require('node:fs');
const { Client } = require('pg');
const crypto = require('node:crypto');
const path = require('node:path');
const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');
const file = path.join(process.cwd(), '.env.local');
const read = () => {
 const original = fs.readFileSync(file,'utf8'); const values={};
 for (const line of original.split(/\r?\n/)) {
  const m=line.match(/^\s*(?:export\s+)?([A-Z][A-Z_0-9]*)\s*=\s*(.*)$/);
  if(m){let v=m[2].trim();if ((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1);values[m[1]]=v;}
 }
 return {original,values};
};
function mask(email) {if (!email || !email.includes('@')) return '(email unavailable)';const [a,b]=email.split('@');return a.slice(0,2)+'***@'+b;}
(async()=>{
 const {original, values}=read();
 if (!values.DATABASE_URL) throw Error('DATABASE_URL missing. No changes.');
 if (values.OPPORTUNITY_OWNER_ID) throw Error('Owner already configured. No overwrite permitted.');
 const url = new URL(values.DATABASE_URL);
 if (!url.hostname.endsWith('.neon.tech')) throw Error('Database host is not recognized Neon. No changes.');
 const client=new Client({connectionString: values.DATABASE_URL,connectionTimeoutMillis:10000,statement_timeout:10000,application_name:'rcentz_local_owner_setup_readonly'});
 let rows;
 try {
  await client.connect(); await client.query('BEGIN READ ONLY');
  const result=await client.query(`SELECT id, name, email, role FROM "user" WHERE status = 'ACTIVE' AND role IN ('ADMIN','SUPER_ADMIN') ORDER BY CASE role WHEN 'SUPER_ADMIN' THEN 0 ELSE 1 END, name, id`);
  rows=result.rows; await client.query('ROLLBACK');
 } finally {await client.end().catch(()=>{});}
 if (!rows.length) throw Error('No active administrator found. No changes.');
 console.log('\nLOCAL SYSTEMS ADMINISTRATORS — select only the account YOU are signed into:');
 for (let i=0;i<rows.length;i++) console.log(`${i+1}. ${rows[i].name || '(unnamed)'} (${mask(rows[i].email)}) [${rows[i].role}]`);
 const rl=readline.createInterface({input:stdin,output:stdout});
 let answer;try{answer=await rl.question('Account number (Enter to cancel): ');}finally{rl.close();}
 if(!/^\d+$/.test(answer.trim()) || +answer<1 || +answer>rows.length) throw Error('Cancelled or invalid selection. No changes.');
 const selected=rows[Number(answer)-1];
 console.log('Selected account:', selected.name || '(unnamed)', `[${selected.role}]`);
 const rl2=readline.createInterface({input:stdin,output:stdout});
 let confirm;try{confirm=await rl2.question('Type AUTHORIZE to assign local Opportunities ownership: ');}finally{rl2.close();}
 if(confirm!=='AUTHORIZE') throw Error('Not confirmed. No changes.');
 // Avoid races or overwriting concurrent changes.
 if(fs.readFileSync(file,'utf8')!==original) throw Error('Environment changed during check; no changes.');
 const backupDir=path.join(process.cwd(),'..','_Archive','Local-Env-Backups');fs.mkdirSync(backupDir,{recursive:true});
 const backup=path.join(backupDir,`.env.local.before-opportunities-owner-${new Date().toISOString().replace(/[:.]/g,'-')}-${crypto.randomBytes(4).toString('hex')}.bak`);
 fs.copyFileSync(file,backup,fs.constants.COPYFILE_EXCL);
 const added=original.replace(/\s*$/,'')+'\r\nOPPORTUNITY_OWNER_ID='+selected.id+'\r\n';
 fs.writeFileSync(file,added,{encoding:'utf8',flag:'w'});
 console.log('PASS: Existing active administrator assigned as local Opportunities owner.');
 console.log('PASS: Private backup saved under _Archive/Local-Env-Backups.');
 console.log('NEXT: Restart local Systems server on port 3001, then open /admin/opportunities.');
 console.log('NOTICE: API signing is still separate and unconfigured locally. No API requests were tested.');
})().catch(e=>{console.error('STOP:',e.message);process.exitCode=1;});
'@
  [System.IO.File]::WriteAllText($jsFile, $js, (New-Object System.Text.UTF8Encoding($false)))
  $env:NODE_OPTIONS = ''
  Push-Location $root
  try { & node $jsFile; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } } finally { Pop-Location }
} catch { Write-Host ('STOP: ' + $_.Exception.Message) -ForegroundColor Yellow; exit 1 }
finally {
 $env:NODE_OPTIONS = $oldNodeOptions
 if (Test-Path -LiteralPath $jsFile) { Remove-Item -LiteralPath $jsFile -Force -ErrorAction SilentlyContinue }
}
