import Link from "next/link";
import { ProgressSummary } from "@/components/progress-badge";

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 px-8 py-10 text-white shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight">
          English Zero2Hero
        </h1>
        <p className="mt-3 max-w-2xl text-indigo-100">
          Từ mất gốc đến luyện thi: học 12 thì không cần đăng nhập, ôn TOEIC/IELTS
          có Google login, chấm đúng/sai từng câu và gợi ý AI cho Writing/Speaking.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/grammar"
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-indigo-700"
          >
            Bắt đầu 12 thì
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white/60 px-5 py-2 text-sm font-semibold text-white"
          >
            Đăng nhập ôn thi
          </Link>
        </div>
      </section>
      <ProgressSummary />
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">Giai đoạn 1 — Grammar</h2>
          <p className="mt-2 text-sm text-slate-600">
            4 nhóm thì, ví dụ song ngữ, quiz random sau mỗi nhóm.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">Giai đoạn 2+ — TOEIC / IELTS</h2>
          <p className="mt-2 text-sm text-slate-600">
            Bộ đề, 2 hoặc 4 kỹ năng, đăng ký thi thử, API v1 cho app.
          </p>
        </div>
      </section>
    </div>
  );
}
