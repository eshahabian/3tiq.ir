const SESSION_KEY = "3tiq-assistant-session";

function canUseStorage(storage: Storage): boolean {
  try {
    const probe = "__3tiq_probe__";
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function readSessionId(): string | null {
  if (typeof window === "undefined") return null;
  for (const storage of [localStorage, sessionStorage]) {
    if (!canUseStorage(storage)) continue;
    const id = storage.getItem(SESSION_KEY);
    if (id) return id;
  }
  return null;
}

export function writeSessionId(id: string): void {
  if (typeof window === "undefined") return;
  for (const storage of [localStorage, sessionStorage]) {
    if (!canUseStorage(storage)) continue;
    try {
      storage.setItem(SESSION_KEY, id);
      return;
    } catch {
      /* try next */
    }
  }
}

export function createSessionId(): string {
  const id = crypto.randomUUID();
  writeSessionId(id);
  return id;
}
