import type { Locale } from "@/i18n/routing";
import {
  emitStoreChange,
  listenStorageKey,
  listenWindowEvent,
} from "@/lib/store-sync";

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
    const text = await res.text();
    throw new Error(`API ${path}: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
  locale: Locale,
  token?: string,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
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

export async function apiPut<T>(
  path: string,
  body: unknown,
  locale: Locale,
  token?: string,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
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

export async function apiDelete<T>(
  path: string,
  locale: Locale,
  token?: string,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: buildApiHeaders(locale, token),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path}: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function apiPostFormData<T>(
  path: string,
  body: FormData,
  locale: Locale,
  token?: string,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: buildApiHeaders(locale, token),
    // Do not set Content-Type — browser must set multipart boundary.
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path}: ${res.status} ${text}`);
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

export const AUTH_TOKEN_KEY = "e2h_token";

export const AUTH_TOKEN_EVENT = "e2h:auth-token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  else localStorage.removeItem(AUTH_TOKEN_KEY);
  emitStoreChange(AUTH_TOKEN_EVENT);
}

export function subscribeAuthToken(onStoreChange: () => void): () => void {
  const unSub = listenStorageKey(AUTH_TOKEN_KEY, onStoreChange);
  const unEv = listenWindowEvent(AUTH_TOKEN_EVENT, onStoreChange);
  return () => {
    unSub();
    unEv();
  };
}

export function getAuthTokenServerSnapshot(): null {
  return null;
}
