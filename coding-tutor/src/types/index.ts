export type StudentLevel = "beginner" | "intermediate" | "advanced";

export interface UserContext {
  sessionId: string;
  studentLevel: StudentLevel;
  favoriteTechnologies: string[];
  currentRoadmap: string | null;
  studiedTopics: string[];
  conversationSummary: string | null;
  metisSessionId: string | null;
  updatedAt: string;
}

export interface ChatRequestBody {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  sessionId?: string;
  studentLevel?: StudentLevel;
  favoriteTechnologies?: string[];
}
