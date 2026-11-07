"use client";

import { FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { apiPost, getStoredToken } from "@/lib/api";
import type { Locale } from "@/i18n/routing";

export function MockExamsPageClient() {
  const t = useTranslations("mock");
  const locale = useLocale() as Locale;
  const [examSlug, setExamSlug] = useState("toeic-mini-lr-450");
  const [scheduledAt, setScheduledAt] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const token = getStoredToken();
    if (!token) {
      setMessage(t("loginFirst"));
      return;
    }
    try {
      const res = await apiPost<{ data: { id: number } }>(
        "/api/v1/mock-registrations",
        { exam_slug: examSlug, scheduled_at: scheduledAt },
        locale,
        token,
      );
      setMessage(t("registered", { id: res.data.id }));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error");
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <form onSubmit={submit} className="space-y-4 rounded-xl bg-surface p-6 shadow dark:shadow-black/20">
        <label className="block text-sm">
          {t("examCode")}
          <input
            className="mt-1 w-full rounded border border-border bg-background px-3 py-2"
            value={examSlug}
            onChange={(e) => setExamSlug(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          {t("time")}
          <input
            type="datetime-local"
            className="mt-1 w-full rounded border border-border bg-background px-3 py-2"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white"
        >
          {t("register")}
        </button>
      </form>
      {message && <p className="text-sm text-slate-700 dark:text-slate-300">{message}</p>}
    </div>
  );
}
