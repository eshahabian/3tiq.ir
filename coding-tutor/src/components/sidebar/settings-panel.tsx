"use client";

import { GraduationCap, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { StudentLevel } from "@/types";

const LEVELS: { value: StudentLevel; label: string; description: string }[] =
  [
    {
      value: "beginner",
      label: "مبتدی",
      description: "توضیح ساده با مثال",
    },
    {
      value: "intermediate",
      label: "متوسط",
      description: "جزئیات فنی متعادل",
    },
    {
      value: "advanced",
      label: "پیشرفته",
      description: "عمیق و فنی",
    },
  ];

interface SettingsPanelProps {
  studentLevel: StudentLevel;
  onLevelChange: (level: StudentLevel) => void;
  favoriteTechnologies: string[];
  studiedTopics: string[];
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({
  studentLevel,
  onLevelChange,
  favoriteTechnologies,
  studiedTopics,
  isOpen,
  onClose,
}: SettingsPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col border-l border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900 lg:static lg:shadow-none">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-indigo-600" />
            <h2 className="font-semibold text-slate-900 dark:text-white">
              تنظیمات
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              سطح کوهنوردی
            </h3>
            <div className="space-y-2">
              {LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => onLevelChange(level.value)}
                  className={cn(
                    "w-full rounded-lg border p-3 text-right transition-all",
                    studentLevel === level.value
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600",
                  )}
                >
                  <div className="font-medium text-slate-900 dark:text-white">
                    {level.label}
                  </div>
                  <div className="text-xs text-slate-500">
                    {level.description}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {favoriteTechnologies.length > 0 && (
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                قله‌ها / مناطق
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {favoriteTechnologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>
          )}

          {studiedTopics.length > 0 && (
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                موضوعات مطالعه‌شده
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {studiedTopics.slice(-15).map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </aside>
    </>
  );
}
