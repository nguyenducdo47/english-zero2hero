import { getLocale, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { ExamsPageClient } from "./exams-page-client";
import type { Locale } from "@/i18n/routing";
import { fetchSeoResolve, mergeMetadataWithSeo } from "@/lib/seo-metadata";

export const instant = false;

export async function generateMetadata() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("exams");
  const resolved = await fetchSeoResolve("/exams", locale);
  return mergeMetadataWithSeo(resolved, {
    title: t("title"),
    description: t("catalogIntro"),
  });
}

export default async function ExamsPage() {
  const t = await getTranslations("exams");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("catalogIntro")} />
      <ExamsPageClient />
    </div>
  );
}
