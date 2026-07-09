import { tool } from "ai";
import { z } from "zod";

export const learningRoadmapTool = tool({
  description:
    "Create a personalized mountaineering learning roadmap. Use when user asks how to start mountaineering, learning path, or مسیر یادگیری کوهنوردی.",
  inputSchema: z.object({
    goal: z
      .string()
      .describe(
        "Goal e.g. 'شروع کوهنوردی', 'صعود قله‌های 4000 متری', 'کوهنوردی زمستانی'",
      ),
    timeframe: z
      .string()
      .optional()
      .describe("Available timeframe, e.g. '6 months', '1 year'"),
    currentSkills: z
      .array(z.string())
      .optional()
      .describe("Skills the student already has"),
  }),
  execute: async ({ goal, timeframe, currentSkills }) => {
    return {
      type: "roadmap_request",
      goal,
      timeframe: timeframe ?? "flexible",
      currentSkills: currentSkills ?? [],
      instruction: `Create a detailed, personalized learning roadmap for: "${goal}".
Timeframe: ${timeframe ?? "flexible"}
Current skills: ${currentSkills?.join(", ") || "not specified"}

Format the roadmap as:
# مسیر یادگیری: ${goal}

## فاز ۱: پایه‌ها (هفته ۱-۴)
- [ ] Topic 1 — description + resources
...

## فاز ۲: ...
...

Include for each phase:
- Clear milestones with checkboxes
- Recommended resources (free preferred)
- Mini projects to build
- Skills to master
- Estimated duration

Write in Persian. Make it actionable and realistic.`,
    };
  },
});
