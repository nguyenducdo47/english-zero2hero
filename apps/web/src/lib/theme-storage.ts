import {
  emitStoreChange,
  listenStorageKey,
  listenWindowEvent,
} from "@/lib/store-sync";

export const THEME_STORAGE_KEY = "ez2h-theme";

export const THEME_RESOLVED_EVENT = "e2h:theme-resolved";

export type ResolvedTheme = "light" | "dark";

export function readResolvedTheme(): ResolvedTheme {
  try {
    const t = localStorage.getItem(THEME_STORAGE_KEY);
    if (t === "dark") return "dark";
    if (t === "light") return "light";
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export function applyThemeClass(resolved: ResolvedTheme) {
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export function persistResolvedTheme(resolved: ResolvedTheme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, resolved);
    emitStoreChange(THEME_RESOLVED_EVENT);
  } catch {
    /* ignore */
  }
}

export function subscribeResolvedTheme(onStoreChange: () => void): () => void {
  const unSub = listenStorageKey(THEME_STORAGE_KEY, onStoreChange);
  const unEv = listenWindowEvent(THEME_RESOLVED_EVENT, onStoreChange);
  const mq = typeof window !== "undefined"
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;
  const onMq = () => onStoreChange();
  mq?.addEventListener("change", onMq);
  return () => {
    unSub();
    unEv();
    mq?.removeEventListener("change", onMq);
  };
}

export function getResolvedThemeServerSnapshot(): ResolvedTheme {
  return "light";
}
