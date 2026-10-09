'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function AdminProjectImages({ projectId, images, configured }: { projectId: string; images: { id: string; url: string; alt: string | null }[]; configured: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true); setMessage('');
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/images`, { method: 'POST', body: new FormData(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Upload failed.');
      form.reset(); setMessage('Project image saved.'); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Upload failed.'); }
    finally { setBusy(false); }
  }
  return <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
    <h2 className="text-sm font-semibold">Project images</h2>
    <p className="mt-2 text-xs leading-5 text-muted">Screenshots are private to the client and administrators. The first image appears in the customer preview.</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-3">
      {images.map(image => <a key={image.id} href={image.url} target="_blank" rel="noreferrer" className="relative block aspect-video overflow-hidden rounded-lg border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Image src={image.url} alt={image.alt || 'Project screenshot'} fill unoptimized className="object-cover" />
      </a>)}
    </div>
    <form onSubmit={upload} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="flex-1 text-xs font-medium">Screenshot (PNG, JPEG or WebP, up to 2 MB)
        <input name="file" type="file" accept="image/png,image/jpeg,image/webp" required disabled={busy || !configured} className="mt-2 block w-full rounded-lg border border-border p-2 text-xs" />
      </label>
      <button type="submit" disabled={busy || !configured} className="min-h-10 shrink-0 rounded-lg bg-foreground px-4 text-xs font-semibold text-background disabled:opacity-50">{busy ? 'Uploading…' : 'Add project image'}</button>
    </form>
    {!configured && <p className="mt-3 text-xs text-muted">Connect private Blob storage with BLOB_READ_WRITE_TOKEN to enable uploads.</p>}
    <p role="status" className="mt-3 text-xs">{message}</p>
  </section>;
}
