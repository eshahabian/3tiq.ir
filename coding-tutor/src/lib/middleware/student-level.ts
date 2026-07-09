import type { StudentLevel } from "@/types";

const LEVEL_INSTRUCTIONS: Record<StudentLevel, string> = {
  beginner: `
سطح کوهنورد: مبتدی
- زبان ساده و تشویق‌کننده
- هشدارهای ایمنی را واضح بگو
- از اصطلاحات تخصصی بدون توضیح استفاده نکن
- قله‌های آسان و مسیرهای مناسب مبتدی پیشنهاد بده
- پاسخ‌ها کوتاه و عملی`,

  intermediate: `
سطح کوهنورد: متوسط
- جزئیات فنی متعادل (ارتفاع، زمان، مسیر)
- نکات ایمنی و آمادگی جسمی
- مقایسه گزینه‌ها (فصل، مسیر، تجهیزات)
- به مفاهیم پایه اشاره کوتاه`,

  advanced: `
سطح کوهنورد: پیشرفته
- جزئیات فنی عمیق (شرایط جوی، ناوبری، ریسک)
- مسیرهای چالش‌برانگیز و نکات حرفه‌ای
- trade-offها و تصمیم‌گیری در شرایط سخت
- فرض کن کاربر تجربه قبلی دارد`,
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
    /سطح.*(پیشرفته|advanced|حرفه)/i.test(lower) ||
    /i am advanced/i.test(lower)
  ) {
    return "advanced";
  }
  return null;
}
