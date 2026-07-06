import type { StudentLevel } from "@/types";

const LEVEL_INSTRUCTIONS: Record<StudentLevel, string> = {
  beginner: `
سطح دانشجو: مبتدی (Beginner)
- از زبان ساده و روزمره استفاده کن
- مفاهیم را با تشبیه و مثال‌های واقعی توضیح بده
- از اصطلاحات فنی بدون تعریف استفاده نکن
- کدها را خط‌به‌خط توضیح بده
- گام‌به‌گام پیش برو و عجله نکن
- پاسخ‌ها را کوتاه و قابل‌فهم نگه دار`,

  intermediate: `
سطح دانشجو: متوسط (Intermediate)
- توضیحات متعادل با جزئیات فنی مناسب
- best practiceها و الگوهای رایج را ذکر کن
- مثال‌های کاربردی و real-world بزن
- edge caseهای مهم را اشاره کن
- به مفاهیم پایه‌ای اشاره کوتاه کن`,

  advanced: `
سطح دانشجو: پیشرفته (Advanced)
- توضیحات عمیق و فنی با جزئیات implementation
- architecture، performance و trade-offها را بررسی کن
- به source code، internals و lifecycle اشاره کن
- الگوهای پیشرفته و anti-patternها را ذکر کن
- فرض کن دانشجو با مفاهیم پایه آشناست`,
};

export function buildStudentLevelPrompt(level: StudentLevel): string {
  return LEVEL_INSTRUCTIONS[level];
}

export function detectLevelChange(message: string): StudentLevel | null {
  const lower = message.toLowerCase();
  if (
    /سطح.*(مبتدی|beginner)/i.test(lower) ||
    /i am a beginner/i.test(lower)
  ) {
    return "beginner";
  }
  if (
    /سطح.*(متوسط|intermediate)/i.test(lower) ||
    /i am intermediate/i.test(lower)
  ) {
    return "intermediate";
  }
  if (
    /سطح.*(پیشرفته|advanced)/i.test(lower) ||
    /i am advanced/i.test(lower)
  ) {
    return "advanced";
  }
  return null;
}
