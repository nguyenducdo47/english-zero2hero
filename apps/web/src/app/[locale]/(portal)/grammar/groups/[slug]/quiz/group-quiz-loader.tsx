"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { QuizRunner } from "@/components/quiz-runner";
import { apiGet } from "@/lib/api";
import type { Locale } from "@/i18n/routing";
import { toast } from "@/lib/toast";

type Question = {
  id: number;
  type: string;
  prompt_en: string;
  prompt_locale?: string | null;
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
  const tToast = useTranslations("toast");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [failed, setFailed] = useState(false);
  const notified = useRef(false);

  useEffect(() => {
    let cancelled = false;
    apiGet<{
      data: { questions: Question[] };
    }>(`/api/v1/grammar/tense-groups/${slug}/quiz?limit=10`, locale)
      .then((res) => {
        if (!cancelled) setQuestions(res.data.questions);
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          if (!notified.current) {
            notified.current = true;
            toast.error(tToast("errorTitle"), t("quizApiError"));
          }
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug, locale, t, tToast]);

  if (failed) {
    return <p className="text-sm text-muted-foreground">{t("quizApiError")}</p>;
  }

  if (!questions.length) {
    return <p className="text-sm text-muted-foreground">{t("quizLoading")}</p>;
  }

  return (
    <QuizRunner groupSlug={slug} groupName={groupName} questions={questions} />
  );
}
