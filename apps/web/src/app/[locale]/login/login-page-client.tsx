"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { apiGet, setStoredToken } from "@/lib/api";
import type { Locale } from "@/i18n/routing";
import { useRouter } from "@/i18n/navigation";

export function LoginPageClient() {
  const t = useTranslations("login");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loginGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<{ url: string }>(
        "/api/v1/auth/google/redirect",
        locale,
      );
      window.location.href = res.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "API");
      setLoading(false);
    }
  };

  const devLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<{ token: string }>("/api/v1/auth/dev-login", locale);
      setStoredToken(res.token);
      router.push("/exams");
    } catch (e) {
      setError(e instanceof Error ? e.message : "API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-2xl bg-surface p-8 shadow dark:shadow-black/20">
      <h1 className="text-xl font-bold">{t("title")}</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">{t("intro")}</p>
      {error && (
        <p className="rounded bg-rose-100 px-3 py-2 text-sm text-rose-800 dark:bg-rose-950 dark:text-rose-200">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={loginGoogle}
        disabled={loading}
        className="w-full rounded-full bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        {loading ? t("redirecting") : t("google")}
      </button>
      <button
        type="button"
        onClick={devLogin}
        className="w-full text-xs text-slate-500 underline dark:text-slate-400"
      >
        {t("devHint")}
      </button>
    </div>
  );
}
