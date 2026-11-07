"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { QuizRunner } from "@/components/quiz-runner";
import { apiGet } from "@/lib/api";
import type { Locale } from "@/i18n/routing";

type Question = {
  id: number;
  type: string;
  prompt?: string;
  prompt_en: string;
  prompt_vi?: string | null;
  options?: string[] | null;
};

export function GroupQuizLoader({
  slug,
  groupName,
}: {
  slug: string;
  groupName: string;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations("grammar");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{
      data: { questions: Question[] };
    }>(`/api/v1/grammar/tense-groups/${slug}/quiz?limit=10`, locale)
      .then((res) => setQuestions(res.data.questions))
      .catch(() => setError(t("quizApiError")));
  }, [slug, locale, t]);

  if (error) {
    return <p className="text-rose-700">{error}</p>;
  }

  if (!questions.length) {
    return <p className="text-sm text-slate-600">{t("quizLoading")}</p>;
  }

  return (
    <QuizRunner groupSlug={slug} groupName={groupName} questions={questions} />
  );
}
