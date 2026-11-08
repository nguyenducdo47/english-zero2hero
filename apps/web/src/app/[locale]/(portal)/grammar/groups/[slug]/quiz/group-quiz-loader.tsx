"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { QuizRunner } from "@/components/quiz-runner";
import { apiGet } from "@/lib/api";
import type { Locale } from "@/i18n/routing";
import { GRAMMAR_GROUP_QUIZ_LIMIT } from "@/lib/grammar-quiz";
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
  const [poolHint, setPoolHint] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const notified = useRef(false);

  useEffect(() => {
    let cancelled = false;
    apiGet<{
      data: { questions: Question[] };
      meta?: { pool_total?: number; served_count?: number; requested_limit?: number };
    }>(
      `/api/v1/grammar/tense-groups/${slug}/quiz?limit=${GRAMMAR_GROUP_QUIZ_LIMIT}`,
      locale,
    )
      .then((res) => {
        if (!cancelled) {
          setQuestions(res.data.questions);
          const served = res.meta?.served_count ?? res.data.questions.length;
          const requested = res.meta?.requested_limit ?? GRAMMAR_GROUP_QUIZ_LIMIT;
          if (served < requested) {
            setPoolHint(t("quizPoolHint", { served, requested }));
          } else {
            setPoolHint(null);
          }
        }
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
    <div className="space-y-3">
      {poolHint ? (
        <p className="text-center text-sm text-muted-foreground">{poolHint}</p>
      ) : null}
      <QuizRunner groupSlug={slug} groupName={groupName} questions={questions} />
    </div>
  );
}
