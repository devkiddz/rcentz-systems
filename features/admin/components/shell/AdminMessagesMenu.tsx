'use client';

import { useTransition } from 'react';

import { MessageSquareText } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { markAdminConversationRead } from '@/features/admin/server/dashboard/admin-header-actions';

import type { AdminHeaderMessage } from '@/features/admin/types/admin-header';

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('') || 'R'
  );
}

export function AdminMessagesMenu({
  messages,
  hasUnread
}: {
  messages: AdminHeaderMessage[];
  hasUnread: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function handleMessage(conversationId: string) {
    startTransition(async () => {
      await markAdminConversationRead(conversationId);
    });
  }

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  aria-label="Messages"
                  className="relative flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/40"
                />
              }
            />
          }>
          <MessageSquareText aria-hidden="true" className="size-4" />

          {hasUnread ? (
            <span
              aria-hidden="true"
              className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-theme-accent"
            />
          ) : null}
        </TooltipTrigger>

        <TooltipContent>Messages</TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" sideOffset={8} className="w-[360px] overflow-hidden p-0">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-4 py-3.5">
            <div>
              <p className="text-sm font-semibold text-foreground">Messages</p>

              <p className="mt-0.5 text-xs font-normal text-muted">Recent client conversations</p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {messages.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="mx-auto flex size-10 items-center justify-center rounded-xl border border-border bg-surface-muted">
              <MessageSquareText className="size-4 text-muted" />
            </div>

            <p className="mt-3 text-sm font-semibold text-foreground">No conversations yet</p>

            <p className="mt-1 text-xs leading-5 text-muted">Client conversations will appear here.</p>
          </div>
        ) : (
          <DropdownMenuGroup>
            <div className="max-h-[370px] overflow-y-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {messages.map(message => {
                return (
                  <DropdownMenuItem
                    key={message.id}
                    disabled={pending}
                    onClick={() => {
                      handleMessage(message.id);
                    }}
                    className="cursor-pointer gap-3 rounded-none px-4 py-3.5">
                    <div className="relative shrink-0">
                      <Avatar className="size-9">
                        {message.senderImage ? (
                          <AvatarImage src={message.senderImage} alt={message.senderName} />
                        ) : null}

                        <AvatarFallback className="bg-surface-muted text-xs font-semibold text-foreground">
                          {getInitials(message.senderName)}
                        </AvatarFallback>
                      </Avatar>

                      {message.unread ? (
                        <span
                          aria-hidden="true"
                          className="absolute -right-0.5 -top-0.5 size-2 rounded-full border-2 border-popover bg-theme-accent"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p
                          className={[
                            'truncate text-sm',
                            message.unread ? 'font-semibold text-foreground' : 'font-medium text-foreground'
                          ].join(' ')}>
                          {message.title}
                        </p>

                        <span className="shrink-0 text-xs text-muted">{message.timeLabel}</span>
                      </div>

                      <p className="mt-0.5 text-xs font-medium text-muted">{message.senderName}</p>

                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{message.preview}</p>
                    </div>

                    {message.unread ? (
                      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-theme-accent" />
                    ) : null}
                  </DropdownMenuItem>
                );
              })}
            </div>
          </DropdownMenuGroup>
        )}

        <DropdownMenuSeparator />

        <div className="px-4 py-3">
          <p className="text-xs text-muted">Recent workspace conversations</p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
