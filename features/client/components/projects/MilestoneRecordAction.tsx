'use client';

import { useState, useTransition } from 'react';

import { Check, Download, FileCheck2, FileClock, MailCheck, RefreshCw } from 'lucide-react';

import { useRouter } from 'next/navigation';

import { requestMilestoneRecord } from '@/features/client/server/projects/request-milestone-record';

type RecordState = {
  id: string;

  status: 'REQUESTED' | 'PREPARING' | 'READY' | 'SENT' | 'FAILED' | 'CANCELLED';

  version: number;

  recipientEmail: string;

  pdfUrl: string | null;

  requestedAt: Date | string;
  sentAt: Date | string | null;
} | null;

type MilestoneRecordActionProps = {
  projectId: string;
  milestoneId: string;

  milestoneStatus: string;

  record: RecordState;
};

export function MilestoneRecordAction({
  projectId,
  milestoneId,
  milestoneStatus,
  record
}: MilestoneRecordActionProps) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const [message, setMessage] = useState<string | null>(null);

  if (milestoneStatus !== 'COMPLETED') {
    return <span className="text-[10px] text-muted-foreground">Record after completion</span>;
  }

  if (record) {
    switch (record.status) {
      case 'REQUESTED':
        return (
          <RecordStatus icon={FileClock} label="Record requested" description="Awaiting Rcentz review" />
        );

      case 'PREPARING':
        return <RecordStatus icon={RefreshCw} label="Preparing" description="Record is being finalized" />;

      case 'READY':
      case 'SENT':
        if (record.pdfUrl) {
          return (
            <a
              href={record.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-[11px] font-semibold text-foreground transition-colors hover:border-theme-accent/30 hover:text-theme-accent">
              <Download aria-hidden="true" className="size-3.5" />
              Download copy
            </a>
          );
        }

        if (record.status === 'READY') {
          return <RecordStatus icon={FileCheck2} label="Ready" description="Available for review" />;
        }

        return (
          <RecordStatus
            icon={MailCheck}
            label="Record sent"
            description={`Sent to ${record.recipientEmail}`}
          />
        );

      case 'FAILED':
        return (
          <RecordStatus icon={RefreshCw} label="Delivery issue" description="Rcentz is reviewing delivery" />
        );

      default:
        break;
    }
  }

  function handleRequest() {
    setMessage(null);

    startTransition(async () => {
      const result = await requestMilestoneRecord({
        projectId,
        milestoneId
      });

      if (!result.ok) {
        setMessage(result.message);

        return;
      }

      setMessage(`Requested for ${result.recipientEmail}`);

      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-start gap-1.5 lg:items-end">
      <button
        type="button"
        disabled={isPending}
        onClick={handleRequest}
        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-[11px] font-semibold text-foreground transition-colors hover:border-theme-accent/30 hover:text-theme-accent disabled:cursor-not-allowed disabled:opacity-60">
        {isPending ? (
          <RefreshCw aria-hidden="true" className="size-3.5 animate-spin" />
        ) : (
          <FileCheck2 aria-hidden="true" className="size-3.5" />
        )}

        {isPending ? 'Requesting…' : 'Request record'}
      </button>

      {message ? <p className="max-w-[220px] text-[9px] leading-4 text-muted-foreground">{message}</p> : null}
    </div>
  );
}

function RecordStatus({
  icon: Icon,
  label,
  description
}: {
  icon: typeof Check;

  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-theme-accent/20 bg-theme-accent/5">
        <Icon aria-hidden="true" className="size-3 text-theme-accent" />
      </div>

      <div>
        <p className="text-[11px] font-semibold text-foreground">{label}</p>

        <p className="mt-0.5 text-[9px] leading-4 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
