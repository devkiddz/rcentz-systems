'use client';

import { useEffect, useState } from 'react';

import {
  Bell,
  ClipboardList,
  FileStack,
  FolderKanban,
  LayoutDashboard,
  MessageSquareText,
  Package,
  ReceiptText,
  Search,
  Settings
} from 'lucide-react';

import { useRouter } from 'next/navigation';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

const destinations = [
  {
    label: 'Overview',
    description: 'Your account command overview',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    label: 'Projects',
    description: 'View your Rcentz projects',
    href: '/dashboard/projects',
    icon: FolderKanban
  },
  {
    label: 'Products',
    description: 'Browse your product workspace',
    href: '/dashboard/products',
    icon: Package
  },
  {
    label: 'Billing',
    description: 'Invoices and payments',
    href: '/dashboard/billing',
    icon: ReceiptText
  },
  {
    label: 'Project brief',
    description: 'Create a project brief',
    href: '/dashboard/onboarding',
    icon: ClipboardList
  },
  {
    label: 'Requests',
    description: 'Services, projects and support',
    href: '/dashboard/requests',
    icon: ClipboardList
  },
  {
    label: 'Messages',
    description: 'Conversations with Rcentz',
    href: '/dashboard/messages',
    icon: MessageSquareText
  },
  {
    label: 'Files',
    description: 'Documents and project resources',
    href: '/dashboard/files',
    icon: FileStack
  },
  {
    label: 'Notifications',
    description: 'Workspace activity and alerts',
    href: '/dashboard/notifications',
    icon: Bell
  },
  {
    label: 'Settings',
    description: 'Workspace preferences',
    href: '/dashboard/settings',
    icon: Settings
  }
] as const;

export function ClientCommandSearch() {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const shortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';

      if (!shortcut) {
        return;
      }

      event.preventDefault();

      setOpen(current => !current);
    }

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Search Rcentz"
        onClick={() => setOpen(true)}
        className="group hidden h-8 w-[180px] cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-3 text-left transition-colors hover:border-border-strong md:flex lg:w-[200px]">
        <Search className="size-3.5 shrink-0 text-theme-accent" />

        <span className="min-w-0 flex-1 truncate text-[11px] text-muted">Search</span>

        <span className="flex h-5 items-center rounded-md border border-border bg-background px-1.5 font-mono text-[9px] text-muted">
          Ctrl K
        </span>
      </button>

      <button
        type="button"
        aria-label="Search"
        onClick={() => setOpen(true)}
        className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-theme-accent transition-colors hover:bg-surface-muted md:hidden">
        <Search className="size-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden border-border bg-background p-0 shadow-lg sm:max-w-[410px]">
          <DialogTitle className="sr-only">Search client workspace</DialogTitle>

          <Command className="rounded-none bg-background text-foreground">
            <div className="border-b border-border bg-background px-3">
              <CommandInput
                placeholder="Search workspace..."
                className="min-h-14 border-0 bg-transparent py-2 text-sm text-foreground placeholder:text-muted"
              />
            </div>

            <CommandList className="max-h-[320px] overflow-y-auto bg-background px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <CommandEmpty className="py-8 text-center text-sm text-muted">
                No matching destination.
              </CommandEmpty>

              <CommandGroup heading="Navigate">
                {destinations.map(destination => {
                  const Icon = destination.icon;

                  return (
                    <CommandItem
                      key={destination.href}
                      value={`${destination.label} ${destination.description}`}
                      onSelect={() => {
                        navigate(destination.href);
                      }}
                      className="group mb-1 cursor-pointer rounded-lg border border-transparent px-3 py-2.5">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface">
                        <Icon className="size-4 text-theme-accent" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{destination.label}</p>

                        <p className="mt-0.5 text-[11px] text-muted">{destination.description}</p>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
