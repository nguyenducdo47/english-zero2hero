import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { getAllTenseSlugs } from "@/lib/grammar-data";
import { TenseQuizPageContent } from "./tense-quiz-page-content";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const instant = false;

export function generateStaticParams() {
  return getAllTenseSlugs().map((slug) => ({ slug }));
}

export default async function TenseQuizPage({ params }: Props) {
  const t = await getTranslations("grammar");

  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">{t("quizLoading")}</p>}>
      <TenseQuizPageContent params={params} />
    </Suspense>
  );
}
