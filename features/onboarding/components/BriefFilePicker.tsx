'use client';

import { useEffect, useRef, useState } from 'react';

function SamplePreview({ file }: { file: File }) {
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    if (image.current) image.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Browser-local files cannot be served through the Next image optimizer.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={image}
      alt={'Sample reference: ' + file.name}
      className="aspect-video w-full object-contain"
    />
  );
}

export function BriefFilePicker({
  files,
  onChange,
  configured,
  remaining = 5,
  disabled = false
}: {
  files: File[];
  onChange: (files: File[]) => void;
  configured: boolean;
  disabled?: boolean;
  remaining?: number;
}) {
  const [warning, setWarning] = useState('');

  return (
    <section className="rounded-2xl border border-border bg-surface-subtle p-5">
      <h2 className="text-base font-semibold">
        Reference documents &amp; screenshots
        <span className="ml-2 text-xs font-normal text-muted-foreground">Optional</span>
      </h2>
      <p className="mt-2 text-xs leading-6 text-muted-foreground">
        Select up to five images or PDFs in one go, or add them one after another.
        References are optional. Each file must be 2 MB or smaller, and files stay private.
      </p>

      {!configured ? (
        <p role="status" className="mt-4 rounded-xl border border-border bg-background p-3 text-xs leading-6 text-muted-foreground">
          Private document storage is not connected yet. You can submit your brief without files.
          Rcentz can arrange reference sharing during project review.
        </p>
      ) : null}

      <label className="mt-4 block text-sm font-medium" htmlFor="brief-files">
        Add PDF, PNG, JPG or WebP files
      </label>
      <input
        id="brief-files"
        type="file"
        multiple
        accept="application/pdf,image/png,image/jpeg,image/webp"
        disabled={!configured || disabled || remaining === 0}
        aria-describedby="brief-files-guidance"
        onChange={event => {
          const selected = Array.from(event.target.files || []);
          const known = new Set(files.map(file => `${file.name}:${file.size}:${file.lastModified}`));
          const additions = selected.filter(file => {
            const key = `${file.name}:${file.size}:${file.lastModified}`;
            if (known.has(key)) return false;
            known.add(key);
            return true;
          });
          const availableSlots = Math.max(0, remaining - files.length);
          const nextFiles = [...files, ...additions.slice(0, availableSlots)];
          setWarning(
            additions.length > availableSlots
              ? `You can add ${availableSlots} more ${availableSlots === 1 ? 'file' : 'files'}. Remove one or more attachments to make space.`
              : selected.length && !additions.length
                ? 'Those files are already selected.'
                : ''
          );
          onChange(nextFiles);
          event.target.value = '';
        }}
        className="mt-2 block w-full text-xs file:mr-3 file:min-h-11 file:rounded-full file:border-0 file:bg-foreground file:px-4 file:text-background disabled:opacity-50"
      />
      <p id="brief-files-guidance" className="mt-2 text-xs text-muted-foreground">
        PDF, PNG, JPEG and WebP only. Selected files upload when you submit or save the brief.
      </p>
      {remaining === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">This brief already has five files attached.</p>
      ) : null}
      {warning ? <p role="alert" className="mt-2 text-xs text-destructive">{warning}</p> : null}

      {configured ? (
        <p role="status" className="mt-3 text-xs font-medium text-muted-foreground">
          {files.length} of {remaining} available attachment slots selected. You may add files in several rounds.
        </p>
      ) : null}
      {files.length > 0 ? (
        <ul className="mt-4 space-y-2 text-xs">
          {files.map((file, index) => (
            <li key={file.name + index} className="flex items-center justify-between gap-3">
              <span className="break-all">
                {file.name} · {(file.size / 1024).toFixed(0)} KB
                {file.size > 2 * 1024 * 1024 ? ' — too large' : ''}
              </span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(files.filter((_, i) => i !== index))}
                className="min-h-11 shrink-0 underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {files.some(file => file.type.startsWith('image/')) ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {files.filter(file => file.type.startsWith('image/')).map((file, index) => (
            <div key={file.name + index} className="overflow-hidden rounded-xl border border-border bg-background">
              <SamplePreview file={file} />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
