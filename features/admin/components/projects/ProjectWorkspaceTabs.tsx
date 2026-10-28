'use client';

import { useEffect, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, ChevronsUpDown, FolderKanban, LayoutGrid, LoaderCircle } from 'lucide-react';

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command';

export type WorkspaceTab = 'overview' | 'resources' | 'logs' | 'analytics' | 'settings';

type ProjectOption = {
  id: string;
  name: string;
};

type ProjectWorkspaceTabsProps = {
  currentProjectId: string;
  currentTab: WorkspaceTab;
  projects: ProjectOption[];
};

const tabs: { key: WorkspaceTab; label: string }[] = [
  { key: 'overview', label: 'Project Overview' },
  { key: 'resources', label: 'Resources' },
  { key: 'logs', label: 'Logs & History' },
  { key: 'analytics', label: 'Intelligence' },
  { key: 'settings', label: 'Settings' }
];

export function ProjectWorkspaceTabs({ currentProjectId, currentTab, projects }: ProjectWorkspaceTabsProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  // The shared AdminHeader owns this slot.
  // Portal creation happens only after client mounting.
  useEffect(() => {
    const target = document.getElementById('admin-project-picker-slot');

    if (!target) {
      return;
    }

    setPortalTarget(target);

    return () => {
      setPortalTarget(null);
    };
  }, []);

  const currentProject = projects.find(project => project.id === currentProjectId);

  function navigate(href: string) {
    setOpen(false);

    startTransition(() => {
      router.push(href);
    });
  }

  const projectPicker = (
    <div className="min-w-0">
      <button
        type="button"
        aria-label="Switch project"
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={pending}
        onClick={() => setOpen(true)}
        className="
          group
          flex h-11 w-full min-w-0 max-w-[310px]
          cursor-pointer items-center gap-2.5
          rounded-xl border border-border
          bg-surface px-2.5 text-left
          text-foreground shadow-none
          transition-colors
          hover:bg-surface-raised
          focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-ring
          disabled:cursor-wait disabled:opacity-60
        ">
        <span
          className="
            flex size-8 shrink-0 items-center justify-center
            rounded-lg border border-border
            bg-background text-theme-accent
          ">
          <FolderKanban aria-hidden="true" className="size-4" />
        </span>

        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[10px] font-medium text-muted">Current project</span>

          <span className="truncate text-sm font-semibold">{currentProject?.name ?? 'Select project'}</span>
        </span>

        {pending ? (
          <LoaderCircle aria-hidden="true" className="size-4 shrink-0 animate-spin text-muted" />
        ) : (
          <ChevronsUpDown
            aria-hidden="true"
            className="
              size-4 shrink-0 text-muted
              transition-colors group-hover:text-foreground
            "
          />
        )}
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Switch project"
        description="Search and select a project workspace."
        className="max-w-[440px]">
        <Command className="bg-background">
          <CommandInput
            placeholder="Search projects..."
            aria-label="Search projects"
            className="h-full border-0 bg-transparent shadow-none outline-none ring-0"
          />

          <CommandList>
            <CommandEmpty>No matching projects found.</CommandEmpty>

            <CommandGroup heading="Your projects">
              {projects.map(project => {
                const selected = project.id === currentProjectId;

                return (
                  <CommandItem
                    key={project.id}
                    value={`${project.name} ${project.id}`}
                    onSelect={() => navigate(`/admin/projects/${project.id}`)}
                    data-checked={selected}
                    className="gap-3 px-3 py-2.5">
                    <span
                      className="
                        flex size-9 shrink-0
                        items-center justify-center
                        rounded-lg border border-border
                        bg-surface-raised
                      ">
                      <FolderKanban className="size-4" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{project.name}</span>

                      {selected ? <span className="block text-xs text-muted">Current workspace</span> : null}
                    </span>

                    {selected ? <Check aria-hidden="true" className="size-4 text-theme-accent" /> : null}
                  </CommandItem>
                );
              })}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup>
              <CommandItem
                value="All projects"
                onSelect={() => navigate('/admin/projects')}
                className="gap-3 px-3 py-2.5">
                <span
                  className="
                    flex size-9 shrink-0
                    items-center justify-center
                    rounded-lg border border-border
                    bg-surface-raised
                  ">
                  <LayoutGrid className="size-4" />
                </span>

                <span className="min-w-0 flex-1 font-medium">All Projects</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );

  return (
    <div className="space-y-3">
      {portalTarget ? createPortal(projectPicker, portalTarget) : null}

      <nav
        aria-label="Project workspace tabs"
        className="
          flex gap-1 overflow-x-auto
          border-b border-border
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        ">
        {tabs.map(tab => {
          const active = currentTab === tab.key;

          const href =
            tab.key === 'overview'
              ? `/admin/projects/${currentProjectId}`
              : `/admin/projects/${currentProjectId}?tab=${tab.key}`;

          return (
            <Link
              key={tab.key}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={[
                'shrink-0 border-b-2 px-3 py-3',
                'text-xs font-medium transition-colors',
                active
                  ? 'border-theme-accent text-foreground'
                  : 'border-transparent text-muted hover:text-foreground'
              ].join(' ')}>
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
