import type { UserContext } from "@/types";

export function buildContextPrompt(ctx: UserContext): string {
  const parts: string[] = [
    "## اطلاعات دانشجو (Context Management)",
    `- سطح: ${ctx.studentLevel}`,
  ];

  if (ctx.favoriteTechnologies.length > 0) {
    parts.push(`- تکنولوژی‌های موردعلاقه: ${ctx.favoriteTechnologies.join(", ")}`);
  }

  if (ctx.currentRoadmap) {
    parts.push(`- مسیر یادگیری فعلی: ${ctx.currentRoadmap}`);
  }

  if (ctx.studiedTopics.length > 0) {
    parts.push(
      `- موضوعات مطالعه‌شده: ${ctx.studiedTopics.slice(-10).join(", ")}`,
    );
  }

  if (ctx.conversationSummary) {
    parts.push(`\n### خلاصه مکالمات قبلی\n${ctx.conversationSummary}`);
  }

  parts.push(
    "\nاز این اطلاعات برای شخصی‌سازی پاسخ‌ها استفاده کن. وقتی موضوع جدیدی مطرح شد، آن را به یاد بسپار.",
  );

  return parts.join("\n");
}

export function extractTopicsFromMessage(message: string): string[] {
  const topics: string[] = [];
  const techPatterns = [
    /\b(React|Vue|Angular|Next\.?js|Node\.?js|Python|FastAPI|Django|Flask|TypeScript|JavaScript|Go|Rust|Java|Spring|Docker|Kubernetes|PostgreSQL|MongoDB|Redis|GraphQL|REST|LangChain|AI|ML)\b/gi,
  ];

  for (const pattern of techPatterns) {
    const matches = message.match(pattern);
    if (matches) {
      topics.push(...matches.map((m) => m.trim()));
    }
  }

  return [...new Set(topics)];
}

export function extractTechnologies(message: string): string[] {
  return extractTopicsFromMessage(message);
}
