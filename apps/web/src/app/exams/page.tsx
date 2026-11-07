"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet, getStoredToken } from "@/lib/api";

type Exam = {
  id: number;
  slug: string;
  title: string;
  exam_type: string;
  skill_mode: string;
};

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setError("Vui lòng đăng nhập để xem đề.");
      return;
    }
    apiGet<{ data: Exam[] }>("/api/v1/exams", token)
      .then((res) => setExams(res.data))
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-rose-700">{error}</p>
        <Link href="/login" className="text-indigo-600 underline">
          Đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bộ đề ôn thi</h1>
      <ul className="space-y-3">
        {exams.map((exam) => (
          <li key={exam.id}>
            <Link
              href={`/exams/${exam.slug}`}
              className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-indigo-300"
            >
              <p className="font-medium">{exam.title}</p>
              <p className="text-xs uppercase text-slate-500">
                {exam.exam_type} · {exam.skill_mode} skills
              </p>
            </Link>
          </li>
        ))}
      </ul>
      {!exams.length && (
        <p className="text-sm text-slate-600">Đang tải hoặc chưa có đề.</p>
      )}
    </div>
  );
}
