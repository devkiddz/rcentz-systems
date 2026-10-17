'use client';
import { useEffect, useRef, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Camera, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

async function croppedAvatar(url: string, area: Area) {
  const image = new window.Image(); image.src = url; await image.decode();
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Image editing is unavailable in this browser.');
  context.fillStyle = '#ffffff'; context.fillRect(0, 0, 512, 512);
  context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, 512, 512);
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
  if (!blob || blob.size > 2 * 1024 * 1024) throw new Error('Choose a smaller photo.');
  return blob;
}
const action = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 text-xs font-semibold hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';
export function ClientAvatarEditor({ image, name, configured, updatedAt, disabled, onSaved, onBusyChange }: {
  image: string | null; name: string; configured: boolean; updatedAt: string | null; disabled: boolean;
  onSaved: (updatedAt: string) => void; onBusyChange: (busy: boolean) => void;
}) {
  const [photo, setPhoto] = useState(image);
  const [selection, setSelection] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 }); const [zoom, setZoom] = useState(1);
  const [busy, setBusy] = useState(false); const [ready, setReady] = useState(false);
  const [error, setError] = useState(''); const [message, setMessage] = useState(''); const [removing, setRemoving] = useState(false);
  const input = useRef<HTMLInputElement>(null); const pixels = useRef<Area | null>(null);
  useEffect(() => { return () => { if (selection) URL.revokeObjectURL(selection); }; }, [selection]);
  async function save(remove: boolean) {
    if (busy || disabled || !updatedAt || (!remove && (!selection || !pixels.current))) return;
    setBusy(true); onBusyChange(true); setError(''); setMessage('');
    try {
      let body: FormData | string;
      if (remove) body = JSON.stringify({ updatedAt });
      else {
        const file = await croppedAvatar(selection!, pixels.current!);
        body = new FormData(); body.set('file', file, 'avatar.jpg'); body.set('updatedAt', updatedAt);
      }
      const response = await fetch('/api/client/avatar', { method: remove ? 'DELETE' : 'POST', headers: remove ? { 'Content-Type': 'application/json' } : undefined, body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Your photo could not be saved.');
      setPhoto(result.image); setSelection(null); setRemoving(false); onSaved(result.updatedAt);
      setMessage(remove ? 'Profile photo removed.' : 'Profile photo saved.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Please try again.'); }
    finally { setBusy(false); onBusyChange(false); }
  }
  return <section aria-label="Profile photo" className="mb-6 border-b border-border pb-6">
    <div className="flex flex-wrap items-center gap-4">
      <Avatar className="size-16 ring-1 ring-border"><AvatarImage src={photo || undefined} alt={name + ' profile photo'} /><AvatarFallback className="bg-surface-muted text-lg">{name.trim().split(/\s+/).slice(0, 2).map(v => v[0]).join('').toUpperCase() || 'R'}</AvatarFallback></Avatar>
      <div className="min-w-0 flex-1"><h2 className="text-sm font-semibold">Profile photo</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">Your photo in your workspace and shared conversations.</p>
        <div className="mt-3 flex flex-wrap gap-2"><button type="button" className={action} disabled={busy || disabled || !configured} onClick={() => input.current?.click()}><Camera aria-hidden="true" className="size-4" />{photo ? 'Change photo' : 'Upload photo'}</button>{photo ? <button type="button" className={action} disabled={busy || disabled} onClick={() => { setError(''); setRemoving(true); }}><Trash2 aria-hidden="true" className="size-4" />Remove</button> : null}</div>
      </div>
    </div>
    <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" aria-label="Choose profile photo" className="hidden" onChange={event => {
      const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
      setError(''); setMessage('');
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 20 * 1024 * 1024) { setError('Choose PNG, JPEG or WebP up to 20 MB.'); return; }
      pixels.current = null; setReady(false); setCrop({ x: 0, y: 0 }); setZoom(1); setSelection(URL.createObjectURL(file));
    }} />
    {!configured ? <p className="mt-3 text-xs text-muted-foreground">Photo uploads are temporarily unavailable.</p> : null}
    {error && !selection && !removing ? <p role="alert" className="mt-3 text-xs text-destructive">{error}</p> : null}
    {message ? <p role="status" className="mt-3 text-xs text-theme-accent">{message}</p> : null}
    <Dialog open={Boolean(selection)} onOpenChange={open => { if (!open && !busy) setSelection(null); }}>
      <DialogContent className="sm:max-w-lg" showCloseButton={!busy}><DialogTitle>Crop profile photo</DialogTitle><DialogDescription>Drag your photo into position and adjust the zoom.</DialogDescription>
        <div className={'relative h-64 overflow-hidden rounded-xl bg-surface-muted ' + (busy ? 'pointer-events-none' : '')}>{selection ? <Cropper image={selection} crop={crop} zoom={zoom} aspect={1} cropShape="round" onCropChange={setCrop} onZoomChange={setZoom} onCropAreaChange={(_, area) => { pixels.current = area; setReady(true); }} zoomWithScroll={false} mediaProps={{ onError: () => { setReady(false); setError('This photo could not be opened. Choose another photo.'); } }} /> : null}</div>
        <label className="text-xs font-medium">Zoom<input type="range" min="1" max="3" step="0.01" value={zoom} disabled={busy} onChange={event => setZoom(Number(event.target.value))} className="mt-2 w-full accent-theme-accent" /></label>
        {error ? <p role="alert" className="text-xs text-destructive">{error}</p> : null}<div className="flex justify-end gap-2"><button type="button" className={action} disabled={busy} onClick={() => setSelection(null)}>Cancel</button><button type="button" className={action} disabled={busy || !ready} onClick={() => save(false)}>{busy ? 'Saving…' : 'Crop and save'}</button></div>
      </DialogContent>
    </Dialog>
    <Dialog open={removing} onOpenChange={open => { if (!busy) setRemoving(open); }}><DialogContent showCloseButton={!busy}><DialogTitle>Remove profile photo?</DialogTitle><DialogDescription>Your initials will appear in its place.</DialogDescription>{error ? <p role="alert" className="text-xs text-destructive">{error}</p> : null}<div className="flex justify-end gap-2"><button type="button" className={action} disabled={busy} onClick={() => setRemoving(false)}>Cancel</button><button type="button" className={action} disabled={busy} onClick={() => save(true)}>{busy ? 'Removing…' : 'Remove photo'}</button></div></DialogContent></Dialog>
  </section>;
}
