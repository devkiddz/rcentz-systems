# Local-only Opportunities owner repair. Does not rotate credentials or modify databases/Vercel.
$ErrorActionPreference = 'Stop'
$root = Join-Path $env:USERPROFILE 'Desktop\Rcentz-Recovery'
$project = Join-Path $root 'rcentz-systems'
$localEnv = Join-Path $project '.env.local'
$vercelLink = Join-Path $project '.vercel\project.json'
$tempEnv = Join-Path $env:TEMP ('rcentz-owner-prod-' + [guid]::NewGuid().ToString('N') + '.env')
$tempJS = Join-Path $project ('.rcentz-owner-verify-' + [guid]::NewGuid().ToString('N') + '.cjs')
$backup = $null
function StopSafely([string]$message) { throw ('STOP: ' + $message) }
function ReadEnv([string]$path) {
  $dict = @{}
  foreach ($line in [System.IO.File]::ReadAllLines($path)) {
    if ($line -match '^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') {
      $key = $Matches[1]; $v = $Matches[2].Trim()
      if ($v.Length -ge 2 -and (($v.StartsWith('"') -and $v.EndsWith('"')) -or ($v.StartsWith("'") -and $v.EndsWith("'")))) { $v = $v.Substring(1, $v.Length - 2) }
      $dict[$key] = $v
    }
  }
  return ,$dict
}
try {
  if (!(Test-Path -LiteralPath $localEnv -PathType Leaf)) { StopSafely 'Systems .env.local is missing.' }
  if (!(Test-Path -LiteralPath $vercelLink -PathType Leaf)) { StopSafely 'Systems Vercel project link is missing.' }
  $link = Get-Content -LiteralPath $vercelLink -Raw | ConvertFrom-Json
  if ($link.projectId -ne 'prj_aOGIngiUwln573CRkiL2V8hahkDa' -or $link.orgId -ne 'team_e56YApWrODerti5CipuX0VAc') { StopSafely 'Unexpected Vercel project/team; nothing changed.' }
  $local = ReadEnv $localEnv
  $dbUrl = [string]$local['DATABASE_URL']
  if ([string]::IsNullOrWhiteSpace($dbUrl)) { StopSafely 'Local Systems DATABASE_URL is missing. Cannot verify owner against local auth database.' }
  $vercel = Get-Command vercel.cmd -ErrorAction SilentlyContinue
  if (!$vercel) { $vercel = Get-Command vercel -ErrorAction SilentlyContinue }
  if (!$vercel) { StopSafely 'Vercel CLI not found.' }
  Write-Host 'Checking deployed owner setting; secret values will not be displayed...'
  Push-Location $project
  try {
    & $vercel.Source env pull $tempEnv --environment=production --yes 1>$null
    if ($LASTEXITCODE -ne 0) { StopSafely 'Vercel environment pull failed.' }
  } finally { Pop-Location }
  if (!(Test-Path -LiteralPath $tempEnv -PathType Leaf)) { StopSafely 'No downloaded Vercel configuration.' }
  $prod = ReadEnv $tempEnv
  $owner = [string]$prod['OPPORTUNITY_OWNER_ID']
  if ([string]::IsNullOrWhiteSpace($owner)) { StopSafely 'Production owner ID is unavailable. Cannot select an account automatically; no changes made.' }
  $existingOwner = [string]$local['OPPORTUNITY_OWNER_ID']
  if ($existingOwner -and $existingOwner -cne $owner) { StopSafely 'Local owner ID differs from production; no overwrite.' }
  # Verify the production owner is present, active and an admin in the exact DB used by local Systems.
  $js = @'
const fs = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const requireFromProject = createRequire(path.join(process.cwd(), 'package.json'));
const { Client } = requireFromProject('pg');
const envPath = process.argv[2];
const owner = process.env.RCENTZ_OWNER_CANDIDATE;
function readEnv(p) {
  const m = {};
  for (const l of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const a = l.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!a) continue;
    let v = a[2].trim();
    if (v.length > 1 && ((v[0] === '"' && v.at(-1) === '"') || (v[0] === "'" && v.at(-1) === "'"))) v = v.slice(1,-1);
    m[a[1]] = v;
  }
  return m;
}
(async () => {
  const env = readEnv(envPath);
  if (!env.DATABASE_URL || !owner) throw Error('Required owner or DB URL missing');
  const client = new Client({connectionString:env.DATABASE_URL, connectionTimeoutMillis:8000, statement_timeout:8000, application_name:'rcentz_local_owner_readonly'});
  try {
    await client.connect();
    await client.query('BEGIN READ ONLY');
    const q = await client.query('SELECT id, role, status FROM "user" WHERE id = $1 LIMIT 1', [owner]);
    await client.query('ROLLBACK');
    if (q.rowCount !== 1 || !['ADMIN','SUPER_ADMIN'].includes(q.rows[0].role) || q.rows[0].status !== 'ACTIVE') {
      console.log('STOP: Deployed owner does not match an ACTIVE admin in the local Systems database.');
      process.exitCode = 3;
      return;
    }
    console.log('PASS: Deployed owner exists as an active administrator in local Systems database.');
  } finally { await client.end().catch(()=>{}); }
})().catch(() => {console.error('STOP: Read-only owner verification failed. Check local database connection/pg package.'); process.exitCode=4;});
'@
  [System.IO.File]::WriteAllText($tempJS, $js, (New-Object System.Text.UTF8Encoding($false)))
  $env:RCENTZ_OWNER_CANDIDATE = $owner
  $oldNodeOptions = $env:NODE_OPTIONS
  $env:NODE_OPTIONS = ''
  try {
    Push-Location $project
    try { & node $tempJS $localEnv; $code = $LASTEXITCODE } finally { Pop-Location }
  } finally { $env:NODE_OPTIONS = $oldNodeOptions; Remove-Item Env:RCENTZ_OWNER_CANDIDATE -ErrorAction SilentlyContinue }
  if ($code -ne 0) { StopSafely 'Owner verification did not pass. Local env unchanged.' }
  if ($existingOwner -ceq $owner) {
    Write-Host 'PASS: Local owner already matches. No file changes.'
  } else {
    $archive = Join-Path $root '_Archive\Local-Env-Backups'
    [System.IO.Directory]::CreateDirectory($archive) | Out-Null
    $backup = Join-Path $archive ('.env.local.before-owner-repair-' + [guid]::NewGuid().ToString('N') + '.bak')
    Copy-Item -LiteralPath $localEnv -Destination $backup -ErrorAction Stop
    $content = [System.IO.File]::ReadAllText($localEnv)
    if ($content -match '(?m)^\s*(?:export\s+)?OPPORTUNITY_OWNER_ID\s*=') {
      $content = [regex]::Replace($content, '(?m)^\s*(?:export\s+)?OPPORTUNITY_OWNER_ID\s*=.*$', 'OPPORTUNITY_OWNER_ID=' + $owner)
    } else { $content = $content.TrimEnd("`r", "`n") + "`r`nOPPORTUNITY_OWNER_ID=" + $owner + "`r`n" }
    [System.IO.File]::WriteAllText($localEnv, $content, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host 'PASS: Owner setting added to .env.local, with private backup.'
  }
  Write-Host 'NEXT: Restart local Systems server on port 3001, then open /admin/opportunities.'
  Write-Host 'NOTE: This repairs owner gating only. API signing remains unconfigured.'
} catch {
  $msg = [string]$_.Exception.Message
  if ($msg.StartsWith('STOP:')) { Write-Host $msg -ForegroundColor Yellow } else { Write-Host 'STOP: Local repair failed; configuration not intentionally changed.' -ForegroundColor Red }
  exit 1
} finally {
  if (Test-Path -LiteralPath $tempEnv -PathType Leaf) { Remove-Item -LiteralPath $tempEnv -Force -ErrorAction SilentlyContinue }
  if (Test-Path -LiteralPath $tempJS -PathType Leaf) { Remove-Item -LiteralPath $tempJS -Force -ErrorAction SilentlyContinue }
}
