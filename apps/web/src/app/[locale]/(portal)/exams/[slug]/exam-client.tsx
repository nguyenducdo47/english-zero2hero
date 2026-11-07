"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { apiPost, getStoredToken } from "@/lib/api";
import { toast } from "@/lib/toast";
import type { Locale } from "@/i18n/routing";
import { QuizQuestionStep, type QuizQuestion } from "@/components/learning/quiz-question-step";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

type Question = {
  id: number;
  type: string;
  prompt?: string;
  prompt_en?: string;
  prompt_locale?: string | null;
  options?: string[] | null;
};

export type AttemptResult = {
  data?: {
    attempt_id: number;
    objective_score: number | null;
    objective_max: number | null;
    ai_reviews?: Record<string, unknown>;
  };
};

export type ExamClientHandle = {
  submit: () => Promise<void>;
  hasSubmitted: () => boolean;
};

type Props = {
  slug: string;
  title: string;
  questions: Question[];
  lockAfterSubmit?: boolean;
  submitLabel?: string;
  autoSubmitBanner?: string | null;
};

export const ExamClient = forwardRef<ExamClientHandle, Props>(function ExamClient(
  { slug, title, questions, lockAfterSubmit = true, submitLabel, autoSubmitBanner },
  ref,
) {
  const locale = useLocale() as Locale;
  const t = useTranslations("exams");
  const tToast = useTranslations("toast");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [writing, setWriting] = useState({ prompt: "", text: "" });
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  const answered = questions.filter((q) => answers[q.id] !== undefined).length;
  const progressPct = questions.length
    ? Math.round((answered / questions.length) * 100)
    : 0;

  const submit = useCallback(async () => {
    if (submittedRef.current && lockAfterSubmit) return;
    const token = getStoredToken();
    if (!token) {
      toast.error(tToast("errorTitle"), t("needLogin"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiPost<AttemptResult>(
        `/api/v1/exams/${slug}/attempts`,
        {
          answers: questions.map((q) => ({
            question_id: q.id,
            answer: { index: answers[q.id] ?? 0 },
          })),
          writing: writing.text
            ? { prompt: writing.prompt || title, text: writing.text }
            : undefined,
        },
        locale,
        token,
      );
      setResult(res);
      submittedRef.current = true;
      if (res.data?.objective_max != null) {
        toast.success(
          t("resultTitle"),
          t("objectiveScore", {
            score: res.data.objective_score ?? 0,
            max: res.data.objective_max,
          }),
        );
      } else {
        toast.success(tToast("successTitle"), t("resultTitle"));
      }
    } catch (e) {
      toast.error(
        tToast("errorTitle"),
        e instanceof Error ? e.message : "Error",
      );
    } finally {
      setSubmitting(false);
    }
  }, [answers, locale, lockAfterSubmit, questions, slug, t, tToast, title, writing]);

  useImperativeHandle(
    ref,
    () => ({
      submit,
      hasSubmitted: () => submittedRef.current,
    }),
    [submit],
  );

  const formLocked = submitting || (lockAfterSubmit && submittedRef.current);

  return (
    <div className="space-y-6">
      {autoSubmitBanner && (
        <Alert>
          <AlertDescription>{autoSubmitBanner}</AlertDescription>
        </Alert>
      )}

      {questions.length > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t("answered", { count: answered, total: questions.length })}</span>
            <span>{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-2" />
        </div>
      )}

      {questions.map((q, i) => {
        const quizQ: QuizQuestion = {
          id: q.id,
          type: q.type === "multiple_choice" ? "multiple_choice" : "fill_blank",
          prompt_en: q.prompt_en ?? q.prompt ?? "",
          prompt_locale: q.prompt_locale,
          options: q.options,
        };
        return (
          <QuizQuestionStep
            key={q.id}
            index={i}
            total={questions.length}
            question={quizQ}
            value={answers[q.id]}
            onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: Number(v) }))}
          />
        );
      })}

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">{t("writingAi")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="exam-writing" className="sr-only">
            {t("writingAi")}
          </Label>
          <textarea
            id="exam-writing"
            disabled={formLocked}
            className="flex min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
            rows={4}
            placeholder={t("writingPlaceholder")}
            value={writing.text}
            onChange={(e) => setWriting((w) => ({ ...w, text: e.target.value }))}
          />
        </CardContent>
      </Card>

      <Button type="button" size="lg" disabled={formLocked} onClick={submit}>
        {submitting ? t("submitting") : submitLabel ?? t("submit")}
      </Button>

      {result?.data && (
        <Alert>
          <AlertTitle>{t("resultTitle")}</AlertTitle>
          <AlertDescription className="space-y-2">
            {result.data.objective_max != null && (
              <p>
                {t("objectiveScore", {
                  score: result.data.objective_score ?? 0,
                  max: result.data.objective_max,
                })}
              </p>
            )}
            {result.data.ai_reviews?.writing != null && (
              <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs">
                {JSON.stringify(result.data.ai_reviews.writing, null, 2)}
              </pre>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
});
