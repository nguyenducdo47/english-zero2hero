"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  applyThemeClass,
  persistResolvedTheme,
  type ResolvedTheme,
} from "@/lib/theme-storage";
import { useResolvedTheme } from "@/hooks/use-resolved-theme";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  surface?: "portal" | "admin";
};

export function ThemeToggle({ surface = "portal" }: ThemeToggleProps) {
  const t = useTranslations("theme");
  const resolved = useResolvedTheme();

  const toggle = useCallback(() => {
    const next: ResolvedTheme = resolved === "dark" ? "light" : "dark";
    persistResolvedTheme(next);
    applyThemeClass(next);
  }, [resolved]);

  const isDark = resolved === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "rounded-lg border p-1.5 transition",
        surface === "admin"
          ? "border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text)] hover:bg-[var(--admin-sidebar-active)]"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
      )}
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
