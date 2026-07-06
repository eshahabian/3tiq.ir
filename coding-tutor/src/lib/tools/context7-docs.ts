import { tool } from "ai";
import { z } from "zod";

const CONTEXT7_LIBRARY_MAP: Record<string, string> = {
  langchain: "/langchain-ai/langchain",
  nextjs: "/vercel/next.js",
  react: "/facebook/react",
  fastapi: "/tiangolo/fastapi",
  typescript: "/microsoft/typescript",
  tailwindcss: "/tailwindlabs/tailwindcss",
  prisma: "/prisma/prisma",
  "vercel ai sdk": "/vercel/ai",
  ai: "/vercel/ai",
};

async function fetchContext7Docs(
  libraryId: string,
  topic: string,
): Promise<string | null> {
  const apiKey = process.env.CONTEXT7_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.context7.com/v1/docs/query", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        libraryId,
        query: topic,
        maxTokens: 2000,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.content ?? data.text ?? null;
  } catch {
    return null;
  }
}

function resolveLibraryId(technology: string): string | null {
  const key = technology.toLowerCase().trim();
  for (const [name, id] of Object.entries(CONTEXT7_LIBRARY_MAP)) {
    if (key.includes(name)) return id;
  }
  return null;
}

export const context7DocsTool = tool({
  description:
    "Fetch latest documentation for a technology using Context7. Use when user asks for latest docs, API reference, or up-to-date documentation.",
  inputSchema: z.object({
    technology: z
      .string()
      .describe("Technology name, e.g. 'LangChain', 'Next.js', 'FastAPI'"),
    query: z
      .string()
      .describe("Specific documentation query, e.g. 'agents and tools'"),
  }),
  execute: async ({ technology, query }) => {
    const libraryId = resolveLibraryId(technology);

    if (libraryId) {
      const docs = await fetchContext7Docs(libraryId, query);
      if (docs) {
        return {
          type: "context7_docs",
          technology,
          libraryId,
          query,
          documentation: docs,
          instruction:
            "Present this documentation to the student in a clear, educational format. Highlight key concepts and provide examples.",
        };
      }
    }

    const docUrls: Record<string, string> = {
      langchain: "https://python.langchain.com/docs/",
      nextjs: "https://nextjs.org/docs",
      react: "https://react.dev/reference/react",
      fastapi: "https://fastapi.tiangolo.com/",
      typescript: "https://www.typescriptlang.org/docs/",
    };

    const fallbackUrl =
      docUrls[technology.toLowerCase()] ??
      `https://www.google.com/search?q=${encodeURIComponent(technology + " official documentation")}`;

    return {
      type: "context7_fallback",
      technology,
      query,
      documentationUrl: fallbackUrl,
      instruction: `Context7 API not configured or library not found. Use your knowledge to explain "${query}" for ${technology}, and point the student to: ${fallbackUrl}. Mention that for the latest docs they should check the official source.`,
    };
  },
});
