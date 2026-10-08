import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/features/auth/server/require-auth';
import { prisma } from '@/lib/prisma';
import { ClientPageFrame } from '@/features/client/components/shell/ClientPageFrame';
export default async function MessagesPage({
  searchParams
}: {
  searchParams: Promise<{ conversation?: string }>;
}) {
  const user = await requireAuth('/dashboard/messages');
  const { conversation } = await searchParams;
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: { some: { userId: user.id, leftAt: null } },
      status: 'ACTIVE'
    },
    select: { id: true, subject: true },
    orderBy: { updatedAt: 'desc' },
    take: 50
  });
  const selected = conversation
    ? await prisma.conversation.findFirst({
        where: {
          id: conversation,
          status: 'ACTIVE',
          participants: { some: { userId: user.id, leftAt: null } }
        },
        select: {
          subject: true,
          messages: {
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
            take: 100,
            select: {
              id: true,
              body: true,
              createdAt: true,
              sender: { select: { name: true } }
            }
          }
        }
      })
    : null;
  if (conversation && !selected) notFound();
  return (
    <ClientPageFrame
      title="Messages"
      description="Read your existing conversations with the Rcentz team."
    >
      <a
        href="mailto:contact@rcentz.cc"
        className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm"
      >
        Contact the team by email
      </a>
      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <section className="rounded-xl border border-border p-4">
          <h2 className="font-semibold">Conversations</h2>
          {conversations.length ? (
            <ul className="mt-3 space-y-2">
              {conversations.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/dashboard/messages?conversation=${item.id}`}
                    aria-current={conversation === item.id ? 'page' : undefined}
                    className="block rounded-lg px-3 py-3 text-sm hover:bg-surface-muted aria-[current=page]:bg-surface-muted"
                  >
                    {item.subject || 'Rcentz conversation'}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              No conversations yet.
            </p>
          )}
        </section>
        <section className="rounded-xl border border-border p-4">
          <h2 className="font-semibold">
            {selected?.subject || 'Conversation history'}
          </h2>
          {selected ? (
            <ul className="mt-4 space-y-4">
              {selected.messages.toReversed().map((message) => (
                <li
                  key={message.id}
                  className="rounded-lg bg-surface-subtle p-3"
                >
                  <p className="text-xs font-semibold">
                    {message.sender.name}{' '}
                    <time
                      className="ml-2 font-normal text-muted-foreground"
                      dateTime={message.createdAt.toISOString()}
                    >
                      {message.createdAt.toLocaleString('en-GB', {
                        timeZone: 'UTC'
                      })}{' '}
                      UTC
                    </time>
                  </p>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm">
                    {message.body || 'Attachment message'}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Choose a conversation to read it. New messages are handled through
              email while we complete the messaging tools.
            </p>
          )}
        </section>
      </div>
    </ClientPageFrame>
  );
}
