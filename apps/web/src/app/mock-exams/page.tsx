"use client";

import { FormEvent, useState } from "react";
import { apiPost, getStoredToken } from "@/lib/api";

export default function MockExamPage() {
  const [examSlug, setExamSlug] = useState("toeic-mini-lr-450");
  const [scheduledAt, setScheduledAt] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const token = getStoredToken();
    if (!token) {
      setMessage("Đăng nhập trước.");
      return;
    }
    try {
      const res = await apiPost<{ data: { id: number } }>(
        "/api/v1/mock-registrations",
        { exam_slug: examSlug, scheduled_at: scheduledAt },
        token,
      );
      setMessage(`Đã đăng ký thi thử #${res.data.id}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Lỗi");
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Đăng ký thi thử</h1>
      <form onSubmit={submit} className="space-y-4 rounded-xl bg-white p-6 shadow">
        <label className="block text-sm">
          Mã đề
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={examSlug}
            onChange={(e) => setExamSlug(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Thời gian
          <input
            type="datetime-local"
            className="mt-1 w-full rounded border px-3 py-2"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white"
        >
          Đăng ký
        </button>
      </form>
      {message && <p className="text-sm text-slate-700">{message}</p>}
    </div>
  );
}
