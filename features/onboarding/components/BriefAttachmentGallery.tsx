'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Download, FileText, LoaderCircle, Pencil, Trash2, X } from 'lucide-react';

type Attachment = {
  id: string;
  name: string;
  type: string;
  size: number;
};

type Props = {
  requestId: string;
  initialFiles: Attachment[];
  editable: boolean;
};

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const permitted = new Set(['application/pdf', 'image/png', 'image/jpeg', 'image/webp']);

export function BriefAttachmentGallery({ requestId, initialFiles, editable }: Props) {
  const [files, setFiles] = useState(initialFiles);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const closeButton = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const activeFile = files.find(file => file.id === activeId);

  useEffect(() => {
    if (!activeId) return;
    closeButton.current?.focus();
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setActiveId(null); };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [activeId]);

  const attachmentUrl = (id: string, preview = false) =>
    `/api/project-briefs/${encodeURIComponent(requestId)}/files/${encodeURIComponent(id)}` + (preview ? '?preview=1' : '');

  async function replaceFile(id: string, file: File) {
    if (!editable || workingId) return;
    setError('');
    setNotice('');
    if (file.size === 0 || file.size > MAX_FILE_SIZE || !permitted.has(file.type)) {
      setError('Choose a PDF, PNG, JPEG or WebP file that is 2 MB or smaller.');
      return;
    }
    if (!window.confirm(`Replace this attachment with "${file.name}"? The current attachment will be removed.`)) return;
    setWorkingId(id);
    try {
      const form = new FormData();
      form.set('file', file);
      const response = await fetch(attachmentUrl(id), { method: 'PUT', body: form });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not replace this attachment.');
      setFiles(current => current.map(item => item.id === id ? {
        id, name: result.name, type: result.type, size: result.size
      } : item));
      setActiveId(null);
      setNotice(result.cleanupPending ? 'Attachment replaced. Old storage cleanup needs administrator attention.' : 'Attachment replaced successfully.');
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not replace this attachment.');
    } finally {
      setWorkingId(null);
    }
  }

  async function deleteFile(file: Attachment) {
    if (!editable || workingId) return;
    if (!window.confirm(`Remove "${file.name}" from your project brief? This cannot be undone.`)) return;
    setError('');
    setNotice('');
    setWorkingId(file.id);
    try {
      const response = await fetch(attachmentUrl(file.id), { method: 'DELETE' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not remove this attachment.');
      setFiles(current => current.filter(item => item.id !== file.id));
      if (activeId === file.id) setActiveId(null);
      setNotice(result.cleanupPending ? 'Attachment removed from this brief. Storage cleanup needs administrator attention.' : 'Attachment removed from this brief.');
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not remove this attachment.');
    } finally {
      setWorkingId(null);
    }
  }

  if (files.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <FileText aria-hidden="true" className="mx-auto size-7 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">No reference files yet</p>
        <p className="mt-1 text-xs text-muted-foreground">Reference files are optional. You can add up to five while your brief is editable.</p>
        {editable ? <a className="mt-4 inline-flex min-h-10 items-center font-medium text-theme-accent underline" href={`/dashboard/onboarding/${requestId}`}>Edit brief to add files</a> : null}
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">{files.length} of 5 attachments · Max 2 MB each</p>
        {editable ? <a href={`/dashboard/onboarding/${requestId}`} className="text-xs font-medium text-theme-accent underline underline-offset-4">Add more files in Edit</a> : null}
      </div>
      {error ? <p role="alert" className="mb-4 rounded-xl border border-destructive/40 p-3 text-sm text-destructive">{error}</p> : null}
      {notice ? <p role="status" className="mb-4 rounded-xl border border-border p-3 text-sm">{notice}</p> : null}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {files.map(file => {
          const previewable = file.type.startsWith('image/');
          const busy = workingId === file.id;
          return (
            <li key={file.id} className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface-subtle">
              <button
                type="button"
                disabled={Boolean(workingId)}
                onClick={() => setActiveId(file.id)}
                aria-label={`Preview ${file.name}`}
                className="flex aspect-square w-full items-center justify-center overflow-hidden bg-background transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {previewable ? (
                  <Image unoptimized src={attachmentUrl(file.id, true)} alt={file.name} width={240} height={240} className="h-full w-full object-cover" />
                ) : (
                  <FileText aria-hidden="true" className="size-9 text-theme-accent" />
                )}
              </button>
              <div className="space-y-2 p-3">
                <p className="truncate text-xs font-semibold" title={file.name}>{file.name}</p>
                <p className="text-[11px] text-muted-foreground">{Math.ceil(file.size / 1024)} KB · {previewable ? 'Image' : 'PDF'}</p>
                <a href={attachmentUrl(file.id)} className="inline-flex min-h-9 items-center gap-1 text-xs font-medium text-theme-accent underline underline-offset-4">
                  <Download aria-hidden="true" className="size-3" /> Download
                </a>
                {editable ? (
                  <div className="flex flex-wrap items-center gap-2 border-t border-border pt-2">
                    <label className="inline-flex min-h-9 cursor-pointer items-center gap-1 text-[11px] font-semibold hover:underline">
                      <Pencil aria-hidden="true" className="size-3" /> Replace
                      <input
                        type="file" className="sr-only" disabled={Boolean(workingId)}
                        accept="application/pdf,image/png,image/jpeg,image/webp"
                        onChange={event => {
                          const selected = event.currentTarget.files?.[0];
                          if (selected) void replaceFile(file.id, selected);
                          event.currentTarget.value = '';
                        }}
                        aria-label={`Replace ${file.name}`}
                      />
                    </label>
                    <button type="button" disabled={Boolean(workingId)} onClick={() => void deleteFile(file)} className="inline-flex min-h-9 items-center gap-1 text-[11px] font-semibold text-destructive hover:underline disabled:opacity-50">
                      {busy ? <LoaderCircle aria-hidden="true" className="size-3 animate-spin" /> : <Trash2 aria-hidden="true" className="size-3" />} Remove
                    </button>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      {activeFile ? (
        <div role="dialog" aria-modal="true" aria-label={`Preview ${activeFile.name}`} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 sm:p-8">
          <div className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-border p-4">
              <p className="min-w-0 truncate text-sm font-semibold">{activeFile.name}</p>
              <button type="button" ref={closeButton} onClick={() => setActiveId(null)} className="inline-flex min-h-10 items-center gap-1 rounded-full border border-border px-3 text-xs font-medium">
                <X aria-hidden="true" className="size-4" /> Close
              </button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-surface-subtle p-4">
              {activeFile.type.startsWith('image/') ? (
                <Image unoptimized src={attachmentUrl(activeFile.id, true)} alt={activeFile.name} width={1100} height={750} className="max-h-[65vh] w-auto max-w-full object-contain" />
              ) : (
                <div className="space-y-4 text-center">
                  <FileText aria-hidden="true" className="mx-auto size-12 text-theme-accent" />
                  <p className="text-sm">PDF document</p>
                  <p className="text-xs text-muted-foreground">Download to review this private PDF.</p>
                  <a href={attachmentUrl(activeFile.id)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background">
                    <Download aria-hidden="true" className="size-4" /> Download PDF
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
