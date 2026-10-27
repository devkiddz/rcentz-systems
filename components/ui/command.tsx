'use client';

import * as React from 'react';

import { Command as CommandPrimitive } from 'cmdk';

import { CheckIcon, SearchIcon } from 'lucide-react';

import { cn } from 'cn';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { InputGroup, InputGroupAddon } from '@/components/ui/input-group';

function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        'flex size-full flex-col overflow-hidden rounded-xl! bg-background p-1 text-foreground',
        className
      )}
      {...props}
    />
  );
}

function CommandDialog({
  title = 'Command Palette',
  description = 'Search for a command to run...',
  children,
  className,
  showCloseButton = false,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, 'children'> & {
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>

        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <DialogContent
        className={cn(
          'top-1/3 translate-y-0 overflow-hidden rounded-xl! border-border bg-background p-0',
          className
        )}
        showCloseButton={showCloseButton}>
        {children}
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div data-slot="command-input-wrapper" className="p-2 pb-1.5">
      <InputGroup className="h-10! rounded-none! border-0! bg-transparent! shadow-none! ring-0! *:data-[slot=input-group-addon]:pl-3!">
        <CommandPrimitive.Input
          data-slot="command-input"
          className={cn(
            'w-full bg-transparent px-1 text-sm text-foreground outline-hidden placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
        />

        <InputGroupAddon>
          <SearchIcon className="size-4 shrink-0 text-theme-accent" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        'max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className
      )}
      {...props}
    />
  );
}

function CommandEmpty({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn('py-6 text-center text-sm text-muted', className)}
      {...props}
    />
  );
}

function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        'overflow-hidden p-1 text-foreground **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted',
        className
      )}
      {...props}
    />
  );
}

function CommandSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn('-mx-1 h-px bg-border', className)}
      {...props}
    />
  );
}

function CommandItem({ className, children, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        [
          'group/command-item',
          'relative',
          'flex',
          'cursor-default',
          'items-center',
          'gap-2',
          'rounded-lg',
          'border',
          'border-transparent',
          'bg-transparent',
          'px-2',
          'py-1.5',
          'text-sm',
          'text-foreground',
          'outline-hidden',
          'select-none',

          'transition-[border-color,box-shadow,color]',

          'data-[disabled=true]:pointer-events-none',
          'data-[disabled=true]:opacity-50',

          'data-selected:border-theme-accent/30',
          'data-selected:bg-transparent',
          'data-selected:text-foreground',
          'data-selected:shadow-[0_0_0_1px_var(--theme-accent-faint)]',

          '[&_svg]:pointer-events-none',
          '[&_svg]:shrink-0',
          "[&_svg:not([class*='size-'])]:size-4",

          'data-selected:*:[svg]:text-theme-accent'
        ].join(' '),
        className
      )}
      {...props}>
      {children}

      <CheckIcon className="ml-auto text-theme-accent opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100" />
    </CommandPrimitive.Item>
  );
}

function CommandShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        'ml-auto text-xs tracking-widest text-muted group-data-selected/command-item:text-foreground',
        className
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator
};
