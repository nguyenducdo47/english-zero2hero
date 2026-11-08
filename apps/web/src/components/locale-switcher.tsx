"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { type Locale, routing } from "@/i18n/routing";

type LocaleSwitcherProps = {
  surface?: "portal" | "admin";
};

export function LocaleSwitcher({ surface = "portal" }: LocaleSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("locale");

  const onChange = (next: Locale) => {
    router.replace(pathname, { locale: next });
  };

  const isAdmin = surface === "admin";

  return (
    <label
      className={cn(
        "flex items-center gap-1 text-xs",
        isAdmin
          ? "text-[var(--admin-text-muted)]"
          : "text-slate-600 dark:text-slate-400",
      )}
    >
      <span className="sr-only">{t("label")}</span>
      <select
        className={cn(
          "px-2 py-1 text-xs",
          isAdmin
            ? "rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text)]"
            : "rounded border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200",
        )}
        value={locale}
        onChange={(e) => onChange(e.target.value as Locale)}
        aria-label={t("label")}
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc}>
            {t(loc)}
          </option>
        ))}
      </select>
    </label>
  );
}
