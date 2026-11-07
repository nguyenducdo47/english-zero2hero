const STORAGE_KEY = "e2h_mock_session_v1";

export type MockSession = {
  examSlug: string;
  startedAt: string;
  endsAt: string;
  durationMinutes: number;
};

export function readMockSession(): MockSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MockSession;
  } catch {
    return null;
  }
}

export function writeMockSession(session: MockSession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearMockSession() {
  localStorage.removeItem(STORAGE_KEY);
}

/** Bắt đầu hoặc gia hạn phiên thi thử có giờ (ghi đè phiên cũ). */
export function startMockSession(examSlug: string, durationMinutes: number): MockSession {
  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);
  const session: MockSession = {
    examSlug,
    startedAt: startedAt.toISOString(),
    endsAt: endsAt.toISOString(),
    durationMinutes,
  };
  writeMockSession(session);
  return session;
}

export function getSessionForSlug(examSlug: string): MockSession | null {
  const session = readMockSession();
  if (!session || session.examSlug !== examSlug) return null;
  return session;
}
