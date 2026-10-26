'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import {
  listProjectSources,
  registerProjectSource,
  setProjectSourceEnabled
} from '@/features/admin/server/projects/project-delivery-source-actions';
import type { RegisteredSource } from '@/server/rcentz-api/delivery-source-client';

export function ProjectDevelopmentSources({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<RegisteredSource[]>([]);
  const [message, setMessage] = useState('');
  const [kind, setKind] = useState<'success' | 'error' | 'info'>('info');
  const [pending, startTransition] = useTransition();
  const [requirements, setRequirements] = useState({ checks: '', vercelProjectId: '' });
  const field = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground';

  const reload = useCallback(async (): Promise<RegisteredSource[] | null> => {
    const result = await listProjectSources(projectId);
    if (!result.success) {
      setKind('error');
      setMessage(`Cannot load development sources: ${result.message}`);
      return null;
    }
    const sources = result.sources ?? [];
    setItems(sources);
    return sources;
  }, [projectId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const meetsGate = Boolean(requirements.checks.split(',').some(x => x.trim())) || Boolean(requirements.vercelProjectId.trim());

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-surface p-5" aria-label="GitHub development sources">
      <div>
        <h2 className="text-base font-semibold">GitHub development sources</h2>
        <p className="mt-1 text-xs text-muted">Connect repositories to automate milestone evidence. Rcentz API owns the source records.</p>
      </div>

      {message ? (
        <p role={kind === 'error' ? 'alert' : 'status'} aria-live="polite" className={kind === 'error'
          ? 'rounded-lg border border-[var(--chart-danger)] px-3 py-2 text-sm text-foreground'
          : 'rounded-lg border border-border px-3 py-2 text-sm text-foreground'}>
          {message}
        </p>
      ) : null}

      <ul className="space-y-2">
        {items.map(source => (
          <li key={source.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm">
            <div className="min-w-0">
              <p className="break-all font-medium">{source.repository} · {source.branch}</p>
              <p className="text-xs text-muted">
                {source.enabled ? 'Enabled' : 'Disabled'} · Cursor {source.cursorSha.slice(0, 7)}
                {source.lastError ? ` · ${source.lastError}` : ''}
              </p>
            </div>
            <button
              type="button"
              disabled={pending}
              className="rounded-lg border border-border px-3 py-2 text-xs disabled:opacity-50"
              onClick={() => startTransition(async () => {
                const result = await setProjectSourceEnabled(projectId, source.id, !source.enabled);
                setKind(result.success ? 'success' : 'error');
                setMessage(result.message);
                if (result.success) await reload();
              })}>
              {source.enabled ? 'Disable' : 'Enable'}
            </button>
          </li>
        ))}
      </ul>

      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={event => {
          event.preventDefault();
          const form = event.currentTarget;
          const data = new FormData(form);
          const repository = String(data.get('repository') ?? '').trim().toLowerCase();
          const branch = String(data.get('branch') ?? '').trim();
          const checks = String(data.get('requiredChecks') ?? '').trim();
          const vercelId = String(data.get('vercelProjectId') ?? '').trim();

          if (!checks && !vercelId) {
            setKind('error');
            setMessage('Enter at least one required GitHub check or a Vercel project ID before connecting.');
            return;
          }
          if (items.some(item => item.repository.toLowerCase() === repository && item.branch === branch)) {
            setKind('error');
            setMessage('This repository and branch already appear in the connected sources above. Connect does not replace an existing source.');
            return;
          }
          setKind('info');
          setMessage(`Connecting ${repository} · ${branch}…`);
          startTransition(async () => {
            const result = await registerProjectSource(projectId, data);
            if (!result.success) {
              setKind('error');
              setMessage(result.message);
              return;
            }
            const updated = await reload();
            if (!updated) return;
            const confirmed = updated.some(item => item.repository.toLowerCase() === repository && item.branch === branch);
            setKind(confirmed ? 'success' : 'error');
            setMessage(confirmed
              ? `Connected ${repository} · ${branch}. Tracking starts at the recorded branch baseline.`
              : 'The API accepted registration, but the new source is not visible in the returned list. Refresh and check the connection before continuing.');
            if (confirmed) form.reset();
            if (confirmed) setRequirements({ checks: '', vercelProjectId: '' });
          });
        }}>
        <label className="text-xs font-medium">
          Repository (owner/name)
          <input className={field} name="repository" required maxLength={180} placeholder="devkiddz/dennis.rcentz.cc" />
        </label>
        <label className="text-xs font-medium">
          Branch
          <input className={field} name="branch" required defaultValue="main" maxLength={120} />
        </label>
        <label className="text-xs font-medium">
          Required GitHub checks (at least one check or Vercel project ID is required)
          <input
            className={field}
            name="requiredChecks"
            maxLength={2400}
            placeholder="CI / build, lint"
            value={requirements.checks}
            onChange={event => setRequirements(value => ({ ...value, checks: event.target.value }))}
          />
        </label>
        <label className="text-xs font-medium">
          Vercel project ID (required if GitHub checks are empty)
          <input
            className={field}
            name="vercelProjectId"
            maxLength={128}
            placeholder="prj_..."
            value={requirements.vercelProjectId}
            onChange={event => setRequirements(value => ({ ...value, vercelProjectId: event.target.value }))}
          />
        </label>
        <label className="text-xs font-medium">
          Vercel team ID (optional)
          <input className={field} name="vercelTeamId" maxLength={128} placeholder="team_..." />
        </label>
        <div className="sm:col-span-2">
          <p className="mb-2 text-xs text-muted">
            {meetsGate
              ? 'Source verification requirement supplied.'
              : 'To connect, supply a real GitHub check name or the Vercel project ID. Both cannot be empty.'}
          </p>
          <button disabled={pending || !meetsGate} type="submit" className="rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background disabled:cursor-not-allowed disabled:opacity-50">
            {pending ? 'Connecting…' : 'Connect repository'}
          </button>
        </div>
      </form>
      <p className="text-xs text-muted">The API captures the current branch head as the baseline. Earlier commits are not imported. Sources require an authorized super-admin identity and a working API connection.</p>
    </section>
  );
}
