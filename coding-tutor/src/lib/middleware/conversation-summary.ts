import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const SUMMARY_THRESHOLD = 8;

function getLangChainModel() {
  return new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    configuration: {
      baseURL:
        process.env.OPENAI_API_BASE ??
        "https://api.metisai.ir/api/v1/wrapper/openai_chat_completion",
    },
    modelName: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0.3,
  });
}

export function shouldSummarize(messageCount: number): boolean {
  return messageCount >= SUMMARY_THRESHOLD;
}

export async function summarizeConversation(
  messages: Array<{ role: string; content: string }>,
  existingSummary?: string | null,
): Promise<string> {
  const conversationText = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n\n");

  const prompt = PromptTemplate.fromTemplate(`
You are a conversation summarizer for a coding education assistant.
Summarize the following conversation in Persian (Farsi).
Keep important details: topics discussed, student level, technologies mentioned, learning goals, and key questions.

{existingSummarySection}

Conversation:
{conversation}

Write a concise summary (max 300 words) in Persian:`);

  const existingSummarySection = existingSummary
    ? `Previous summary:\n${existingSummary}\n\nUpdate the summary with new information.`
    : "";

  const chain = prompt.pipe(getLangChainModel()).pipe(new StringOutputParser());

  return chain.invoke({
    conversation: conversationText,
    existingSummarySection,
  });
}

export function trimMessagesForContext(
  messages: Array<{ role: string; content: string }>,
  summary: string | null,
  keepRecent = 4,
): Array<{ role: "user" | "assistant" | "system"; content: string }> {
  if (!summary || messages.length <= keepRecent) {
    return messages as Array<{
      role: "user" | "assistant" | "system";
      content: string;
    }>;
  }

  const recent = messages.slice(-keepRecent);
  return [
    {
      role: "system" as const,
      content: `خلاصه مکالمه قبلی:\n${summary}`,
    },
    ...(recent as Array<{
      role: "user" | "assistant" | "system";
      content: string;
    }>),
  ];
}
