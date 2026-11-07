"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const STORAGE_KEY = "ez2h-theme";
type Resolved = "light" | "dark";

function readResolved(): Resolved {
  try {
    const t = localStorage.getItem(STORAGE_KEY);
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

function apply(resolved: Resolved) {
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export function ThemeToggle() {
  const t = useTranslations("theme");
  const [resolved, setResolved] = useState<Resolved>("light");

  useEffect(() => {
    const next = readResolved();
    setResolved(next);
    apply(next);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      try {
        if (localStorage.getItem(STORAGE_KEY) === "light" || localStorage.getItem(STORAGE_KEY) === "dark") {
          return;
        }
      } catch {
        /* ignore */
      }
      const sys = mq.matches ? "dark" : "light";
      setResolved(sys);
      apply(sys);
    };
    mq.addEventListener("change", onSystemChange);
    return () => mq.removeEventListener("change", onSystemChange);
  }, []);

  const toggle = useCallback(() => {
    const next: Resolved = resolved === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    setResolved(next);
    apply(next);
  }, [resolved]);

  const isDark = resolved === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      aria-label={isDark ? t("switchToLight") : t("switchToDark")}
      title={isDark ? t("switchToLight") : t("switchToDark")}
    >
      {isDark ? (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364-.707-.707M6.343 6.343l-.707-.707m12.728 0-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
          />
        </svg>
      ) : (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646Z"
          />
        </svg>
      )}
    </button>
  );
}
