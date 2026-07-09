"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Menu, Plus, Sparkles, LayoutGrid } from "lucide-react";
import { Message } from "./message";
import { InputArea } from "./input-area";
import { WelcomeScreen } from "./welcome-screen";
import { SettingsPanel } from "@/components/sidebar/settings-panel";
import { Button } from "@/components/ui/button";
import type { StudentLevel } from "@/types";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("3tiq-assistant-session");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("3tiq-assistant-session", id);
  }
  return id;
}

export function Chat({ embed = false }: { embed?: boolean }) {
  const [sessionId] = useState(getSessionId);
  const [studentLevel, setStudentLevel] = useState<StudentLevel>("beginner");
  const [favoriteTechnologies, setFavoriteTechnologies] = useState<string[]>(
    [],
  );
  const [studiedTopics, setStudiedTopics] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: {
          sessionId,
          studentLevel,
        },
      }),
    [sessionId, studentLevel],
  );

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport,
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/context?sessionId=${sessionId}`)
      .then((r) => r.json())
      .then((ctx) => {
        if (ctx.studentLevel) setStudentLevel(ctx.studentLevel);
        if (ctx.favoriteTechnologies)
          setFavoriteTechnologies(ctx.favoriteTechnologies);
        if (ctx.studiedTopics) setStudiedTopics(ctx.studiedTopics);
      })
      .catch(() => {});

    fetch("/api/warmup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    }).catch(() => {});
  }, [sessionId]);

  const handleLevelChange = useCallback(
    async (level: StudentLevel) => {
      setStudentLevel(level);
      await fetch("/api/context", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, studentLevel: level }),
      });
    },
    [sessionId],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;
      sendMessage({ text: input });
      setInput("");
    },
    [input, isLoading, sendMessage],
  );

  const handleSuggestion = useCallback(
    (prompt: string) => {
      sendMessage({ text: prompt });
    },
    [sendMessage],
  );

  const handleBackToMenu = useCallback(async () => {
    setMessages([]);
    setInput("");
    await fetch("/api/context", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, resetChat: true }),
    }).catch(() => {});
    fetch("/api/warmup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    }).catch(() => {});
  }, [sessionId, setMessages]);

  const handleNewChat = async () => {
    setMessages([]);
    const newId = crypto.randomUUID();
    localStorage.setItem("3tiq-assistant-session", newId);
    window.location.reload();
  };

  const getMessageText = (msg: (typeof messages)[0]) => {
    return (
      msg.parts
        ?.filter((p) => p.type === "text")
        .map((p) => ("text" in p ? p.text : ""))
        .join("") ?? ""
    );
  };

  const getToolInvocations = (msg: (typeof messages)[0]) => {
    return msg.parts
      ?.filter((p) => p.type.startsWith("tool-"))
      .map((p) => ({
        toolName: p.type.replace("tool-", ""),
        state: "type" in p ? p.type : "done",
      }));
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <SettingsPanel
        studentLevel={studentLevel}
        onLevelChange={handleLevelChange}
        favoriteTechnologies={favoriteTechnologies}
        studiedTopics={studiedTopics}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-2 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="تنظیمات"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#D4A574] to-[#8B6914]">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-slate-900 dark:text-white">
                  دستیار کوهنوردی
                </h1>
                <p className="text-xs text-slate-500">
                  سطح:{" "}
                  {studentLevel === "beginner"
                    ? "مبتدی"
                    : studentLevel === "intermediate"
                      ? "متوسط"
                      : "پیشرفته"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleBackToMenu}>
                <LayoutGrid className="ml-1 h-4 w-4" />
                بازگشت به منو
              </Button>
            )}
            {!embed && (
              <Button variant="outline" size="sm" onClick={handleNewChat}>
                <Plus className="ml-1 h-4 w-4" />
                گفتگوی جدید
              </Button>
            )}
          </div>
        </header>

        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {error && (
              <div className="mx-auto max-w-3xl px-4 py-3">
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                  خطا در دریافت پاسخ.
                  {error.message ? (
                    <> {error.message}</>
                  ) : (
                    <>
                      {" "}
                      ابتدا{" "}
                      <a href="/api/metis/status" className="underline" target="_blank">
                        وضعیت API
                      </a>{" "}
                      را چک کن. روی Vercel باید{" "}
                      <code className="text-xs">OPENAI_API_KEY</code> و{" "}
                      <code className="text-xs">METIS_BOT_ID</code> در Environment
                      Variables تنظیم شده باشد.
                    </>
                  )}
                </p>
              </div>
            )}
            {messages.length === 0 ? (
              <WelcomeScreen onSelect={handleSuggestion} compact={embed} />
            ) : (
              <div className="mx-auto max-w-3xl py-4">
                {messages.map((msg) => (
                  <Message
                    key={msg.id}
                    role={msg.role as "user" | "assistant"}
                    content={getMessageText(msg)}
                    isStreaming={
                      isLoading &&
                      msg.id === messages[messages.length - 1]?.id &&
                      msg.role === "assistant"
                    }
                    toolInvocations={getToolInvocations(msg)}
                  />
                ))}
              </div>
            )}
          </div>

          <InputArea
            input={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </main>
      </div>
    </div>
  );
}
