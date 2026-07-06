import type { StudentLevel, UserContext } from "@/types";

const store = new Map<string, UserContext>();

export function getOrCreateContext(
  sessionId: string,
  overrides?: Partial<UserContext>,
): UserContext {
  const existing = store.get(sessionId);
  if (existing) {
    const updated: UserContext = {
      ...existing,
      ...overrides,
      updatedAt: new Date().toISOString(),
    };
    store.set(sessionId, updated);
    return updated;
  }

  const ctx: UserContext = {
    sessionId,
    studentLevel: overrides?.studentLevel ?? "beginner",
    favoriteTechnologies: overrides?.favoriteTechnologies ?? [],
    currentRoadmap: overrides?.currentRoadmap ?? null,
    studiedTopics: overrides?.studiedTopics ?? [],
    conversationSummary: overrides?.conversationSummary ?? null,
    updatedAt: new Date().toISOString(),
  };
  store.set(sessionId, ctx);
  return ctx;
}

export function updateContext(
  sessionId: string,
  patch: Partial<UserContext>,
): UserContext {
  const ctx = getOrCreateContext(sessionId);
  const updated = { ...ctx, ...patch, updatedAt: new Date().toISOString() };
  store.set(sessionId, updated);
  return updated;
}

export function addStudiedTopic(sessionId: string, topic: string): void {
  const ctx = getOrCreateContext(sessionId);
  if (!ctx.studiedTopics.includes(topic)) {
    ctx.studiedTopics.push(topic);
    ctx.updatedAt = new Date().toISOString();
    store.set(sessionId, ctx);
  }
}

export function setStudentLevel(
  sessionId: string,
  level: StudentLevel,
): UserContext {
  return updateContext(sessionId, { studentLevel: level });
}
