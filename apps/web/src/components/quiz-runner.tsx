"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { apiPost } from "@/lib/api";
import type { Locale } from "@/i18n/routing";
import { markGroupComplete } from "@/lib/progress";
import { recordStudyActivity, writeLearningStats } from "@/lib/learning-stats";
import { toast } from "@/lib/toast";
import { QuizQuestionStep, type QuizQuestion } from "@/components/learning/quiz-question-step";
import { QuizResults, type QuizResultRow } from "@/components/learning/quiz-results";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type Props = {
  groupSlug: string;
  groupName: string;
  questions: QuizQuestion[];
};

type DoneState = {
  score: number;
  max_score: number;
  results: QuizResultRow[];
};

export function QuizRunner({ groupSlug, groupName, questions }: Props) {
  const locale = useLocale() as Locale;
  const t = useTranslations("quiz");
  const tToast = useTranslations("toast");
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<DoneState | null>(null);

  const total = questions.length;
  const current = questions[step];
  const answeredCount = useMemo(
    () => questions.filter((q) => answers[q.id] !== undefined && answers[q.id] !== "").length,
    [answers, questions],
  );

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        answers: questions.map((q) => ({
          question_id: q.id,
          answer:
            q.type === "multiple_choice"
              ? { index: Number(answers[q.id]) }
              : { text: String(answers[q.id] ?? "") },
        })),
      };
      const res = await apiPost<{
        data: { score: number; max_score: number; results: DoneState["results"] };
      }>(`/api/v1/quizzes/tense-groups/${groupSlug}/attempts`, payload, locale);
      setDone(res.data);
      toast.success(
        tToast("successTitle"),
        t("result", {
          group: groupName,
          score: res.data.score,
          max: res.data.max_score,
        }),
      );
      markGroupComplete(groupSlug);
      const stats = recordStudyActivity(25);
      if (!stats.completedGroups.includes(groupSlug)) {
        writeLearningStats({
          ...stats,
          completedGroups: [...stats.completedGroups, groupSlug],
        });
      }
    } catch (e) {
      toast.error(
        tToast("errorTitle"),
        e instanceof Error ? e.message : t("submitError"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <QuizResults
        groupName={groupName}
        score={done.score}
        maxScore={done.max_score}
        results={done.results}
        grammarHref="/grammar"
      />
    );
  }

  if (!current) {
    return (
      <Alert>
        <AlertDescription>{t("noQuestions")}</AlertDescription>
      </Alert>
    );
  }

  const progressPct = total > 0 ? ((step + 1) / total) * 100 : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t("focusMode")}</span>
          <span>
            {t("answered", { count: answeredCount, total })}
          </span>
        </div>
        <Progress value={progressPct} className="h-2" />
      </div>

      <QuizQuestionStep
        index={step}
        total={total}
        question={current}
        value={answers[current.id]}
        onChange={(v) => setAnswers((a) => ({ ...a, [current.id]: v }))}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          <ChevronLeft className="size-4" aria-hidden />
          {t("prev")}
        </Button>

        {step < total - 1 ? (
          <Button type="button" size="sm" onClick={() => setStep((s) => s + 1)}>
            {t("next")}
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        ) : (
          <Button
            type="button"
            disabled={submitting || answeredCount < total}
            onClick={submit}
          >
            {submitting ? t("submitting") : t("submit")}
          </Button>
        )}
      </div>
      {answeredCount < total && step === total - 1 && (
        <p className="text-center text-xs text-muted-foreground">{t("answerAllHint")}</p>
      )}
    </div>
  );
}
