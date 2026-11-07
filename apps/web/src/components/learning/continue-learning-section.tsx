import { getLocale } from "next-intl/server";
import { loadGrammar } from "@/lib/grammar-data";
import { tenseName } from "@/lib/grammar-i18n";
import type { Locale } from "@/i18n/routing";
import { ContinueLearningCard } from "@/components/learning/continue-learning-card";

export async function ContinueLearningSection() {
  const locale = (await getLocale()) as Locale;
  const { tenses } = loadGrammar();
  const items = tenses
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((t) => ({
      slug: t.slug,
      label: tenseName(t, locale),
    }));

  return <ContinueLearningCard tenseOptions={items} />;
}
