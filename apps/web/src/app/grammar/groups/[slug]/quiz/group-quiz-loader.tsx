"use client";

import { useEffect, useState } from "react";
import { QuizRunner } from "@/components/quiz-runner";
import { apiGet } from "@/lib/api";

type Question = {
  id: number;
  type: string;
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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{
      data: { questions: Question[] };
    }>(`/api/v1/grammar/tense-groups/${slug}/quiz?limit=10`)
      .then((res) => setQuestions(res.data.questions))
      .catch(() =>
        setError("Không tải được câu hỏi. Chạy `php artisan serve` trong apps/api."),
      );
  }, [slug]);

  if (error) {
    return <p className="text-rose-700">{error}</p>;
  }

  if (!questions.length) {
    return <p className="text-sm text-slate-600">Đang tải câu hỏi...</p>;
  }

  return (
    <QuizRunner groupSlug={slug} groupName={groupName} questions={questions} />
  );
}
