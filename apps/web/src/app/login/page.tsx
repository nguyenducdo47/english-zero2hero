"use client";

import { useState } from "react";
import { apiGet, setStoredToken } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loginGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<{ url: string }>("/api/v1/auth/google/redirect");
      window.location.href = res.url;
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Không kết nối API. Cấu hình GOOGLE_* trong apps/api/.env",
      );
      setLoading(false);
    }
  };

  const devLogin = () => {
    setStoredToken("dev-placeholder");
    router.push("/exams");
  };

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-2xl bg-white p-8 shadow">
      <h1 className="text-xl font-bold">Đăng nhập</h1>
      <p className="text-sm text-slate-600">
        Ôn TOEIC/IELTS, đăng ký thi thử và đồng bộ tiến độ (sau khi đăng nhập
        Google).
      </p>
      {error && (
        <p className="rounded bg-rose-100 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={loginGoogle}
        disabled={loading}
        className="w-full rounded-full bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        {loading ? "Đang chuyển..." : "Đăng nhập bằng Google"}
      </button>
      <button
        type="button"
        onClick={devLogin}
        className="w-full text-xs text-slate-500 underline"
      >
        Dev: vào trang đề (cần token thật từ API)
      </button>
    </div>
  );
}
