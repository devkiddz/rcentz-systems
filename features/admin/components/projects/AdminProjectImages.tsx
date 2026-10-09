'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

async function cropImage(url: string, area: Area) {
  const image = new window.Image();
  image.src = url;
  await image.decode();
  const canvas = document.createElement('canvas');
  const factor = Math.min(1, 1920 / Math.max(area.width, area.height));
  canvas.width = Math.max(1, Math.round(area.width * factor));
  canvas.height = Math.max(1, Math.round(area.height * factor));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Image editing is unavailable in this browser.');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
  for (const quality of [0.92, 0.8, 0.65]) {
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (blob && blob.size <= 2 * 1024 * 1024) return blob;
  }
  throw new Error('This image is too large. Choose a smaller crop or image.');
}

export function AdminProjectImages({ projectId, images, configured }: { projectId: string; images: { id: string; url: string; alt: string | null }[]; configured: boolean }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const replacement = useRef<string | null>(null);
  const pixels = useRef<Area | null>(null);
  const [selection, setSelection] = useState<{ url: string; name: string; replaceId: string | null } | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(16 / 9);
  const [ready, setReady] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    const url = selection?.url;
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [selection?.url]);
  function choose(id: string | null) { replacement.current = id; input.current?.click(); }
  async function save() {
    if (!selection || !pixels.current || busy) return;
    setBusy(true); setMessage('');
    try {
      const blob = await cropImage(selection.url, pixels.current);
      const form = new FormData();
      form.set('file', blob, selection.name.replace(/\.[^.]+$/, '') + '.jpg');
      if (selection.replaceId) form.set('replaceId', selection.replaceId);
      const response = await fetch(`/api/admin/projects/${projectId}/images`, { method: 'POST', body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Upload failed.');
      setSelection(null); setMessage(selection.replaceId ? 'Project image replaced.' : 'Project image saved.'); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Upload failed.'); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!deleting || busy) return;
    setBusy(true); setMessage('');
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/images/${deleting}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Deletion failed.');
      setDeleting(null); setMessage('Project image deleted.'); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Deletion failed.'); }
    finally { setBusy(false); }
  }
  const button = 'min-h-10 rounded-lg border border-border px-4 text-xs font-semibold disabled:opacity-50';
  return <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
    <h2 className="text-sm font-semibold">Project images</h2>
    <p className="mt-2 text-xs leading-5 text-muted">Screenshots are private to the client and administrators. The first image appears in the customer preview.</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-3">
      {images.map((image, index) => <div key={image.id} className="overflow-hidden rounded-xl border border-border">
        <a href={image.url} target="_blank" rel="noreferrer" aria-label={`Open project image ${index + 1}`} className="relative block aspect-video focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Image src={image.url} alt={image.alt || 'Project screenshot'} fill unoptimized className="object-cover" />
        </a>
        <div className="flex flex-wrap gap-2 p-2">
          <button type="button" disabled={busy || !configured} className={button} onClick={() => choose(image.id)}>Replace</button>
          <button type="button" disabled={busy} className={button} onClick={() => setDeleting(image.id)}>Delete</button>
        </div>
      </div>)}
    </div>
    <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" aria-label="Choose project image" onChange={event => {
      const file = event.target.files?.[0]; event.target.value = '';
      if (!file) return;
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 20 * 1024 * 1024) { setMessage('Choose PNG, JPEG or WebP up to 20 MB.'); return; }
      pixels.current = null; setReady(false); setCrop({ x: 0, y: 0 }); setZoom(1); setAspect(16 / 9); setMessage('');
      setSelection({ url: URL.createObjectURL(file), name: file.name, replaceId: replacement.current });
    }} />
    <button type="button" onClick={() => choose(null)} disabled={busy || !configured || images.length >= 12} className={button + ' mt-4 bg-foreground text-background'}>Add project image</button>
    {!configured && <p className="mt-3 text-xs text-muted">Connect the existing Cloudinary account to enable project uploads.</p>}
    <p role="status" className="mt-3 text-xs">{message}</p>
    <Dialog open={Boolean(selection)} onOpenChange={open => { if (!open && !busy) setSelection(null); }}>
      <DialogContent className="sm:max-w-xl" showCloseButton={!busy}>
        <DialogTitle>Crop project image</DialogTitle>
        <DialogDescription>Drag to position your image, then adjust the zoom.</DialogDescription>
        <div className="relative h-[min(45vh,320px)] overflow-hidden rounded-lg bg-black">
          {selection && <Cropper image={selection.url} crop={crop} zoom={zoom} aspect={aspect} onCropChange={setCrop} onZoomChange={setZoom} onCropAreaChange={(_, area) => { pixels.current = area; setReady(true); }} zoomWithScroll={false} mediaProps={{ onError: () => { setReady(false); setMessage('This image could not be opened. Choose another image.'); } }} />}
        </div>
        <label className="text-xs font-medium">Zoom<input type="range" min="1" max="3" step="0.01" value={zoom} disabled={busy} onChange={event => setZoom(Number(event.target.value))} className="mt-2 w-full" /></label>
        <label className="text-xs font-medium">Shape<select value={aspect} disabled={busy} onChange={event => { setReady(false); setAspect(Number(event.target.value)); }} className="ml-3 rounded-md border border-border bg-background p-2"><option value={16 / 9}>Wide</option><option value={4 / 3}>Landscape</option><option value={1}>Square</option></select></label>
        <p role="status" className="text-xs">{message}</p>
        <div className="flex justify-end gap-2"><button className={button} disabled={busy} onClick={() => setSelection(null)}>Cancel</button><button className={button + ' bg-foreground text-background'} disabled={busy || !ready} onClick={save}>{busy ? 'Saving…' : 'Crop and save'}</button></div>
      </DialogContent>
    </Dialog>
    <Dialog open={Boolean(deleting)} onOpenChange={open => { if (!open && !busy) setDeleting(null); }}>
      <DialogContent showCloseButton={!busy}><DialogTitle>Delete project image?</DialogTitle><DialogDescription>This removes the image from the project. If it is the preview image, the next image becomes the preview.</DialogDescription><p role="status">{message}</p><div className="flex justify-end gap-2"><button className={button} disabled={busy} onClick={() => setDeleting(null)}>Cancel</button><button className={button} disabled={busy} onClick={remove}>{busy ? 'Deleting…' : 'Delete image'}</button></div></DialogContent>
    </Dialog>
  </section>;
}
