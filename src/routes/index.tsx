import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Copy,
  Eraser,
  History,
  Loader2,
  Paperclip,
  Plus,
  RefreshCw,
  SendHorizonal,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/AppShell";
import { Markdown } from "@/components/app/Markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  usePersistentState,
  useSettings,
  saveToProjects,
  uid,
  STORAGE_KEYS,
  type ChatMessage,
  type Conversation,
} from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Research — VisionAI" },
      {
        name: "description",
        content:
          "Ask anything and get clear, well-structured answers. Upload files, copy replies and keep your chat history.",
      },
      { property: "og:title", content: "AI Research — VisionAI" },
      {
        property: "og:description",
        content: "A calm, fast AI research chat with history, file uploads and one-click copy.",
      },
    ],
  }),
  component: ResearchPage,
});

const SUGGESTIONS = [
  "Explain how solar panels work, simply",
  "Give me 10 YouTube video ideas about space",
  "Summarise the history of the internet",
  "Help me plan a 3-day trip to Lagos",
];

function newConversation(): Conversation {
  return { id: uid(), title: "New chat", createdAt: Date.now(), messages: [] };
}

function ResearchPage() {
  const { settings } = useSettings();
  const [conversations, setConversations, hydrated] = usePersistentState<Conversation[]>(
    STORAGE_KEYS.conversations,
    [],
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<{ name: string; text: string } | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [draft, setDraft] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hydrated) return;
    setActiveId((current) => current ?? conversations[0]?.id ?? null);
  }, [hydrated, conversations]);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );
  const messages = active?.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, draft]);

  function upsertConversation(id: string, updater: (c: Conversation) => Conversation) {
    setConversations((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));
  }

  async function runCompletion(history: ChatMessage[], conversationId: string) {
    setStreaming(true);
    setDraft("");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model: settings.chatModel,
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok || !response.body) {
        const detail = await response.text();
        throw new Error(detail || "The assistant could not respond.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setDraft(text);
      }

      if (!text.trim()) throw new Error("Empty response from the assistant.");
      upsertConversation(conversationId, (c) => ({
        ...c,
        messages: [...history, { id: uid(), role: "assistant", content: text }],
      }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
      upsertConversation(conversationId, (c) => ({ ...c, messages: history }));
    } finally {
      setDraft("");
      setStreaming(false);
    }
  }

  async function send(rawText?: string) {
    const text = (rawText ?? input).trim();
    if (!text || streaming) return;

    let conversationId = activeId;
    let base = conversations;
    if (!conversationId) {
      const fresh = newConversation();
      conversationId = fresh.id;
      base = [fresh, ...conversations];
      setConversations(base);
      setActiveId(fresh.id);
    }

    const existing = base.find((c) => c.id === conversationId)?.messages ?? [];
    const content = attachment ? `${text}\n\n--- File: ${attachment.name} ---\n${attachment.text}` : text;
    const userMessage: ChatMessage = {
      id: uid(),
      role: "user",
      content,
      ...(attachment ? { attachments: [{ name: attachment.name }] } : {}),
    };
    const history = [...existing, userMessage];

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              title: c.messages.length === 0 ? text.slice(0, 48) : c.title,
              messages: history,
            }
          : c,
      ),
    );
    setInput("");
    setAttachment(null);
    await runCompletion(history, conversationId);
  }

  async function regenerate() {
    if (!active || streaming) return;
    const lastUserIndex = [...active.messages].map((m) => m.role).lastIndexOf("user");
    if (lastUserIndex === -1) return;
    const history = active.messages.slice(0, lastUserIndex + 1);
    upsertConversation(active.id, (c) => ({ ...c, messages: history }));
    await runCompletion(history, active.id);
  }

  function startNewChat() {
    const fresh = newConversation();
    setConversations((prev) => [fresh, ...prev]);
    setActiveId(fresh.id);
    setInput("");
    setAttachment(null);
  }

  function clearChat() {
    if (!active) return;
    upsertConversation(active.id, (c) => ({ ...c, messages: [] }));
    toast.success("Chat cleared");
  }

  async function handleFile(file: File) {
    if (file.size > 200_000) {
      toast.error("Please upload a text file smaller than 200 KB.");
      return;
    }
    const text = await file.text();
    setAttachment({ name: file.name, text });
    toast.success(`Attached ${file.name}`);
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(
      () => toast.success("Copied to clipboard"),
      () => toast.error("Could not copy"),
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6 lg:min-h-screen lg:py-8">
      <PageHeader
        title="AI Research"
        description="Ask anything. Clear answers, every time."
        actions={
          <>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="rounded-2xl">
                  <History className="size-4" /> History
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] p-5">
                <SheetHeader className="p-0">
                  <SheetTitle>Chat history</SheetTitle>
                </SheetHeader>
                <div className="mt-4 flex flex-col gap-2 overflow-y-auto">
                  {conversations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No chats yet.</p>
                  ) : (
                    conversations.map((c) => (
                      <div
                        key={c.id}
                        className={cn(
                          "group flex items-center gap-2 rounded-2xl border border-border px-3 py-2.5 transition-colors",
                          c.id === activeId ? "bg-secondary" : "hover:bg-secondary/60",
                        )}
                      >
                        <button
                          className="min-w-0 flex-1 text-left"
                          onClick={() => setActiveId(c.id)}
                        >
                          <span className="block truncate text-sm font-medium">{c.title}</span>
                          <span className="block text-xs text-muted-foreground">
                            {c.messages.length} messages
                          </span>
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete chat"
                          onClick={() => {
                            setConversations((prev) => prev.filter((x) => x.id !== c.id));
                            if (c.id === activeId) setActiveId(null);
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </SheetContent>
            </Sheet>
            <Button variant="outline" className="rounded-2xl" onClick={clearChat}>
              <Eraser className="size-4" /> Clear
            </Button>
            <Button className="rounded-2xl" onClick={startNewChat}>
              <Plus className="size-4" /> New chat
            </Button>
          </>
        }
      />

      <section className="surface-card flex min-h-[50vh] flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 && !streaming ? (
            <div className="flex h-full flex-col items-center justify-center gap-6 py-10 text-center">
              <span className="gradient-brand grid size-14 place-items-center rounded-3xl text-primary-foreground shadow-lift">
                <Sparkles className="size-7" />
              </span>
              <div>
                <h2 className="text-xl font-bold">What would you like to know?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tap a starter below or type your own question.
                </p>
              </div>
              <div className="grid w-full max-w-xl gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-2xl border border-border bg-card px-4 py-3 text-left text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((m) => (
            <div
              key={m.id}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[92%] rounded-3xl px-4 py-3 sm:max-w-[80%]",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-secondary text-foreground",
                )}
              >
                {m.role === "assistant" ? (
                  <>
                    <Markdown>{m.content}</Markdown>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => copy(m.content)}
                      >
                        <Copy className="size-3.5" /> Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl"
                        onClick={regenerate}
                        disabled={streaming}
                      >
                        <RefreshCw className="size-3.5" /> Regenerate
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-[0.95rem] leading-relaxed whitespace-pre-wrap break-words">
                    {m.attachments?.length
                      ? m.content.split("\n\n--- File:")[0]
                      : m.content}
                    {m.attachments?.length ? (
                      <span className="mt-2 block text-xs opacity-80">
                        📎 {m.attachments[0]!.name}
                      </span>
                    ) : null}
                  </p>
                )}
              </div>
            </div>
          ))}

          {streaming ? (
            <div className="flex justify-start">
              <div className="max-w-[92%] rounded-3xl bg-secondary px-4 py-3 sm:max-w-[80%]">
                {draft ? (
                  <Markdown>{draft}</Markdown>
                ) : (
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" /> Thinking…
                  </span>
                )}
              </div>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-border bg-card p-3 sm:p-4">
          {attachment ? (
            <div className="mb-2 flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2 text-sm">
              <Paperclip className="size-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{attachment.name}</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remove file"
                onClick={() => setAttachment(null)}
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : null}
          <div className="flex items-end gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,.csv,.json,text/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
                e.target.value = "";
              }}
            />
            <Button
              variant="outline"
              size="icon"
              className="size-12 shrink-0 rounded-2xl"
              aria-label="Upload file"
              onClick={() => fileRef.current?.click()}
            >
              <Paperclip className="size-5" />
            </Button>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder="Type your question…"
              rows={1}
              className="max-h-40 min-h-12 flex-1 resize-none rounded-2xl px-4 py-3 text-base"
            />
            <Button
              size="icon"
              className="size-12 shrink-0 rounded-2xl"
              aria-label="Send message"
              onClick={() => void send()}
              disabled={streaming || !input.trim()}
            >
              {streaming ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <SendHorizonal className="size-5" />
              )}
            </Button>
          </div>
          <div className="mt-2 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl"
              disabled={!active || active.messages.length === 0}
              onClick={() => {
                if (!active) return;
                saveToProjects("chats", active);
                toast.success("Chat saved to Projects");
              }}
            >
              Save chat to Projects
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}