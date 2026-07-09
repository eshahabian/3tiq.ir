"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User, Wrench } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface MessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  toolInvocations?: Array<{ toolName: string; state: string }>;
}

export function Message({
  role,
  content,
  isStreaming,
  toolInvocations,
}: MessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-4",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          isUser
            ? "bg-indigo-600 text-white"
            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-indigo-600 text-white"
            : "bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700",
        )}
      >
        {toolInvocations && toolInvocations.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {toolInvocations.map((tool, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300"
              >
                <Wrench className="h-3 w-3" />
                {formatToolName(tool.toolName)}
              </span>
            ))}
          </div>
        )}

        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-code:text-indigo-600 dark:prose-code:text-indigo-400">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content || (isStreaming ? "..." : "")}
            </ReactMarkdown>
          </div>
        )}

        {isStreaming && !isUser && (
          <span className="mt-1 inline-block h-4 w-1 animate-pulse bg-indigo-500" />
        )}
      </div>
    </div>
  );
}

function formatToolName(name: string): string {
  const names: Record<string, string> = {
    generateQuiz: "کوییز",
    createRoadmap: "مسیر یادگیری",
    searchYouTube: "جستجوی ویدئو",
    suggestPeak: "پیشنهاد قله",
    gearChecklist: "چک‌لیست تجهیزات",
  };
  return names[name] ?? name;
}
