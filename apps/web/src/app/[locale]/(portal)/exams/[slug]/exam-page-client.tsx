"use client";

import { useParams } from "next/navigation";
import { ExamDetailLoader } from "./exam-detail-loader";

export function ExamPageClient() {
  const params = useParams();
  const slug = String(params.slug ?? "");
  return <ExamDetailLoader slug={slug} />;
}
