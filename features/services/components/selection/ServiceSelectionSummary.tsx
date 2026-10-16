import type { ServiceSelection } from "../../lib/service-selection";
export function ServiceSelectionSummary({
  selection,
}: {
  selection: ServiceSelection;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="text-lg font-semibold">Requested service and features</h2>
      <p className="mt-2 break-words text-sm font-medium">
        {selection.serviceName}
      </p>
      {selection.features.length ? (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {selection.features.map((f) => (
            <li
              key={f.slug}
              className="min-w-0 rounded-xl border border-border bg-background p-4"
            >
              <p className="break-words text-sm font-semibold">{f.name}</p>
              {f.description ? (
                <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-6 text-muted-foreground">
                  {f.description}
                </p>
              ) : null}
              {f.expectedOutcome ? (
                <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-6 text-muted-foreground">
                  Outcome: {f.expectedOutcome}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          No predefined features selected.
        </p>
      )}
      {selection.needsAdvice ? (
        <p className="mt-4 text-sm">Feature guidance requested.</p>
      ) : null}
      {selection.requirements ? (
        <div className="mt-4">
          <h3 className="text-sm font-medium">
            Additional service requirements
          </h3>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
            {selection.requirements}
          </p>
        </div>
      ) : null}
      <p className="mt-4 border-t border-border pt-4 text-xs leading-6 text-muted-foreground">
        Saved request preferences. Final scope, pricing and delivery terms
        require agreement.
      </p>
    </section>
  );
}
