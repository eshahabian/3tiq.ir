import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const dir = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(resolve(dir, "../.env.local"), "utf8");
const apiKey = env.match(/OPENAI_API_KEY=(.+)/)?.[1]?.trim();

const urls = [
  "https://api.metisai.ir/api/v1/wrapper/openai_chat_completion",
  "https://api.metisai.ir/api/v1/wrapper/openai_chat_completion/chat/completions",
  "https://api.metisai.ir/v1/chat/completions",
  "https://api.metisai.ir/api/v1/chat/completions",
];

const body = JSON.stringify({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "سلام" }],
  max_tokens: 20,
});

for (const url of urls) {
  console.log("\n=== POST", url);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body,
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Body:", text.slice(0, 500));
  } catch (e) {
    console.log("Network error:", e.message, e.cause?.code);
  }
}
