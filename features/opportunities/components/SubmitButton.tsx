"use client";
import { useFormStatus } from "react-dom";
import { FinderButton } from "./FinderButton";
import { LoaderCircle } from "lucide-react";
export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <FinderButton type="submit" disabled={pending} aria-busy={pending}>
      {pending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" /> : null}
      {pending ? "Working…" : children}
    </FinderButton>
  );
}
