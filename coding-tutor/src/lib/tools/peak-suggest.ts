import { tool } from "ai";
import { z } from "zod";

const PEAKS = [
  { name: "دماوند", height: 5610, region: "البرز", difficulty: "متوسط", beginner: false },
  { name: "علم‌کوه", height: 4850, region: "البرز", difficulty: "سخت", beginner: false },
  { name: "سبلان", height: 4811, region: "البرز شرقی", difficulty: "متوسط", beginner: true },
  { name: "توچال", height: 3964, region: "البرز", difficulty: "آسان", beginner: true },
  { name: "دنا", height: 4450, region: "زاگرس", difficulty: "سخت", beginner: false },
  { name: "هزار", height: 4420, region: "کرمان", difficulty: "متوسط", beginner: true },
  { name: "زردکوه", height: 4221, region: "زاگرس", difficulty: "متوسط", beginner: true },
  { name: "آلوداغ", height: 4324, region: "آذربایجان", difficulty: "متوسط", beginner: true },
];

export const peakSuggestTool = tool({
  description:
    "Suggest suitable peaks in Iran based on user level, season, and preferences. Use when user asks which peak to climb, beginner peaks, or recommendations.",
  inputSchema: z.object({
    level: z
      .enum(["beginner", "intermediate", "advanced"])
      .optional()
      .describe("Climber experience level"),
    region: z
      .string()
      .optional()
      .describe("Preferred region e.g. البرز، زاگرس"),
    maxDays: z.number().optional().describe("Available days for the trip"),
  }),
  execute: async ({ level, region, maxDays }) => {
    let filtered = [...PEAKS];
    if (level === "beginner") {
      filtered = filtered.filter((p) => p.beginner);
    }
    if (region) {
      filtered = filtered.filter((p) =>
        p.region.includes(region.replace(/\s/g, "")),
      );
    }

    return {
      type: "peak_suggestions",
      level: level ?? "not specified",
      region: region ?? "all Iran",
      maxDays: maxDays ?? "flexible",
      peaks: filtered.length > 0 ? filtered : PEAKS.slice(0, 4),
      instruction: `Based on these peaks, recommend 2-3 options in Persian with:
- Why each peak fits the user's level
- Best season
- Approximate duration
- Link format: https://3tiq.ir/peaks/[peak-slug].html when relevant
- Safety reminders`,
    };
  },
});
