import { tool } from "ai";
import { z } from "zod";

export const gearChecklistTool = tool({
  description:
    "Generate a mountaineering gear and equipment checklist for a trip. Use when user asks about equipment, what to bring, packing list, or تجهیزات.",
  inputSchema: z.object({
    tripType: z
      .string()
      .describe("Type of trip e.g. 'day hike', 'multi-day', 'winter ascent', 'صعود یک‌روزه'"),
    peakOrRegion: z
      .string()
      .optional()
      .describe("Peak name or region"),
    season: z
      .enum(["spring", "summer", "fall", "winter"])
      .optional()
      .describe("Season of the trip"),
  }),
  execute: async ({ tripType, peakOrRegion, season }) => {
    return {
      type: "gear_checklist",
      tripType,
      peakOrRegion: peakOrRegion ?? "general",
      season: season ?? "summer",
      instruction: peakOrRegion
        ? `Create a detailed gear checklist in Persian for: "${tripType}" at ${peakOrRegion}, season: ${season ?? "summer"}.
Format with sections: ضروری، توصیه‌شده، ایمنی و اورژانس. Include layering advice if relevant.`
        : `The user asked for a gear checklist but did NOT specify a peak. Do NOT default to Damavand. Ask which peak or region first, and mention trip type (day/multi-day) and season if unknown.`,
    };
  },
});
