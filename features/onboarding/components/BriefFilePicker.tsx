"use client";
import { useEffect, useRef } from "react";
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
      alt={"Sample reference: " + file.name}
      className="aspect-video w-full object-contain"
    />
  );
}
export function BriefFilePicker({
  files,
  onChange,
  configured,
  remaining = 5,
  disabled = false,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  configured: boolean;
  disabled?: boolean;
  remaining?: number;
}) {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-surface-subtle p-5">
      <h2 className="text-base font-semibold">
        Documents & visual references{" "}
        <span className="text-xs font-normal text-muted-foreground">
          Optional
        </span>
      </h2>
      <p className="mt-2 text-xs leading-6 text-muted-foreground">
        Share a PDF brief or a sample image of the look you have in mind. Up to
        5 files, 2 MB each. PDF, PNG, JPEG and WebP.
      </p>
      <label className="mt-4 block text-sm font-medium" htmlFor="brief-files">
        Choose project documents or sample pictures
      </label>
      <input
        id="brief-files"
        type="file"
        multiple
        accept="application/pdf,image/png,image/jpeg,image/webp"
        disabled={!configured || disabled || remaining === 0}
        onChange={(event) =>
          onChange(Array.from(event.target.files || []).slice(0, remaining))
        }
        className="mt-2 block w-full text-xs file:mr-3 file:min-h-11 file:rounded-full file:border-0 file:bg-foreground file:px-4 file:text-background disabled:opacity-50"
      />
      {remaining === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          This brief already has five files attached.
        </p>
      ) : null}
      {!configured ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Uploads will be available when private file storage is connected. You
          can save your brief now and add files later.
        </p>
      ) : null}
      {files.length ? (
        <ul className="mt-4 space-y-2 text-xs">
          {files.map((file, index) => (
            <li
              key={file.name + index}
              className="flex items-center justify-between gap-3"
            >
              <span className="break-all">
                {file.name} · {(file.size / 1024).toFixed(0)} KB{" "}
                {file.size > 2 * 1024 * 1024 ? "— too large" : ""}
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
      {files.some((file) => file.type.startsWith("image/")) ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {files
            .filter((file) => file.type.startsWith("image/"))
            .map((file, index) => (
              <div
                key={file.name + index}
                className="overflow-hidden rounded-xl border border-border bg-background"
              >
                <SamplePreview file={file} />
              </div>
            ))}
        </div>
      ) : null}
    </section>
  );
}
