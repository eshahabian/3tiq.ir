/** Quick Metis API connectivity test — run: node scripts/test-metis.mjs */
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const dir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(dir, "../.env.local");
const env = readFileSync(envPath, "utf8");
const apiKey = env.match(/OPENAI_API_KEY=(.+)/)?.[1]?.trim();
const baseURL =
  env.match(/OPENAI_API_BASE=(.+)/)?.[1]?.trim() ??
  "https://api.metisai.ir/api/v1/wrapper/openai_chat_completion";
const model = env.match(/OPENAI_MODEL=(.+)/)?.[1]?.trim() ?? "gpt-4o-mini";

console.log("Testing Metis...");
console.log("Base URL:", baseURL);
console.log("Model:", model);
console.log("Key prefix:", apiKey?.slice(0, 8) + "...");

const bases = [
  baseURL,
  "https://api.metisai.ir/v1",
  "https://api.metisai.ir/api/v1",
  "https://api.metisai.ir/api/v1/wrapper/openai_chat_completion",
];

for (const base of bases) {
  console.log("\n--- Trying base:", base);
  try {
    const provider = createOpenAI({ apiKey, baseURL: base });
    const result = await generateText({
      model: provider(model),
      prompt: "Say hello in one word",
      maxTokens: 10,
    });
    console.log("SUCCESS:", result.text);
    break;
  } catch (e) {
    console.log("FAIL:", e.message);
    if (e.cause) console.log("Cause:", e.cause);
  }
}
