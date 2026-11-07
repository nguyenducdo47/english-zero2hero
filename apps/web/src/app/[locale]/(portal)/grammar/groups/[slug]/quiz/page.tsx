import { Suspense } from "react";
import { loadGrammar } from "@/lib/grammar-data";
import { GroupQuizPageContent } from "./group-quiz-page-content";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const instant = false;

export function generateStaticParams() {
  return loadGrammar().groups.map((g) => ({ slug: g.slug }));
}

export default function GroupQuizPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-slate-600">Đang tải bài ôn nhóm...</p>
      }
    >
      <GroupQuizPageContent params={params} />
    </Suspense>
  );
}
