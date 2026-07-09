import { tool } from "ai";
import { z } from "zod";

export const quizGeneratorTool = tool({
  description:
    "Generate an educational quiz about mountaineering topics. Use when user asks for a quiz, test, or wants to practice knowledge on safety, peaks, navigation, gear.",
  inputSchema: z.object({
    topic: z
      .string()
      .describe("Topic e.g. 'altitude sickness', 'نقشه‌خوانی', 'Layering system'"),
    questionCount: z
      .number()
      .min(3)
      .max(10)
      .default(5)
      .describe("Number of questions (3-10)"),
    difficulty: z
      .enum(["easy", "medium", "hard"])
      .optional()
      .describe("Quiz difficulty level"),
  }),
  execute: async ({ topic, questionCount, difficulty }) => {
    return {
      type: "quiz_request",
      topic,
      questionCount,
      difficulty: difficulty ?? "medium",
      instruction: `Generate a ${questionCount}-question quiz about "${topic}" with difficulty "${difficulty ?? "medium"}".
Format each question as:
## سوال N
**سوال:** ...
**گزینه‌ها:**
A) ...
B) ...
C) ...
D) ...
**پاسخ صحیح:** ...
**توضیح:** ...

Make questions educational and progressively challenging. Write in Persian.`,
    };
  },
});
