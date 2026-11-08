import { getTranslations } from "next-intl/server";
import { HttpStatusPage } from "@/components/errors/http-status-page";
import { buildErrorPageProps } from "@/lib/error-page-props";

export async function generateMetadata() {
  const t = await getTranslations("errors");
  return {
    title: t("metaTitle404"),
    robots: { index: false, follow: false },
  };
}

export default async function LocaleNotFound() {
  const t = await getTranslations("errors");
  const nav = await getTranslations("nav");

  const props = buildErrorPageProps(404, t, nav("brand"), {
    primaryCta: "home",
    showHome: true,
    showExplore: true,
    showLearningShortcuts: true,
  });

  return <HttpStatusPage {...props} />;
}
