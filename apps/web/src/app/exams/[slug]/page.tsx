import { Suspense } from "react";
import { ExamPageClient } from "./exam-page-client";

export const instant = false;

export default function ExamDetailPage() {
  return (
    <Suspense fallback={<p className="text-slate-600">Đang tải đề...</p>}>
      <ExamPageClient />
    </Suspense>
  );
}
