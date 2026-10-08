"use client";
import { useEffect, useRef, useState } from "react";
import Link from 'next/link';
import { MessageSquare, Send, X } from "lucide-react";
type Message = {
  id: string;
  body: string | null;
  createdAt: string;
  mine: boolean;
  sender: { name: string };
};
export function ProjectSupportBubble({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const requestId = useRef('');
  const input = useRef<HTMLTextAreaElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const endpoint = `/api/projects/${encodeURIComponent(projectId)}/chat`;
  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const controller = new AbortController();
    async function load() {
      if (document.hidden) return;
      try {
        const response = await fetch(endpoint, {
          signal: controller.signal,
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Support is temporarily unavailable.");
        setMessages(data.messages);
        setConversationId(data.conversationId);
        if (data.conversationId && document.hasFocus()) await fetch(`/api/conversations/${data.conversationId}/read`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ through: data.readThrough }), signal: controller.signal });
        setError("");
        setLoading(false);
      } catch (cause) {
        if (!controller.signal.aborted) {
          setError(
            cause instanceof Error ? cause.message : "Could not load support.",
          );
          setLoading(false);
        }
      }
    }
    void load();
    const timer = window.setInterval(load, 5000);
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    }
    document.addEventListener("keydown", escape);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      document.removeEventListener("keydown", escape);
    };
  }, [open, endpoint]);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [messages]);
  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (pending || !text.trim()) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, messageId: requestId.current ||= crypto.randomUUID() }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Message could not be sent.");
      setText(""); requestId.current = '';
      setConversationId(data.conversationId);
      const latest = await fetch(endpoint, { cache: "no-store" });
      const history = await latest.json();
      if (latest.ok) setMessages(history.messages);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not send. Please retry.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="fixed bottom-20 right-4 z-40 sm:bottom-6 sm:right-6">
      {open ? (
        <section
          aria-label="Project support chat"
          id="project-support-chat"
          className="mb-3 flex max-h-[min(520px,75dvh)] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-border p-4">
            <div>
              <h2 className="text-sm font-semibold">Rcentz support</h2>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Project conversation · replies appear here
              </p>
            </div>
            <button
              type="button"
              aria-label="Close support"
              onClick={() => {
                setOpen(false);
                trigger.current?.focus();
              }}
              className="flex size-9 items-center justify-center rounded-lg hover:bg-surface-muted"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="min-h-24 flex-1 space-y-3 overflow-y-auto p-4">
            {loading && !messages.length ? (
              <p className="text-xs text-muted-foreground">
                Loading conversation…
              </p>
            ) : null}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[90%] rounded-xl p-3 ${message.mine ? "ml-auto bg-theme-accent-soft" : "bg-surface-muted"}`}
              >
                <p className="text-[10px] font-semibold">
                  {message.mine ? "You" : message.sender.name}
                </p>
                <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5">
                  {message.body || "Attachment message"}
                </p>
                <time
                  dateTime={message.createdAt}
                  className="mt-2 block text-[9px] text-muted-foreground"
                >
                  {new Date(message.createdAt).toLocaleString("en-GB", {
                    timeZone: "Africa/Lagos",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  WAT
                </time>
              </div>
            ))}
            <div ref={end} />
          </div>
          {error ? (
            <p
              role="alert"
              className="px-4 pb-2 text-xs text-red-600 dark:text-red-400"
            >
              {error}
            </p>
          ) : null}
          <form
            onSubmit={send}
            className="flex items-end gap-2 border-t border-border p-3"
          >
            <label className="sr-only" htmlFor="support-message">
              Your support message
            </label>
            <textarea
              ref={input}
              id="support-message"
              disabled={pending}
              value={text}
              onChange={(event) => { setText(event.target.value); requestId.current = ''; }}
              maxLength={2000}
              rows={2}
              placeholder="Message the team…"
              className="min-w-0 flex-1 resize-none rounded-lg border border-border bg-background p-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              disabled={pending || !text.trim()}
              aria-label={pending ? "Sending message" : "Send message"}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background disabled:opacity-40"
            >
              <Send aria-hidden="true" className="size-4" />
            </button>
          </form>
          <p className="px-4 pb-3 text-[10px] text-muted-foreground">
            {conversationId ? <Link href={`/dashboard/messages?conversation=${conversationId}`} className="mr-2 underline">Open full conversation</Link> : null}Replies depend on team availability.{" "}
            <a href="mailto:contact@rcentz.cc" className="underline">
              Email support
            </a>
          </p>
        </section>
      ) : null}
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls="project-support-chat"
        aria-label={
          open ? "Close project support chat" : "Open project support chat"
        }
        onClick={() => setOpen((value) => !value)}
        className="ml-auto flex size-12 items-center justify-center rounded-full bg-foreground text-background shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <MessageSquare aria-hidden="true" className="size-5" />
      </button>
    </div>
  );
}
