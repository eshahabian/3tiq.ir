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
      instruction: `Create a detailed gear checklist in Persian for: "${tripType}"${peakOrRegion ? ` at ${peakOrRegion}` : ""}.
Format:
# چک‌لیست تجهیزات

## ضروری
- [ ] item — brief note

## توصیه‌شده
...

## ایمنی و اورژانس
...

Include layering advice if relevant. Mention 3tiq.ir blog articles on gear when helpful.`,
    };
  },
});
