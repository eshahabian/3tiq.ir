"use client";

import {
  BookOpen,
  Map,
  Mountain,
  Backpack,
  Video,
  HelpCircle,
} from "lucide-react";

const suggestions = [
  {
    icon: Mountain,
    label: "قله مناسب مبتدی",
    prompt: "یک قله مناسب برای کوهنورد مبتدی پیشنهاد بده",
    color: "text-amber-600",
    bg: "bg-amber-500/10",
  },
  {
    icon: Backpack,
    label: "چک‌لیست تجهیزات",
    prompt: "چک‌لیست تجهیزات می‌خواهم",
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
  {
    icon: BookOpen,
    label: "کوییز ایمنی",
    prompt: "یک کوییز درباره بیماری ارتفاع بساز",
    color: "text-violet-600",
    bg: "bg-violet-500/10",
  },
  {
    icon: Map,
    label: "مسیر یادگیری",
    prompt: "مسیر یادگیری برای شروع کوهنوردی",
    color: "text-slate-600",
    bg: "bg-slate-500/10",
  },
  {
    icon: Video,
    label: "ویدئو آموزشی",
    prompt: "ویدئو آموزشی برای سیستم لایه‌ای پوشش پیدا کن",
    color: "text-red-600",
    bg: "bg-red-500/10",
  },
  {
    icon: HelpCircle,
    label: "سؤال درباره یک قله",
    prompt: "می‌خواهم درباره یک قله سؤال بپرسم",
    color: "text-blue-600",
    bg: "bg-blue-500/10",
  },
];

interface WelcomeScreenProps {
  onSelect: (prompt: string) => void;
  compact?: boolean;
}

export function WelcomeScreen({ onSelect, compact }: WelcomeScreenProps) {
  return (
    <div
      className={`flex flex-1 flex-col items-center justify-center px-4 ${compact ? "py-6" : "py-12"}`}
    >
      {!compact && (
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4A574] to-[#8B6914] shadow-lg">
            <Mountain className="h-7 w-7 text-white" />
          </div>
          <h1 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
            دستیار کوهنوردی سه‌تیغ
          </h1>
          <p className="max-w-md text-sm text-slate-500">
            درباره قله، مسیر، تجهیزات و ایمنی بپرس
          </p>
        </div>
      )}

      <div className="grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
        {suggestions.map((item) => (
          <button
            key={item.prompt}
            onClick={() => onSelect(item.prompt)}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-right transition-all hover:border-[#D4A574] hover:shadow-md dark:border-slate-700 dark:bg-slate-800/50"
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.bg}`}
            >
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-[#8B6914] dark:text-slate-200">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export { suggestions };
