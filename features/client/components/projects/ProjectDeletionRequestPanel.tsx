'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { formatProjectDeletionStatus } from '@/features/projects/lib/deletion';

type ExistingRequest = {
  id: string;
  status: string;
  reason: string | null;
  resolutionNotes: string | null;
  createdAt: string;
} | null;

async function readApiResponse(response: Response): Promise<{ error?: string; code?: string }> {
  const body = await response.text();
  if (!body) return {};
  try {
    const parsed: unknown = JSON.parse(body);
    if (parsed && typeof parsed === 'object') {
      const object = parsed as { error?: unknown; code?: unknown };
      return {
        error: typeof object.error === 'string' ? object.error : undefined,
        code: typeof object.code === 'string' ? object.code : undefined
      };
    }
  } catch {
    // Next.js sometimes returns HTML error pages. Do not label these a network outage.
  }
  return { error: `Server returned a non-JSON response (HTTP ${response.status}). Check the development terminal.` };
}

export function ProjectDeletionRequestPanel({
  projectId,
  previous
}: {
  projectId: string;
  previous: ExistingRequest;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const pending = submitted || previous?.status === 'PENDING' || previous?.status === 'IN_PROGRESS';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const trimmed = reason.trim();
    if (trimmed.length < 20 || trimmed.length > 1500) {
      setError('Please explain your request in 20 to 1,500 characters.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/deletion-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: trimmed })
      });
      const result = await readApiResponse(response);
      if (!response.ok) {
        setError(result.error || `Request failed (HTTP ${response.status}). Check the development terminal.`);
        return;
      }
      setSubmitted(true);
      setExpanded(false);
      router.refresh();
    } catch {
      setError('Unable to reach the server. Check the network and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto mt-8 max-w-6xl rounded-2xl border border-border bg-background p-5 sm:p-7" aria-label="Project deletion">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Trash2 aria-hidden="true" className="size-4" /> Project deletion
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            If you no longer need this project, you can request its removal.
            A Rcentz administrator must review and approve your request.
            Your project and its records are not deleted when you submit this form.
          </p>
        </div>
        {!pending && previous?.status !== 'RESOLVED' ? (
          <button type="button" onClick={() => setExpanded(value => !value)}
            className="inline-flex min-h-11 items-center rounded-xl border border-destructive/30 px-4 text-sm font-semibold text-destructive hover:bg-destructive/5">
            {expanded ? 'Cancel request' : 'Delete project'}
          </button>
        ) : null}
      </div>

      {pending ? (
        <div role="status" className="mt-5 rounded-xl border border-border bg-surface-subtle p-4 text-sm">
          <p className="font-semibold">Pending admin review</p>
          <p className="mt-1 text-muted-foreground">Your deletion request has been submitted. No project records have been removed.</p>
          {previous?.reason ? <p className="mt-3 whitespace-pre-wrap break-words">Reason: {previous.reason}</p> : null}
        </div>
      ) : previous ? (
        <div className="mt-4 rounded-xl border border-border bg-surface-subtle p-4 text-sm">
          <p className="font-semibold">Previous request: {formatProjectDeletionStatus(previous.status)}</p>
          {previous.resolutionNotes ? <p className="mt-2 whitespace-pre-wrap text-muted-foreground">Admin response: {previous.resolutionNotes}</p> : null}
        </div>
      ) : null}

      {expanded && !pending ? (
        <form onSubmit={submit} className="mt-5 space-y-4 rounded-xl border border-border p-4 sm:p-5">
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            Explain why you want this project removed. This is a request for approval, not an immediate deletion.
          </p>
          <div>
            <label htmlFor="project-deletion-reason" className="text-sm font-semibold">Reason for deletion (required)</label>
            <textarea id="project-deletion-reason" name="reason" value={reason}
              onChange={event => setReason(event.target.value)}
              required minLength={20} maxLength={1500} rows={4}
              placeholder="Tell us why you no longer want this project in your workspace..."
              className="mt-2 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            <p className="mt-1 text-xs text-muted-foreground">{reason.trim().length} / 1,500 characters · Minimum 20.</p>
          </div>
          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
          <button type="submit" disabled={busy || reason.trim().length < 20}
            className="inline-flex min-h-11 items-center rounded-xl bg-foreground px-5 text-sm font-semibold text-background disabled:opacity-50">
            {busy ? 'Sending request...' : 'Send deletion request'}
          </button>
        </form>
      ) : null}
      {!expanded && !pending && error ? <p role="alert" className="mt-3 text-sm text-destructive">{error}</p> : null}
    </section>
  );
}
