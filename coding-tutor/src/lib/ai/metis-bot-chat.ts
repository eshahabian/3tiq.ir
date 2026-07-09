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

const STREAM_CHUNK_DELAY_MS = 12;

function buildFirstMessagePrompt(
  userMessage: string,
  studentLevel: StudentLevel,
): string {
  return [
    ASSISTANT_BEHAVIOR_RULES,
    "",
    buildStudentLevelPrompt(studentLevel),
    "",
    userMessage,
  ].join("\n");
}

async function streamTextChunks(
  writer: {
    write: (chunk: {
      type: string;
      id?: string;
      delta?: string;
      finishReason?: string;
    }) => void;
  },
  id: string,
  text: string,
) {
  writer.write({ type: "text-start", id });

  const chunks = text.match(/[\s\S]{1,24}/g) ?? [text];
  for (const chunk of chunks) {
    writer.write({ type: "text-delta", id, delta: chunk });
    if (chunks.length > 1) {
      await new Promise((resolve) => setTimeout(resolve, STREAM_CHUNK_DELAY_MS));
    }
  }

  writer.write({ type: "text-end", id });
}

export async function handleMetisBotChat(params: {
  sessionId: string;
  userMessage: string;
  studentLevel: StudentLevel;
}) {
  const apiKey = getMetisApiKey();
  const botId = getMetisBotId();
  const ctx = getOrCreateContext(params.sessionId);

  const isNewSession = !ctx.metisSessionId;
  let metisSessionId = ctx.metisSessionId;
  if (!metisSessionId) {
    metisSessionId = await createMetisSession(apiKey, botId);
    updateContext(params.sessionId, { metisSessionId });
  }

  const prompt = isNewSession
    ? buildFirstMessagePrompt(params.userMessage, params.studentLevel)
    : params.userMessage;

  const reply = await sendMetisMessage(apiKey, metisSessionId, prompt);

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({ type: "start" });
      const id = "assistant-1";
      await streamTextChunks(writer, id, reply);
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
