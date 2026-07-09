import type { UserContext } from "@/types";

export function buildContextPrompt(ctx: UserContext): string {
  const parts: string[] = [
    "## اطلاعات کوهنورد (Context Management)",
    `- سطح: ${ctx.studentLevel}`,
  ];

  if (ctx.favoriteTechnologies.length > 0) {
    parts.push(`- قله‌ها/مناطق موردعلاقه: ${ctx.favoriteTechnologies.join(", ")}`);
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
  const peakPatterns = [
    /دماوند|علم‌کوه|علمکوه|سبلان|توچال|دنا|هزار|زردکوه|آلوداغ|آلپ|سهند|تفتان|اشتران|کلاردشت|البرز|زاگرس|پناهگاه|قله/g,
  ];

  for (const pattern of peakPatterns) {
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
