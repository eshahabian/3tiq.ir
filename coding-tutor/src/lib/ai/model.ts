import { createOpenAI } from "@ai-sdk/openai";

/**
 * Metis OpenAI-compatible API
 * SDK appends /chat/completions → https://api.metisai.ir/api/v1/wrapper/chat/completions
 */
const METIS_BASE =
  process.env.OPENAI_API_BASE ?? "https://api.metisai.ir/api/v1/wrapper";

const METIS_MODEL =
  process.env.OPENAI_MODEL ?? "GPT-4O-Mini-2024-07-18";

export function getOpenAIProvider() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Get your key from https://console.metisai.ir",
    );
  }

  return createOpenAI({
    apiKey,
    baseURL: METIS_BASE,
  });
}

export function getModel() {
  return getOpenAIProvider().chat(METIS_MODEL);
}
