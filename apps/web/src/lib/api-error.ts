/** Rút gọn thông báo lỗi từ response Laravel (validation / message). */
export function formatApiError(error: unknown): string {
  if (!(error instanceof Error)) return "Error";
  const raw = error.message;
  const jsonStart = raw.indexOf("{");
  if (jsonStart === -1) return raw;

  try {
    const payload = JSON.parse(raw.slice(jsonStart)) as {
      message?: string;
      errors?: Record<string, string[]>;
    };
    if (payload.errors) {
      const first = Object.values(payload.errors).flat()[0];
      if (first) return first;
    }
    if (payload.message) return payload.message;
  } catch {
    /* ignore */
  }

  return raw;
}
