import { NextResponse } from "next/server";
import {
  testMetisConnection,
  listMetisBots,
  testOpenAIWrapper,
  useMetisBotMode,
} from "@/lib/ai/metis-bot";

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      ok: false,
      error: "OPENAI_API_KEY not set in .env.local",
    });
  }

  const connection = await testMetisConnection(apiKey);
  let bots: Array<{ id: string; name: string }> = [];
  let botsError: string | null = null;

  if (connection.ok) {
    try {
      bots = await listMetisBots(apiKey);
    } catch (e) {
      botsError = e instanceof Error ? e.message : "Failed to list bots";
    }
  }

  const wrapperStatus = await testOpenAIWrapper(apiKey);

  return NextResponse.json({
    ok: connection.ok,
    apiStatus: connection.status,
    wrapperStatus,
    mode: useMetisBotMode() ? "metis-bot" : "openai-wrapper",
    metisBotId: process.env.METIS_BOT_ID ?? null,
    bots: bots.map((b: { id: string; name: string }) => ({
      id: b.id,
      name: b.name,
    })),
    botsError,
    hint:
      useMetisBotMode()
        ? "Using Metis Bot API."
        : bots.length === 0
          ? "کلید API درست است. از console.metisai.ir یک ربات بساز و METIS_BOT_ID را در .env.local بگذار."
          : `یک ربات پیدا شد. METIS_BOT_ID=${bots[0]?.id} را در .env.local بگذار.`,
  });
}
