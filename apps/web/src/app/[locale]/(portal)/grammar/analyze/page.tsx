import { getLocale, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import type { Locale } from "@/i18n/routing";
import { fetchSeoResolve, mergeMetadataWithSeo } from "@/lib/seo-metadata";
import { GrammarAnalyzePageClient } from "./grammar-analyze-page-client";

export const instant = false;

export async function generateMetadata() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations({ locale, namespace: "grammarAnalyze" });
  const resolved = await fetchSeoResolve("/grammar/analyze", locale);
  return mergeMetadataWithSeo(resolved, {
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function GrammarAnalyzePage() {
  const t = await getTranslations("grammarAnalyze");

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} description={t("intro")} />
      <GrammarAnalyzePageClient />
    </div>
  );
}
