import type { Locale } from "@/i18n/routing";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function buildApiHeaders(locale: Locale, token?: string): HeadersInit {
  return {
    "Accept-Language": locale,
    "X-Locale": locale,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiGet<T>(
  path: string,
  locale: Locale,
  token?: string,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: buildApiHeaders(locale, token),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API ${path}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  locale: Locale,
  token?: string,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildApiHeaders(locale, token),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path}: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("e2h_token");
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("e2h_token", token);
  else localStorage.removeItem("e2h_token");
}
