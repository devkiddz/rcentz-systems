'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Trash2 } from 'lucide-react';

async function parseError(response: Response): Promise<string> {
  const text = await response.text();
  try {
    const data: unknown = JSON.parse(text);
    if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
      return data.error;
    }
  } catch {
    // A middleware/Next error may return HTML rather than JSON.
  }
  return `Server returned HTTP ${response.status}. Check the development terminal.`;
}

export function ClientBriefDeletionPanel({ requestId, title, removable }: {
  requestId: string;
  title: string;
  removable: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (confirm !== 'DELETE' || reason.trim().length < 20 || reason.trim().length > 1500) {
      setError('Enter a reason of at least 20 characters and type DELETE to confirm.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/project-briefs/${encodeURIComponent(requestId)}/deletion`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim(), confirm })
      });
      if (!response.ok) {
        setError(await parseError(response));
        return;
      }
      router.push('/dashboard/requests');
      router.refresh();
    } catch {
      setError('Unable to reach the server. No deletion was confirmed. Refresh the requests list before retrying.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="brief-deletion-heading" className="rounded-2xl border border-border bg-background p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <h2 id="brief-deletion-heading" className="flex items-center gap-2 text-base font-semibold">
            <Trash2 aria-hidden="true" className="size-4" /> Delete onboarding request
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            This permanently removes an eligible, standalone project brief and its references.
            A registered project or a brief linked to billing cannot be deleted here.
          </p>
        </div>
        {removable ? (
          <button type="button" onClick={() => { setOpen(value => !value); setError(''); }}
            className="inline-flex min-h-11 items-center rounded-xl border border-destructive/30 px-4 text-sm font-semibold text-destructive hover:bg-destructive/5">
            {open ? 'Keep this brief' : 'Delete brief'}
          </button>
        ) : null}
      </div>
      {!removable ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Deletion is unavailable because this request has entered review or has progressed beyond initial intake. Contact Rcentz administration if you need assistance.
        </p>
      ) : null}
      {removable && open ? (
        <form onSubmit={onDelete} className="mt-5 space-y-4 rounded-xl border border-border p-4 sm:p-5">
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            This action is permanent. Review the brief and uploaded references before confirming.
          </p>
          <p className="break-words text-sm font-medium">{title}</p>
          <div>
            <label htmlFor="brief-delete-reason" className="text-sm font-medium">Reason for deletion (required)</label>
            <textarea id="brief-delete-reason" required minLength={20} maxLength={1500} rows={3}
              value={reason} onChange={event => setReason(event.target.value)}
              placeholder="Explain why this brief should be removed..."
              className="mt-2 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            <p className="mt-1 text-xs text-muted-foreground">Minimum 20 characters, maximum 1,500.</p>
          </div>
          <div>
            <label htmlFor="brief-delete-confirm" className="text-sm font-medium">Type DELETE to confirm</label>
            <input id="brief-delete-confirm" value={confirm} onChange={event => setConfirm(event.target.value)}
              autoComplete="off" placeholder="DELETE"
              className="mt-2 block w-full max-w-sm rounded-xl border border-border bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
          <button type="submit" disabled={busy || confirm !== 'DELETE' || reason.trim().length < 20}
            className="inline-flex min-h-11 items-center rounded-xl bg-destructive px-5 text-sm font-semibold text-destructive-foreground disabled:opacity-50">
            {busy ? 'Removing brief...' : 'Permanently delete brief'}
          </button>
        </form>
      ) : null}
    </section>
  );
}
