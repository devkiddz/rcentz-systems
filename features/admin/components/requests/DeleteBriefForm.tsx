'use client';

import { useActionState, useState } from 'react';
import { deleteAdminBrief, type DeleteBriefState } from '@/features/admin/server/requests/delete-brief';

const initialState: DeleteBriefState = { error: '' };

export function DeleteBriefForm({ id, title, unavailable }: {
  id: string;
  title: string;
  unavailable: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [state, action, pending] = useActionState(deleteAdminBrief, initialState);

  return (
    <section className="mx-auto mt-5 max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-destructive/20 bg-background p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Administrative brief removal</h2>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-muted-foreground">
              Only standalone briefs without a linked project, quote, billing or delivery record can be permanently deleted.
              The action is audited, the customer is notified, and managed attachments are cleaned up.
            </p>
          </div>
          <button type="button" disabled={unavailable} onClick={() => setExpanded(value => !value)}
            className="min-h-11 rounded-xl border border-destructive/30 px-4 text-sm font-semibold text-destructive disabled:cursor-not-allowed disabled:opacity-40">
            {expanded ? 'Cancel removal' : 'Delete brief'}
          </button>
        </div>
        {unavailable ? <p className="mt-2 text-xs text-muted-foreground">This brief has progressed beyond the eligible deletion stage.</p> : null}
        {expanded && !unavailable ? (
          <form action={action} className="mt-5 space-y-3 rounded-xl border border-border p-4">
            <input type="hidden" name="requestId" value={id} />
            <p className="text-sm">You are removing <strong>{title}</strong>. This cannot be undone.</p>
            <label htmlFor="delete-brief-confirm" className="block text-sm font-medium">Type DELETE to confirm</label>
            <input id="delete-brief-confirm" name="confirm" type="text" required pattern="DELETE"
              autoComplete="off" placeholder="DELETE"
              className="min-h-11 w-full max-w-sm rounded-xl border border-border bg-background px-3 text-sm" />
            {state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}
            <button type="submit" disabled={pending}
              className="min-h-11 rounded-xl bg-destructive px-4 text-sm font-semibold text-white disabled:opacity-50">
              {pending ? 'Removing brief...' : 'Permanently delete brief'}
            </button>
          </form>
        ) : null}
      </div>
    </section>
  );
}
