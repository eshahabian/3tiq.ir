"use client";

import {
  BookOpen,
  Code2,
  GitBranch,
  Map,
  Sparkles,
  Video,
  FileText,
} from "lucide-react";

const suggestions = [
  {
    icon: BookOpen,
    label: "کوییز React Context",
    prompt: "Generate a quiz about React Context API",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: Code2,
    label: "مثال FastAPI CRUD",
    prompt: "Generate a FastAPI CRUD example",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: GitBranch,
    label: "بررسی GitHub",
    prompt: "Review this repository: https://github.com/vercel/next.js",
    color: "text-slate-500",
    bg: "bg-slate-500/10",
  },
  {
    icon: Map,
    label: "مسیر Backend Developer",
    prompt: "Create a roadmap for becoming a Backend Developer",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Video,
    label: "ویدئو FastAPI Auth",
    prompt: "Find videos for FastAPI Authentication",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    icon: FileText,
    label: "مستندات LangChain",
    prompt: "Latest documentation for LangChain agents and tools",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
];

interface WelcomeScreenProps {
  onSelect: (prompt: string) => void;
}

export function WelcomeScreen({ onSelect }: WelcomeScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
          دستیار آموزشی برنامه‌نویسی
        </h1>
        <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
          یادگیری برنامه‌نویسی با هوش مصنوعی — کوییز، کد، مسیر یادگیری و
          بررسی پروژه
        </p>
      </div>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {suggestions.map((item) => (
          <button
            key={item.prompt}
            onClick={() => onSelect(item.prompt)}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-right transition-all hover:border-indigo-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-indigo-600"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.bg}`}
            >
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 dark:text-slate-200 dark:group-hover:text-indigo-400">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export { suggestions };
