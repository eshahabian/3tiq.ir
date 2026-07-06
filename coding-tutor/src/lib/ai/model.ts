import { createOpenAI } from "@ai-sdk/openai";

export function getModel() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Get your key from https://console.metisai.ir",
    );
  }

  const provider = createOpenAI({
    apiKey,
    baseURL:
      process.env.OPENAI_API_BASE ??
      "https://api.metisai.ir/api/v1/wrapper/openai_chat_completion",
  });

  return provider(process.env.OPENAI_MODEL ?? "gpt-4o-mini");
}
