"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FinderButton as Button } from "./FinderButton";
import type { ProjectEvidence } from "../lib/project-evidence";

type ReferenceCard = { id: number; project: ProjectEvidence; expanded: boolean };

export function ProjectEvidenceEditor({ entries }: { entries: ProjectEvidence[] }) {
  const nextId = useRef(entries.length);
  const [cards, setCards] = useState<ReferenceCard[]>(() =>
    entries.map((project, id) => ({ id, project, expanded: false })),
  );
  function update(id: number, patch: Partial<ProjectEvidence>) {
    setCards(current => current.map(card => card.id === id
      ? { ...card, project: { ...card.project, ...patch } } : card));
  }
  function expand(id: number, expanded: boolean) {
    setCards(current => current.map(card => card.id === id && card.expanded !== expanded
      ? { ...card, expanded } : card));
  }
  return (
    <section className="space-y-5 sm:col-span-2">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Project references</h3>
        <p className="mt-2 text-xs leading-5 text-muted">
          The work behind your profile. Expand a reference to edit; swipe to browse on mobile.
          Changes are saved with Save profile.
        </p>
      </div>
      <div className="flex snap-x snap-mandatory items-start gap-5 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0 lg:snap-none">
        {cards.map(({ id, project: p, expanded }, i) => (
          <details key={id} open={expanded} className="group/reference min-w-0 basis-5/6 shrink-0 snap-start rounded-2xl border border-border bg-background sm:basis-2/3 lg:basis-auto"
            onToggle={event => expand(id, event.currentTarget.open)}
            onInvalidCapture={event => { event.currentTarget.open = true; expand(id, true); }}>
            <summary className="flex cursor-pointer list-none min-h-44 items-start justify-between gap-4 rounded-2xl p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/40 [&::-webkit-details-marker]:hidden">
              <span className="block min-w-0 flex-1 space-y-3">
                <span className="block font-mono text-xs text-muted">Reference {String(i + 1).padStart(2, "0")}</span>
                <span className="block break-words text-base font-medium leading-6">{p.name.trim() || "New project reference"}</span>
                <span className="block line-clamp-2 break-words text-xs leading-5 text-muted">
                  {p.skills.filter(s => s.trim()).join(" · ") || "Add skills and your contribution"}
                </span>
              </span>
              <ChevronDown aria-hidden="true" className="size-4 shrink-0 mt-1 text-muted transition-transform group-open/reference:rotate-180 motion-reduce:transition-none" />
            </summary>
            <div className="space-y-5 border-t border-border p-5">
              <label className="block space-y-2"><span className="text-xs">Project name</span>
                <Input name={`projectName${i}`} value={p.name} onChange={e => update(id, { name: e.target.value })} required maxLength={100} />
              </label>
              <label className="block space-y-2"><span className="text-xs">HTTPS demo, repository or case-study link</span>
                <Input name={`projectUrl${i}`} type="url" pattern="https://.*" value={p.url} onChange={e => update(id, { url: e.target.value })} required maxLength={500} />
              </label>
              <label className="block space-y-2"><span className="text-xs">Skills used, separated by commas</span>
                <Input name={`projectSkills${i}`} value={p.skills.join(",")} onChange={e => update(id, { skills: e.target.value.split(",") })} required maxLength={600} />
              </label>
              <label className="block space-y-2"><span className="text-xs">What you personally implemented</span>
                <Textarea name={`projectContribution${i}`} value={p.contribution} onChange={e => update(id, { contribution: e.target.value })} required maxLength={400} rows={3} />
              </label>
              <Button type="button" variant="ghost" onClick={() => setCards(current => current.filter(card => card.id !== id))}>Remove reference</Button>
            </div>
          </details>
        ))}
      </div>
      <p className="text-xs leading-5 text-muted">{cards.length} of 6 references · Owner-recorded; not independently verified.</p>
      <Button type="button" variant="outline" disabled={cards.length >= 6} onClick={() => {
        const id = nextId.current++;
        setCards(current => [...current, { id, expanded: true, project: { name: "", url: "", skills: [], contribution: "" } }]);
      }}>Add project reference</Button>
    </section>
  );
}
