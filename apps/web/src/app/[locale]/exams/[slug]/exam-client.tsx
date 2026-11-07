"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { apiPost, getStoredToken } from "@/lib/api";
import type { Locale } from "@/i18n/routing";

type Question = {
  id: number;
  type: string;
  prompt?: string;
  prompt_en?: string;
  options?: string[] | null;
};

type Props = {
  slug: string;
  title: string;
  questions: Question[];
};

export function ExamClient({ slug, title, questions }: Props) {
  const locale = useLocale() as Locale;
  const t = useTranslations("exams");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [writing, setWriting] = useState({ prompt: "", text: "" });
  const [result, setResult] = useState<object | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const token = getStoredToken();
    if (!token) {
      setError(t("needLogin"));
      return;
    }
    try {
      const res = await apiPost(
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
      setResult(res as object);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  };

  return (
    <div className="space-y-6">
      {error && <p className="text-rose-700">{error}</p>}
      {questions.map((q, i) => (
        <div key={q.id} className="rounded-xl bg-surface p-4 shadow-sm dark:shadow-black/20">
          <p className="font-medium">
            {i + 1}. {q.prompt ?? q.prompt_en}
          </p>
          <div className="mt-2 space-y-1">
            {q.options?.map((opt, oi) => (
              <label key={oi} className="flex gap-2 text-sm">
                <input
                  type="radio"
                  name={`e-${q.id}`}
                  onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}
      <div className="rounded-xl border border-dashed border-slate-300 p-4">
        <p className="text-sm font-medium">{t("writingAi")}</p>
        <textarea
          className="mt-2 w-full rounded border p-2 text-sm"
          rows={4}
          placeholder={t("writingPlaceholder")}
          value={writing.text}
          onChange={(e) => setWriting((w) => ({ ...w, text: e.target.value }))}
        />
      </div>
      <button
        type="button"
        onClick={submit}
        className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white"
      >
        {t("submit")}
      </button>
      {result && (
        <pre className="overflow-auto rounded bg-slate-900 p-4 text-xs text-slate-100">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
