import { Check, FileText, Layers3, Rocket } from 'lucide-react';

export function BriefIllustration({
  step,
  title,
  company
}: {
  step: number;
  title: string;
  company: string;
}) {
  return (
    <div
      aria-hidden="true"
      className="rounded-2xl border border-border bg-surface-subtle p-5 sm:p-6"
    >
      <div className="flex items-center justify-between border-b border-border pb-4">
        <p className="text-xs font-semibold">Your project canvas</p>
        <span className="rounded-full bg-surface-muted px-2 py-1 text-[10px]">
          Draft
        </span>
      </div>
      <div className="my-7 rounded-xl border border-border bg-background p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-theme-accent-soft">
            <Layers3 className="size-5 text-theme-accent" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {title || 'Your next application'}
            </p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {company || 'Built around your business'}
            </p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2">
          {['Plan', 'Build', 'Launch'].map((label, index) => (
            <div
              key={label}
              className="rounded-lg border border-border p-3 text-center"
            >
              {index === 0 ? (
                <FileText className="mx-auto size-4 text-theme-accent" />
              ) : index === 1 ? (
                <Layers3 className="mx-auto size-4 text-muted-foreground" />
              ) : (
                <Rocket className="mx-auto size-4 text-muted-foreground" />
              )}
              <p className="mt-2 text-[10px]">{label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {[
          'What you want to build',
          'Your business and goals',
          'What you already have',
          'Budget and timing',
          'Review your brief'
        ].map((label, index) => (
          <div key={label} className="flex items-center gap-3 text-xs">
            <span
              className={[
                'flex size-6 items-center justify-center rounded-full border',
                index < step
                  ? 'border-theme-accent bg-theme-accent-soft text-theme-accent'
                  : index === step
                    ? 'border-foreground text-foreground'
                    : 'border-border text-muted-foreground'
              ].join(' ')}
            >
              {index < step ? <Check className="size-3" /> : index + 1}
            </span>
            <span
              className={
                index === step ? 'font-medium' : 'text-muted-foreground'
              }
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
