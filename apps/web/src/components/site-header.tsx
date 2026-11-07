"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const t = useTranslations("nav");

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-bold text-indigo-700 dark:text-indigo-400">
          {t("brand")}
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
          <Link href="/grammar" className="hover:text-indigo-600 dark:hover:text-indigo-400">
            {t("grammar")}
          </Link>
          <Link href="/exams" className="hover:text-indigo-600 dark:hover:text-indigo-400">
            {t("exams")}
          </Link>
          <Link href="/mock-exams" className="hover:text-indigo-600 dark:hover:text-indigo-400">
            {t("mock")}
          </Link>
          <Link href="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400">
            {t("login")}
          </Link>
          <ThemeToggle />
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
