const METIS_API = "https://api.metisai.ir/api/v1";

function headers(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

export async function testMetisConnection(apiKey: string) {
  const res = await fetch(`${METIS_API}/bots/all`, {
    headers: headers(apiKey),
  });
  return { ok: res.ok, status: res.status };
}

export async function listMetisBots(apiKey: string) {
  const res = await fetch(`${METIS_API}/bots/all`, {
    headers: headers(apiKey),
  });
  if (!res.ok) {
    throw new Error(`Metis bots API returned ${res.status}`);
  }
  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.bots)) return data.bots;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

export async function testOpenAIWrapper(apiKey: string) {
  const url =
    process.env.OPENAI_API_BASE ??
    "https://api.metisai.ir/api/v1/wrapper/openai_chat_completion";
  const res = await fetch(url, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [{ role: "user", content: "test" }],
      max_tokens: 5,
    }),
  });
  return res.status;
}

export async function createMetisSession(
  apiKey: string,
  botId: string,
): Promise<string> {
  const res = await fetch(`${METIS_API}/chat/session`, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({
      botId,
      user: null,
      initialMessages: [],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Metis session failed (${res.status}): ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.id as string;
}

export async function sendMetisMessage(
  apiKey: string,
  metisSessionId: string,
  content: string,
): Promise<string> {
  const res = await fetch(
    `${METIS_API}/chat/session/${metisSessionId}/message`,
    {
      method: "POST",
      headers: headers(apiKey),
      body: JSON.stringify({
        message: { content, type: "USER" },
      }),
    },
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Metis message failed (${res.status}): ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  if (typeof data.content === "string") return data.content;
  if (typeof data.message?.content === "string") return data.message.content;
  return JSON.stringify(data);
}

export function useMetisBotMode(): boolean {
  return Boolean(process.env.METIS_BOT_ID);
}

export function getMetisBotId(): string {
  const botId = process.env.METIS_BOT_ID;
  if (!botId) {
    throw new Error(
      "METIS_BOT_ID is not set. Create a bot at https://console.metisai.ir and add its ID to .env.local",
    );
  }
  return botId;
}

export function getMetisApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return apiKey;
}
