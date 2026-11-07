"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { apiGet, getStoredToken } from "@/lib/api";
import type { Locale } from "@/i18n/routing";

type Exam = {
  id: number;
  slug: string;
  title: string;
  exam_type: string;
  skill_mode: string;
};

export function ExamsPageClient() {
  const t = useTranslations("exams");
  const locale = useLocale() as Locale;
  const [exams, setExams] = useState<Exam[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setError("login");
      return;
    }
    apiGet<{ data: Exam[] }>("/api/v1/exams", locale, token)
      .then((res) => setExams(res.data))
      .catch((e) => setError(e.message));
  }, [locale]);

  if (error === "login") {
    return (
      <div className="space-y-3">
        <p className="text-rose-700">{t("loginRequired")}</p>
        <Link href="/login" className="text-indigo-600 underline dark:text-indigo-400">
          {t("loginLink")}
        </Link>
      </div>
    );
  }

  if (error) {
    return <p className="text-rose-700">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <ul className="space-y-3">
        {exams.map((exam) => (
          <li key={exam.id}>
            <Link
              href={`/exams/${exam.slug}`}
              className="block rounded-xl border border-border bg-surface p-4 hover:border-indigo-300 dark:hover:border-indigo-500"
            >
              <p className="font-medium">{exam.title}</p>
              <p className="text-xs uppercase text-slate-500 dark:text-slate-400">
                {t("skills", {
                  type: exam.exam_type,
                  mode: exam.skill_mode,
                })}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      {!exams.length && (
        <p className="text-sm text-slate-600 dark:text-slate-400">{t("loading")}</p>
      )}
    </div>
  );
}
