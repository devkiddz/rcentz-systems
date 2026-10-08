"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  MessageSquare,
  Plus,
  Send,
} from "lucide-react";

type Thread = {
  id: string;
  title: string;
  people: string;
  lastMessage: string;
  updatedAt: string;
  unread: number;
};
type Message = {
  id: string;
  body: string | null;
  createdAt: string;
  mine: boolean;
  read: boolean;
  sender: { name: string };
};
type History = {
  messages: Message[];
  conversationId: string;
  title: string;
  readThrough: string;
  hasMore: boolean;
};
async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...init });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error || "Could not connect. Please retry.");
  return data;
}
const post = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
const clock = (value: string) =>
  new Date(value).toLocaleTimeString("en-GB", {
    timeZone: "Africa/Lagos",
    hour: "2-digit",
    minute: "2-digit",
  });
export function MessageWorkspace({
  initialThreads,
  initialId,
  allowNewSupport = true,
}: {
  initialThreads: Thread[];
  initialId?: string;
  allowNewSupport?: boolean;
}) {
  const [threads, setThreads] = useState(initialThreads);
  const [selected, setSelected] = useState(initialId || "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(Boolean(initialId));
  const [error, setError] = useState("");
  const [connection, setConnection] = useState("Connecting…");
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const requestId = useRef("");
  const activeId = useRef(selected);
  const bottom = useRef(true);
  const selectedThread = threads.find((t) => t.id === selected);
  function choose(id: string) {
    if (id === selected) return;
    activeId.current = id;
    requestId.current = "";
    bottom.current = true;
    setMessages([]);
    setText("");
    setHasMore(false);
    setError("");
    setLoading(Boolean(id));
    setSelected(id);
  }
  const refreshList = useCallback(async (signal?: AbortSignal) => {
    const data = await json<{ conversations: Thread[] }>("/api/conversations", {
      signal,
    });
    setThreads(data.conversations);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    async function poll() {
      if (document.hidden) return;
      try {
        await refreshList(controller.signal);
      } catch {
        /* Thread view owns connection feedback. */
      }
    }
    const timer = setInterval(poll, 5000);
    void poll();
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [refreshList]);
  useEffect(() => {
    activeId.current = selected;
    requestId.current = "";
    if (!selected) return;
    const controller = new AbortController();
    let busy = false;
    let firstLoad = true;
    async function load() {
      if (busy || document.hidden) return;
      busy = true;
      try {
        const data = await json<History>(
          `/api/conversations/${selected}/messages`,
          { signal: controller.signal },
        );
        if (controller.signal.aborted) return;
        setMessages((previous) => {
          const latestIds = new Set(data.messages.map((m) => m.id));
          const oldest = data.messages[0];
          const older = previous.filter(
            (m) =>
              !latestIds.has(m.id) && oldest && m.createdAt < oldest.createdAt,
          );
          return [...older, ...data.messages];
        });
        if (firstLoad) setHasMore(data.hasMore);
        firstLoad = false;
        setConnection("Connected");
        setError("");
        setLoading(false);
        if (document.hasFocus()) {
          await json(`/api/conversations/${selected}/read`, {
            ...post({ through: data.readThrough }),
            signal: controller.signal,
          });
          await refreshList(controller.signal);
        }
      } catch (cause) {
        if (!controller.signal.aborted) {
          setConnection("Reconnecting…");
          setLoading(false);
          setError(
            cause instanceof Error ? cause.message : "Could not connect.",
          );
        }
      } finally {
        busy = false;
      }
    }
    void load();
    const timer = setInterval(load, 5000);
    window.addEventListener("focus", load);
    document.addEventListener("visibilitychange", load);
    return () => {
      controller.abort();
      clearInterval(timer);
      window.removeEventListener("focus", load);
      document.removeEventListener("visibilitychange", load);
    };
  }, [selected, refreshList]);
  useEffect(() => {
    if (bottom.current && scroller.current)
      scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [messages]);
  async function start() {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const thread = await json<{ id: string }>("/api/conversations", post({}));
      await refreshList();
      choose(thread.id);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not start support.",
      );
    } finally {
      setPending(false);
    }
  }
  async function older() {
    if (!selected || !messages[0] || loading) return;
    setLoading(true);
    const id = selected;
    try {
      const data = await json<History>(
        `/api/conversations/${id}/messages?before=${encodeURIComponent(messages[0].id)}`,
      );
      if (activeId.current !== id) return;
      const height = scroller.current?.scrollHeight || 0;
      bottom.current = false;
      setMessages((previous) => [
        ...data.messages,
        ...previous.filter(
          (m) => !data.messages.some((old) => old.id === m.id),
        ),
      ]);
      setHasMore(data.hasMore);
      requestAnimationFrame(() => {
        if (scroller.current)
          scroller.current.scrollTop += scroller.current.scrollHeight - height;
      });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not load history.",
      );
    } finally {
      setLoading(false);
    }
  }
  async function send(event?: React.FormEvent) {
    event?.preventDefault();
    if (!selected || !text.trim() || pending) return;
    const id = selected;
    setPending(true);
    setError("");
    requestId.current ||= crypto.randomUUID();
    try {
      await json(
        `/api/conversations/${id}/messages`,
        post({ message: text, messageId: requestId.current }),
      );
      if (activeId.current !== id) return;
      setText("");
      requestId.current = "";
      bottom.current = true;
      const data = await json<History>(`/api/conversations/${id}/messages`);
      setMessages((previous) => [
        ...previous.filter(
          (m) => !data.messages.some((latest) => latest.id === m.id),
        ),
        ...data.messages,
      ]);
      await json(
        `/api/conversations/${id}/read`,
        post({ through: data.readThrough }),
      );
      await refreshList();
      input.current?.focus();
    } catch (cause) {
      if (activeId.current === id)
        setError(
          cause instanceof Error ? cause.message : "Message not sent. Retry.",
        );
    } finally {
      setPending(false);
    }
  }
  return (
    <section
      aria-label="Messages"
      className="my-5 grid h-[calc(100dvh-11rem)] min-h-[420px] min-w-0 overflow-hidden rounded-2xl border border-border bg-background md:h-[calc(100dvh-7.5rem)] md:grid-cols-[280px_minmax(0,1fr)] lg:grid-cols-[310px_minmax(0,1fr)]"
    >
      <aside
        className={`${selected ? "hidden md:flex" : "flex"} min-h-0 flex-col border-r border-border`}
      >
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold">Messages</h1>
          {allowNewSupport ? (<button
            type="button"

            onClick={start}
            disabled={pending}
            aria-label="Start a support conversation"
            className="flex size-10 items-center justify-center rounded-full bg-surface-muted hover:bg-theme-accent-soft disabled:opacity-50"
          >
            <Plus className="size-5" />
          </button>) : null}
        </div>
        <label className="mx-4 mb-3">
          <span className="sr-only">Search conversations</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations"
            className="h-10 w-full rounded-xl border border-border bg-surface-subtle px-3 text-xs"
          />
        </label>
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {threads
            .filter((t) =>
              (t.title + t.people).toLowerCase().includes(search.toLowerCase()),
            )
            .map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => choose(t.id)}
                aria-current={selected === t.id ? "true" : undefined}
                className={`mb-1 flex w-full gap-3 rounded-xl p-3 text-left hover:bg-surface-muted ${selected === t.id ? "bg-theme-accent-soft" : ""}`}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-muted text-theme-accent">
                  <MessageSquare className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex gap-2">
                    <span className="truncate text-xs font-semibold">
                      {t.title}
                    </span>
                    <time className="ml-auto text-[9px] text-muted-foreground">
                      {clock(t.updatedAt)}
                    </time>
                  </span>
                  <span className="mt-1 block truncate text-[10px] text-muted-foreground">
                    {t.people}
                  </span>
                  <span className="mt-1 flex items-center gap-2">
                    <span className="truncate text-[11px] text-muted-foreground">
                      {t.lastMessage}
                    </span>
                    {t.unread ? (
                      <span
                        aria-label={`${t.unread} unread messages`}
                        className="ml-auto rounded-full bg-theme-accent px-1.5 py-0.5 text-[9px] text-white"
                      >
                        {t.unread}
                      </span>
                    ) : null}
                  </span>
                </span>
              </button>
            ))}
          {!threads.length ? (
            <p className="px-4 py-8 text-center text-xs leading-6 text-muted-foreground">
              Your project conversations appear here.
              <br />
              {allowNewSupport ? "Start a conversation to contact Rcentz." : "Customer support and project conversations assigned to you will appear here."}
            </p>
          ) : null}
        </div>
        {!selected && error ? (
          <p role="alert" className="p-4 text-xs text-red-500">
            {error}
          </p>
        ) : null}
        <p className="border-t border-border p-3 text-[10px] text-muted-foreground">
          Private conversations with your project team.
        </p>
      </aside>
      <div
        className={`${selected ? "flex" : "hidden md:flex"} min-h-0 min-w-0 flex-col bg-surface-subtle/40`}
      >
        {selected ? (
          <>
            <div className="flex items-center gap-3 border-b border-border bg-background p-4">
              <button
                type="button"
                onClick={() => choose("")}
                aria-label="Back to conversations"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg md:hidden"
              >
                <ArrowLeft className="size-5" />
              </button>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold">
                  {selectedThread?.title || "Project conversation"}
                </h2>
                <p className="mt-1 truncate text-[10px] text-muted-foreground">
                  {selectedThread?.people || "Rcentz team"} ·{" "}
                  <span
                    className={
                      connection === "Connected" ? "text-theme-accent" : ""
                    }
                  >
                    {connection}
                  </span>
                </p>
              </div>
            </div>
            <div
              ref={scroller}
              onScroll={() => {
                const el = scroller.current;
                if (el)
                  bottom.current =
                    el.scrollHeight - el.scrollTop - el.clientHeight < 80;
              }}
              className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-6"
            >
              {hasMore ? (
                <button
                  type="button"
                  onClick={older}
                  disabled={loading}
                  className="mx-auto block rounded-full border border-border bg-background px-4 py-2 text-xs"
                >
                  {loading ? "Loading…" : "Load older messages"}
                </button>
              ) : null}
              {loading && !messages.length ? (
                <p className="text-center text-xs text-muted-foreground">
                  Loading conversation…
                </p>
              ) : null}
              {messages.map((m, i) => (
                <div key={m.id}>
                  {i === 0 ||
                  new Date(messages[i - 1].createdAt).toDateString() !==
                    new Date(m.createdAt).toDateString() ? (
                    <p className="my-4 text-center text-[10px] text-muted-foreground">
                      {new Date(m.createdAt).toLocaleDateString([], {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  ) : null}
                  <div
                    className={`w-fit max-w-[88%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${m.mine ? "ml-auto rounded-br-md bg-theme-accent-soft" : "rounded-bl-md border border-border bg-background"}`}
                  >
                    <p className="mb-1 text-[10px] font-semibold text-theme-accent">
                      {m.mine ? "You" : m.sender.name}
                    </p>
                    <p className="whitespace-pre-wrap break-words text-sm leading-6 [overflow-wrap:anywhere]">
                      {m.body || "Attachment message"}
                    </p>
                    <span className="mt-1 flex items-center justify-end gap-1.5 text-[9px] text-muted-foreground">
                      <time dateTime={m.createdAt}>{clock(m.createdAt)}</time>
                      {m.mine ? (
                        <span aria-label={m.read ? "Read" : "Sent"}>
                          {m.read ? (
                            <CheckCheck className="size-3.5 text-theme-accent" />
                          ) : (
                            <Check className="size-3.5" />
                          )}
                        </span>
                      ) : null}
                    </span>
                  </div>
                </div>
              ))}
              {!loading && !messages.length ? (
                <p className="py-12 text-center text-xs text-muted-foreground">
                  Send the first message. Replies will appear here.
                </p>
              ) : null}
            </div>
            {error ? (
              <p role="alert" className="px-4 py-2 text-xs text-red-500">
                {error}
              </p>
            ) : null}
            <form
              onSubmit={send}
              className="flex items-end gap-3 border-t border-border bg-background p-3 sm:p-4"
            >
              <label className="min-w-0 flex-1">
                <span className="sr-only">Your message</span>
                <textarea
                  ref={input}
                  value={text}
                  disabled={pending}
                  onChange={(e) => {
                    setText(e.target.value);
                    requestId.current = "";
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !e.nativeEvent.isComposing &&
                      !window.matchMedia("(pointer: coarse)").matches
                    ) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  placeholder="Write a message…"
                  rows={2}
                  maxLength={2000}
                  className="w-full resize-none rounded-xl border border-border bg-surface-subtle px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <button
                disabled={pending || !text.trim()}
                aria-label={pending ? "Sending message" : "Send message"}
                className="mb-1 flex size-11 shrink-0 items-center justify-center rounded-full bg-theme-accent text-white disabled:opacity-40"
              >
                <Send className="size-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="m-auto p-8 text-center">
            <MessageSquare className="mx-auto size-10 text-theme-accent" />
            <h2 className="mt-5 text-lg font-semibold">
              Keep the conversation connected.
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              {allowNewSupport ? "Choose a project conversation or message the Rcentz team." : "Choose an assigned conversation to reply to your customer."}
            </p>
            {allowNewSupport ? (<button
              type="button"

            onClick={start}
              disabled={pending}
              className="mt-6 rounded-full bg-foreground px-5 py-3 text-xs font-medium text-background"
            >
              Message Rcentz
            </button>) : null}
            {error ? (
              <p role="alert" className="mt-4 text-xs text-red-500">
                {error}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
