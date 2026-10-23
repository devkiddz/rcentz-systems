'use client';
import { useEffect, useState, useTransition } from 'react';
import { listProjectSources, registerProjectSource, setProjectSourceEnabled } from '@/features/admin/server/projects/project-delivery-source-actions';
import type { RegisteredSource } from '@/server/rcentz-api/delivery-source-client';

export function ProjectDevelopmentSources({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<RegisteredSource[]>([]);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();
  const field = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground';
  async function reload() {
    const result = await listProjectSources(projectId);
    if (result.success) setItems(result.sources ?? []);
    else setMessage(result.message);
  }
  useEffect(() => { void reload(); }, [projectId]);
  return <section className="space-y-4 rounded-2xl border border-border bg-surface p-5" aria-label="GitHub development sources">
    <div><h2 className="text-base font-semibold">GitHub development sources</h2><p className="mt-1 text-xs text-muted">Connect repositories to automate milestone evidence. Rcentz API owns the source records.</p></div>
    {message && <p role="status" className="text-xs text-foreground">{message}</p>}
    <ul className="space-y-2">{items.map(s => <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm">
      <div className="min-w-0"><p className="font-medium break-all">{s.repository} · {s.branch}</p><p className="text-xs text-muted">{s.enabled ? 'Enabled' : 'Disabled'} · Cursor {s.cursorSha.slice(0,7)}{s.lastError ? ` · ${s.lastError}` : ''}</p></div>
      <button type="button" disabled={pending} className="rounded-lg border border-border px-3 py-2 text-xs disabled:opacity-50" onClick={() => startTransition(async () => { const result = await setProjectSourceEnabled(projectId, s.id, !s.enabled); setMessage(result.message); if (result.success) await reload(); })}>{s.enabled ? 'Disable' : 'Enable'}</button>
    </li>)}</ul>
    <form className="grid gap-3 sm:grid-cols-2" action={data => startTransition(async () => { const result = await registerProjectSource(projectId, data); setMessage(result.message); if (result.success) await reload(); })}>
      <label className="text-xs font-medium">Repository (owner/name)<input className={field} name="repository" required maxLength={180} placeholder="devkiddz/rcentz-systems" /></label>
      <label className="text-xs font-medium">Branch<input className={field} name="branch" required defaultValue="main" maxLength={120} /></label>
      <label className="text-xs font-medium">Required GitHub checks (comma-separated; optional when Vercel is configured)<input className={field} name="requiredChecks" placeholder="CI / build, lint" maxLength={2400} /></label>
      <label className="text-xs font-medium">Vercel project ID (optional)<input className={field} name="vercelProjectId" placeholder="prj_..." maxLength={128} /></label>
      <label className="text-xs font-medium">Vercel team ID (optional)<input className={field} name="vercelTeamId" placeholder="team_..." maxLength={128} /></label>
      <div className="sm:col-span-2"><button disabled={pending} type="submit" className="rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background disabled:opacity-50">{pending ? 'Working…' : 'Connect repository'}</button></div>
    </form>
    <p className="text-xs text-muted">The API captures the current branch head as the baseline. Earlier commits are not imported. Sources require an authorized super-admin identity and a working API connection.</p>
  </section>;
}
