"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { markGroupComplete } from "@/lib/progress";

type QuizQuestion = {
  id: number;
  type: string;
  prompt_en: string;
  prompt_vi?: string | null;
  options?: string[] | null;
};

type Props = {
  groupSlug: string;
  groupName: string;
  questions: QuizQuestion[];
};

type ResultRow = {
  question_id: number;
  is_correct: boolean;
  correct_answer: unknown;
  explanation_vi?: string;
};

export function QuizRunner({ groupSlug, groupName, questions }: Props) {
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{
    score: number;
    max_score: number;
    results: ResultRow[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
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
        data: { score: number; max_score: number; results: ResultRow[] };
      }>(`/api/v1/quizzes/tense-groups/${groupSlug}/attempts`, payload);
      setDone(res.data);
      markGroupComplete(groupSlug);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi gửi bài");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">
          Kết quả — {groupName}: {done.score}/{done.max_score}
        </h2>
        <ul className="space-y-3">
          {done.results.map((r, idx) => (
            <li
              key={r.question_id}
              className={`rounded-lg border p-3 ${r.is_correct ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}
            >
              <p className="font-medium">
                Câu {idx + 1}: {r.is_correct ? "Đúng" : "Sai"}
              </p>
              {!r.is_correct && (
                <p className="text-sm text-slate-700">
                  Đáp án đúng: {JSON.stringify(r.correct_answer)}
                </p>
              )}
              {r.explanation_vi && (
                <p className="mt-1 text-sm text-slate-600">{r.explanation_vi}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-md bg-rose-100 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      )}
      {questions.map((q, idx) => (
        <div key={q.id} className="rounded-xl border border-slate-200 p-4">
          <p className="font-medium text-slate-900">
            {idx + 1}. {q.prompt_en}
          </p>
          {q.prompt_vi && (
            <p className="text-sm text-slate-600">{q.prompt_vi}</p>
          )}
          {q.type === "multiple_choice" && q.options && (
            <div className="mt-3 space-y-2">
              {q.options.map((opt, oi) => (
                <label key={oi} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={answers[q.id] === oi}
                    onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                  />
                  {opt}
                </label>
              ))}
            </div>
          )}
          {q.type === "fill_blank" && (
            <input
              className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Điền dạng đúng của động từ..."
              value={String(answers[q.id] ?? "")}
              onChange={(e) =>
                setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
              }
            />
          )}
        </div>
      ))}
      <button
        type="button"
        disabled={submitting}
        onClick={submit}
        className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {submitting ? "Đang chấm..." : "Nộp bài"}
      </button>
    </div>
  );
}
