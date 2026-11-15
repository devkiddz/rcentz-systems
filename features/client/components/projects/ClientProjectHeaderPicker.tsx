'use client';

import { useEffect, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Check, ChevronsUpDown, FolderKanban, LayoutGrid, LoaderCircle } from 'lucide-react';
import {
  Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator
} from '@/components/ui/command';

type ProjectOption = { id: string; name: string };

export function ClientProjectHeaderPicker({
  currentProjectId,
  projects
}: {
  currentProjectId: string;
  projects: ProjectOption[];
}) {
  const router = useRouter();
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const node = document.getElementById('client-project-picker-slot');
    setTarget(node);
    return () => setTarget(null);
  }, []);

  const current = projects.find(item => item.id === currentProjectId);
  function go(href: string) {
    setOpen(false);
    startTransition(() => router.push(href));
  }

  const picker = (
    <div className="min-w-0 max-w-[310px]">
      <button
        type="button"
        aria-label="Switch customer project"
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={pending}
        onClick={() => setOpen(true)}
        className="group flex h-11 w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-surface px-2.5 text-left text-foreground transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-theme-accent">
          <FolderKanban aria-hidden="true" className="size-4" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[10px] text-muted">Current project</span>
          <span className="truncate text-sm font-semibold">{current?.name ?? 'Select project'}</span>
        </span>
        {pending ? (
          <LoaderCircle aria-hidden="true" className="size-4 shrink-0 animate-spin text-muted" />
        ) : (
          <ChevronsUpDown aria-hidden="true" className="size-4 shrink-0 text-muted" />
        )}
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Switch project"
        description="Search and open one of your project workspaces."
        className="max-w-[440px]">
        <Command>
          <CommandInput placeholder="Search your projects..." aria-label="Search your projects" />
          <CommandList>
            <CommandEmpty>No matching projects found.</CommandEmpty>
            <CommandGroup heading="Your projects">
              {projects.map(project => (
                <CommandItem
                  key={project.id}
                  value={`${project.name} ${project.id}`}
                  onSelect={() => go(`/dashboard/projects/${project.id}`)}
                  className="gap-3 px-3 py-2.5">
                  <FolderKanban aria-hidden="true" className="size-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{project.name}</span>
                  {project.id === currentProjectId ? (
                    <Check aria-hidden="true" className="size-4 text-theme-accent" />
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem value="All projects" onSelect={() => go('/dashboard/projects')} className="gap-3 px-3 py-2.5">
                <LayoutGrid aria-hidden="true" className="size-4" /> All Projects
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );

  return target ? createPortal(picker, target) : null;
}
