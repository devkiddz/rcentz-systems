'use client';

export default function AccountError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">
        We could not open your workspace.
      </h1>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        Please try again. If this continues, contact contact@rcentz.cc.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 min-h-11 rounded-full bg-foreground px-5 text-sm font-medium text-background"
      >
        Try again
      </button>
    </main>
  );
}
