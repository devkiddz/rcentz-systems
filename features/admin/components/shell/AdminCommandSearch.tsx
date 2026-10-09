'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BriefcaseBusiness, FolderKanban, LayoutDashboard, Search, Settings, UsersRound } from 'lucide-react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

const adminSearchDestinations = [
  {
    label: 'Overview',
    description: 'Admin operational overview',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    label: 'Service Requests',
    description: 'Review and manage service requests',
    href: '/admin/requests',
    icon: BriefcaseBusiness
  },
  {
    label: 'Projects',
    description: 'Manage active and completed projects',
    href: '/admin/projects',
    icon: FolderKanban
  },
  {
    label: 'Clients',
    description: 'Manage Rcentz clients',
    href: '/admin/clients',
    icon: UsersRound
  },
  {
    label: 'Settings',
    description: 'Admin and system settings',
    href: '/admin/settings',
    icon: Settings
  }
] as const;

export function AdminCommandSearch() {
  const router = useRouter();
  const [isCommandSearchOpen, setIsCommandSearchOpen] = useState(false);

  useEffect(() => {
    function handleKeyboardShortcut(keyboardEvent: KeyboardEvent) {
      const isCommandShortcut =
        (keyboardEvent.metaKey || keyboardEvent.ctrlKey) && keyboardEvent.key.toLowerCase() === 'k';

      if (!isCommandShortcut) {
        return;
      }

      keyboardEvent.preventDefault();
      setIsCommandSearchOpen(currentIsCommandSearchOpen => !currentIsCommandSearchOpen);
    }

    document.addEventListener('keydown', handleKeyboardShortcut);

    return () => {
      document.removeEventListener('keydown', handleKeyboardShortcut);
    };
  }, []);

  function handleDestinationSelect(destinationHref: string) {
    setIsCommandSearchOpen(false);
    router.push(destinationHref);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Search Rcentz"
        onClick={() => setIsCommandSearchOpen(true)}
        className="group hidden h-8 w-[180px] cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-3 text-left transition-colors hover:border-border-strong xl:flex xl:w-[200px]">
        <Search aria-hidden="true" className="size-3.5 shrink-0 text-theme-accent" />

        <span className="min-w-0 flex-1 truncate text-xs text-muted">Search</span>

        <span className="flex h-5 items-center rounded-md border border-border bg-background px-1.5 font-mono text-xs text-muted">
          Ctrl K
        </span>
      </button>

      <button
        type="button"
        aria-label="Search"
        onClick={() => setIsCommandSearchOpen(true)}
        className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-theme-accent transition-colors hover:bg-surface-muted md:hidden">
        <Search aria-hidden="true" className="size-4" />
      </button>

      <Dialog open={isCommandSearchOpen} onOpenChange={setIsCommandSearchOpen}>
        <DialogContent className="overflow-hidden border-border bg-background p-0 shadow-lg sm:max-w-[390px]">
          <DialogTitle className="sr-only">Search Rcentz Admin</DialogTitle>

          <Command className="rounded-none bg-background text-foreground">
            <div className="border-b border-border bg-background px-3">
              <CommandInput
                placeholder="Search admin..."
                className="min-h-14 py-2 border-0 bg-transparent text-sm text-foreground placeholder:text-muted"
              />
            </div>

            <CommandList className="max-h-[270px] overflow-y-auto bg-background px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <CommandEmpty className="py-8 text-center text-sm text-muted">
                No matching destination found.
              </CommandEmpty>

              <CommandGroup heading="Navigate" className="text-muted">
                {adminSearchDestinations.map(destination => {
                  const DestinationIcon = destination.icon;

                  return (
                    <CommandItem
                      key={destination.href}
                      value={`${destination.label} ${destination.description}`}
                      onSelect={() => handleDestinationSelect(destination.href)}
                      className="group mb-1 cursor-pointer rounded-lg border border-transparent px-3 py-2.5 text-foreground transition-colors hover:border-theme-accent/25 hover:bg-foreground hover:text-background data-[selected=true]:border-theme-accent/30 data-[selected=true]:bg-foreground data-[selected=true]:text-background">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-theme-accent transition-colors group-hover:border-theme-accent/30 group-data-[selected=true]:border-theme-accent/30">
                        <DestinationIcon aria-hidden="true" className="size-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-background group-data-[selected=true]:text-background">
                          {destination.label}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-muted transition-colors group-hover:text-background/70 group-data-[selected=true]:text-background/70">
                          {destination.description}
                        </p>
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
