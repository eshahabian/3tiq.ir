import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import {
  getMetisApiKey,
  getMetisBotId,
  createMetisSession,
  sendMetisMessage,
  useMetisBotMode,
} from "@/lib/ai/metis-bot";
import { getOrCreateContext, updateContext } from "@/lib/context/store";
import { buildStudentLevelPrompt } from "@/lib/middleware/student-level";
import { ASSISTANT_BEHAVIOR_RULES } from "@/lib/ai/assistant-prompt";
import type { StudentLevel } from "@/types";

export async function handleMetisBotChat(params: {
  sessionId: string;
  userMessage: string;
  studentLevel: StudentLevel;
}) {
  const apiKey = getMetisApiKey();
  const botId = getMetisBotId();
  const ctx = getOrCreateContext(params.sessionId);

  let metisSessionId = ctx.metisSessionId;
  if (!metisSessionId) {
    metisSessionId = await createMetisSession(apiKey, botId);
    updateContext(params.sessionId, { metisSessionId });
  }

  const prompt = [
    ASSISTANT_BEHAVIOR_RULES,
    "",
    buildStudentLevelPrompt(params.studentLevel),
    "",
    params.userMessage,
  ].join("\n");

  const reply = await sendMetisMessage(apiKey, metisSessionId, prompt);

  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      writer.write({ type: "start" });
      const id = "assistant-1";
      writer.write({ type: "text-start", id });
      writer.write({ type: "text-delta", id, delta: reply });
      writer.write({ type: "text-end", id });
      writer.write({ type: "finish", finishReason: "stop" });
    },
    onError: (err) =>
      err instanceof Error ? err.message : "Metis bot error",
  });

  return createUIMessageStreamResponse({
    stream,
    headers: {
      "X-Session-Id": params.sessionId,
      "X-AI-Provider": "metis-bot",
    },
  });
}

export { useMetisBotMode };
