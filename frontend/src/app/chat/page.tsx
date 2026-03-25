"use client";

import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { ChatMessage, ChatSession } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import {
  Send,
  Plus,
  MessageSquare,
  Loader2,
  Trash2,
  Bot,
  ArrowRight,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

const SUGGESTED = [
  "Give me a beginner full body workout plan",
  "Best chest exercises with dumbbells",
  "How should I train for fat loss?",
  "Push/pull/legs split for intermediate",
  "Exercises for lower back pain relief",
  "How many sets and reps for building muscle?",
];

function ChatContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionParam = searchParams.get("session");

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionParam);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { if (!authLoading && !user) router.push("/login"); }, [user, authLoading, router]);

  useEffect(() => {
    if (user) { api.getChatHistory(30).then(setSessions).catch(() => {}).finally(() => setSessionsLoading(false)); }
  }, [user]);

  const loadSession = useCallback(async (sessionId: string) => {
    setMessagesLoading(true);
    try { const detail = await api.getChatSession(sessionId); setMessages(detail.messages); setCurrentSessionId(sessionId); }
    catch { setMessages([]); }
    finally { setMessagesLoading(false); }
  }, []);

  useEffect(() => { if (sessionParam) loadSession(sessionParam); }, [sessionParam, loadSession]);
  useEffect(() => { scrollToBottom(); }, [messages]);

  const startNewChat = () => {
    setCurrentSessionId(null); setMessages([]); setInput("");
    window.history.replaceState(null, "", "/chat");
    inputRef.current?.focus();
  };

  const doSend = async (text: string) => {
    if (!text.trim() || sending) return;
    const msg = text.trim();
    setInput(""); setSending(true);
    setMessages((prev) => [...prev, { role: "user", content: msg, timestamp: new Date().toISOString() }]);
    try {
      const res = await api.sendMessage(msg, currentSessionId || undefined);
      if (!currentSessionId) {
        setCurrentSessionId(res.session_id);
        window.history.replaceState(null, "", `/chat?session=${res.session_id}`);
        api.getChatHistory(30).then(setSessions).catch(() => {});
      }
      setMessages((prev) => [...prev, { role: "assistant", content: res.message, timestamp: new Date().toISOString() }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Try again.", timestamp: new Date().toISOString() }]);
    } finally { setSending(false); }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try { await api.deleteChatSession(sessionId); setSessions((prev) => prev.filter((s) => s.id !== sessionId)); if (currentSessionId === sessionId) startNewChat(); } catch {}
  };

  if (authLoading || !user) return <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-72" : "w-0"} shrink-0 overflow-hidden border-r bg-card transition-all duration-200 hidden md:block`}>
        <div className="flex h-full w-72 flex-col">
          <div className="flex items-center justify-between border-b px-4 py-4">
            <h2 className="text-sm font-semibold">Chat History</h2>
            <Button size="sm" variant="outline" onClick={startNewChat} className="h-8 gap-1.5">
              <Plus className="h-3.5 w-3.5" /> New
            </Button>
          </div>
          <ScrollArea className="flex-1 min-h-0 px-2 py-2">
            {sessionsLoading ? (
              <div className="space-y-2 px-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : sessions.length === 0 ? (
              <p className="px-4 py-12 text-center text-sm text-muted-foreground">No conversations yet.<br />Start by asking a question below.</p>
            ) : (
              <div className="space-y-0.5">
                {sessions.map((s) => (
                  <div key={s.id} onClick={() => loadSession(s.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') loadSession(s.id); }} className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent cursor-pointer ${currentSessionId === s.id ? "bg-accent font-medium" : ""}`}>
                    <span className="truncate pr-4">{s.title}</span>
                    <button onClick={(e) => handleDeleteSession(s.id, e)} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100" title="Delete" aria-label="Delete session">
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Main chat */}
      <div className="flex flex-1 flex-col min-w-0 min-h-0">
        {/* Top bar */}
        <div className="flex items-center gap-2 border-b px-4 py-2.5">
          <Button variant="ghost" size="icon" className="h-8 w-8 hidden md:inline-flex" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <MessageSquare className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {currentSessionId ? sessions.find(s => s.id === currentSessionId)?.title || "Chat" : "New Chat"}
          </span>
        </div>

        {/* Messages area */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="mx-auto max-w-3xl px-6 py-8">
            {messagesLoading ? (
              <div className="space-y-6">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div>
            ) : messages.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center py-16">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                  <Bot className="h-7 w-7 text-muted-foreground" />
                </div>
                <h2 className="mb-2 text-2xl font-bold">What can I help with?</h2>
                <p className="mb-10 text-muted-foreground">Ask me anything about fitness, workouts, nutrition, or training.</p>
                <div className="grid w-full gap-3 sm:grid-cols-2">
                  {SUGGESTED.map((p) => (
                    <button key={p} onClick={() => doSend(p)} className="group flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-all hover:bg-accent hover:shadow-sm">
                      <span className="text-sm">{p}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Messages */
              <div className="space-y-6">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : ""}`}>
                    {msg.role === "assistant" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Bot className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className={msg.role === "user" ? "max-w-[80%] rounded-2xl rounded-br-sm bg-foreground px-4 py-3 text-background" : "flex-1 min-w-0"}>
                      {msg.role === "assistant" ? (
                        <div className="prose dark:prose-invert max-w-none leading-relaxed [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4 [&_p]:mb-3 [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-base [&_h1]:font-bold [&_h2]:font-semibold [&_strong]:font-semibold">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-1.5 py-3">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input bar */}
        <div className="border-t bg-background px-4 py-4">
          <div className="mx-auto flex max-w-3xl gap-3">
            <Input
              ref={inputRef}
              placeholder="Ask about workouts, exercises, nutrition..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && doSend(input)}
              disabled={sending}
              className="h-11 flex-1 text-sm"
            />
            <Button onClick={() => doSend(input)} disabled={!input.trim() || sending} size="icon" className="h-11 w-11 shrink-0">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-14 left-0 z-40 w-72 border-r bg-card md:hidden">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b px-4 py-4">
                <h2 className="text-sm font-semibold">Chat History</h2>
                <Button size="sm" variant="outline" onClick={startNewChat} className="h-8 gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> New
                </Button>
              </div>
              <ScrollArea className="flex-1 min-h-0 px-2 py-2">
                {sessions.map((s) => (
                  <div key={s.id} onClick={() => { loadSession(s.id); setSidebarOpen(false); }} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { loadSession(s.id); setSidebarOpen(false); } }} className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent cursor-pointer ${currentSessionId === s.id ? "bg-accent font-medium" : ""}`}>
                    <span className="truncate pr-4">{s.title}</span>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-[calc(100vh-3.5rem)] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
      <ChatContent />
    </Suspense>
  );
}
