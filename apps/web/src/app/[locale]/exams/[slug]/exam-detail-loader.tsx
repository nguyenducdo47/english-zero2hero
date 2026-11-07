"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ExamClient } from "./exam-client";
import { apiGet, getStoredToken } from "@/lib/api";
import type { Locale } from "@/i18n/routing";

export function ExamDetailLoader({ slug }: { slug: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("exams");
  const [title, setTitle] = useState(slug);
  const [questions, setQuestions] = useState<
    { id: number; type: string; prompt_en: string; options?: string[] | null }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setError("login");
      return;
    }
    apiGet<{
      data: {
        title: string;
        questions: typeof questions;
      };
    }>(`/api/v1/exams/${slug}`, locale, token)
      .then((res) => {
        setTitle(res.data.title);
        setQuestions(res.data.questions);
      })
      .catch((e) => setError(e.message));
  }, [slug, locale]);

  if (error === "login") {
    return (
      <p>
        <Link href="/login" className="text-indigo-600 underline">
          {t("loginLink")}
        </Link>{" "}
        {t("loginToView")}
      </p>
    );
  }

  if (error) {
    return <p className="text-rose-700">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <ExamClient slug={slug} title={title} questions={questions} />
    </div>
  );
}
