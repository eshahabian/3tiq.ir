import { tool } from "ai";
import { z } from "zod";

export const codeGeneratorTool = tool({
  description:
    "Generate educational code examples and explanations. Use when user asks for code examples, implementations, or tutorials.",
  inputSchema: z.object({
    topic: z
      .string()
      .describe(
        "What code to generate, e.g. 'FastAPI CRUD example' or 'React custom hook'",
      ),
    language: z
      .string()
      .optional()
      .describe("Programming language or framework, e.g. Python, TypeScript"),
    includeComments: z
      .boolean()
      .default(true)
      .describe("Include explanatory comments in code"),
  }),
  execute: async ({ topic, language, includeComments }) => {
    return {
      type: "code_request",
      topic,
      language: language ?? "auto-detect",
      includeComments,
      instruction: `Generate a complete, educational code example for: "${topic}"${language ? ` in ${language}` : ""}.
${includeComments ? "Include detailed comments explaining each section." : ""}
Provide:
1. Brief introduction to the concept
2. Complete working code with proper formatting
3. Step-by-step explanation of how it works
4. Common mistakes to avoid
5. Suggestions for practice exercises

Write explanations in Persian, keep code in English.`,
    };
  },
});
