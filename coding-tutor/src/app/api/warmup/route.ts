import { NextResponse } from "next/server";
import {
  createMetisSession,
  getMetisApiKey,
  getMetisBotId,
  useMetisBotMode,
} from "@/lib/ai/metis-bot";
import { getOrCreateContext, updateContext } from "@/lib/context/store";

/** Pre-create Metis session so the first user message is faster. */
export async function POST(req: Request) {
  try {
    if (!useMetisBotMode()) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const { sessionId } = (await req.json()) as { sessionId?: string };
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const ctx = getOrCreateContext(sessionId);
    if (ctx.metisSessionId) {
      return NextResponse.json({ ok: true, warmed: true });
    }

    const metisSessionId = await createMetisSession(
      getMetisApiKey(),
      getMetisBotId(),
    );
    updateContext(sessionId, { metisSessionId });

    return NextResponse.json({ ok: true, warmed: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Warmup failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
