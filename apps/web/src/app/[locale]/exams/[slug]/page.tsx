import { Suspense } from "react";
import { ExamPageClient } from "./exam-page-client";

export const instant = false;

export function generateStaticParams() {
  return [{ slug: "toeic-mini-lr-450" }, { slug: "ielts-mini-band-5" }];
}

function ExamLoadingFallback() {
  return <p className="text-slate-600 dark:text-slate-400">…</p>;
}

export default function ExamDetailPage() {
  return (
    <Suspense fallback={<ExamLoadingFallback />}>
      <ExamPageClient />
    </Suspense>
  );
}
