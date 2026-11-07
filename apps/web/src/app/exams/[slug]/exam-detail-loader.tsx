"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExamClient } from "./exam-client";
import { apiGet, getStoredToken } from "@/lib/api";

export function ExamDetailLoader({ slug }: { slug: string }) {
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
    }>(`/api/v1/exams/${slug}`, token)
      .then((res) => {
        setTitle(res.data.title);
        setQuestions(res.data.questions);
      })
      .catch((e) => setError(e.message));
  }, [slug]);

  if (error === "login") {
    return (
      <p>
        <Link href="/login" className="text-indigo-600 underline">
          Đăng nhập
        </Link>{" "}
        để xem đề.
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
