import {
  streamText,
  convertToModelMessages,
  stepCountIs,
  type UIMessage,
} from "ai";
import { getModel } from "@/lib/ai/model";
import {
  handleMetisBotChat,
  useMetisBotMode,
} from "@/lib/ai/metis-bot-chat";
import { agentTools } from "@/lib/tools";
import {
  getOrCreateContext,
  updateContext,
  addStudiedTopic,
} from "@/lib/context/store";
import { buildStudentLevelPrompt, detectLevelChange } from "@/lib/middleware/student-level";
import {
  shouldSummarize,
  summarizeConversation,
  trimMessagesForContext,
} from "@/lib/middleware/conversation-summary";
import {
  buildContextPrompt,
  extractTopicsFromMessage,
  extractTechnologies,
} from "@/lib/middleware/context-management";
import { BASE_SYSTEM_PROMPT } from "@/lib/ai/assistant-prompt";
import type { ChatRequestBody, StudentLevel } from "@/types";

export const maxDuration = 60;

function getLastUserMessage(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === "user") {
      const textPart = msg.parts?.find((p) => p.type === "text");
      return textPart && "text" in textPart ? textPart.text : "";
    }
  }
  return "";
}

function uiMessagesToSimple(
  messages: UIMessage[],
): Array<{ role: string; content: string }> {
  return messages.map((m) => {
    const text =
      m.parts
        ?.filter((p) => p.type === "text")
        .map((p) => ("text" in p ? p.text : ""))
        .join("") ?? "";
    return { role: m.role, content: text };
  });
}

export async function POST(req: Request) {
  try {
    const body: ChatRequestBody & { messages: UIMessage[] } = await req.json();
    const { messages } = body;
    const sessionId = body.sessionId ?? crypto.randomUUID();

    const ctx = getOrCreateContext(sessionId, {
      studentLevel: body.studentLevel,
      favoriteTechnologies: body.favoriteTechnologies,
    });

    const lastUserMsg = getLastUserMessage(messages);
    const levelChange = detectLevelChange(lastUserMsg);
    if (levelChange) {
      updateContext(sessionId, { studentLevel: levelChange });
      ctx.studentLevel = levelChange;
    }

    if (useMetisBotMode()) {
      return handleMetisBotChat({
        sessionId,
        userMessage: lastUserMsg,
        studentLevel: ctx.studentLevel,
      });
    }

    const topics = extractTopicsFromMessage(lastUserMsg);
    for (const topic of topics) {
      addStudiedTopic(sessionId, topic);
    }

    const techs = extractTechnologies(lastUserMsg);
    if (techs.length > 0) {
      const merged = [
        ...new Set([...ctx.favoriteTechnologies, ...techs]),
      ].slice(0, 20);
      updateContext(sessionId, { favoriteTechnologies: merged });
    }

    if (/roadmap|مسیر یادگیری/i.test(lastUserMsg)) {
      const goalMatch = lastUserMsg.match(
        /(?:roadmap|مسیر).*?(?:for|برای|بر\s*)?(.+)/i,
      );
      if (goalMatch) {
        updateContext(sessionId, { currentRoadmap: goalMatch[1].trim() });
      }
    }

    let summary = ctx.conversationSummary;
    const simpleMessages = uiMessagesToSimple(messages);

    if (shouldSummarize(simpleMessages.length)) {
      summary = await summarizeConversation(simpleMessages, summary);
      updateContext(sessionId, { conversationSummary: summary });
    }

    const trimmedMessages = trimMessagesForContext(simpleMessages, summary);

    const systemPrompt = [
      BASE_SYSTEM_PROMPT,
      buildStudentLevelPrompt(ctx.studentLevel),
      buildContextPrompt({ ...ctx, conversationSummary: summary }),
    ].join("\n\n");

    const result = streamText({
      model: getModel(),
      system: systemPrompt,
      messages: await convertToModelMessages(
        trimmedMessages.map((m, i) => ({
          id: String(i),
          role: m.role as "user" | "assistant" | "system",
          parts: [{ type: "text" as const, text: m.content }],
        })),
      ),
      tools: agentTools,
      stopWhen: stepCountIs(5),
      onError: ({ error }) => {
        console.error("[chat] stream error:", error);
      },
    });

    return result.toUIMessageStreamResponse({
      headers: {
        "X-Session-Id": sessionId,
        "X-Student-Level": ctx.studentLevel,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({
    status: "ok",
    name: "3tiq Mountaineering Assistant API",
    tools: Object.keys(agentTools),
  });
}
