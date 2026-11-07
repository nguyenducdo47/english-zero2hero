"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { type Locale, routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("locale");

  const onChange = (next: Locale) => {
    router.replace(pathname, { locale: next });
  };

  return (
    <label className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
      <span className="sr-only">{t("label")}</span>
      <select
        className="rounded border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
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
