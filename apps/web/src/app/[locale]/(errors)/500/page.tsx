import { getTranslations } from "next-intl/server";
import { HttpStatusPage } from "@/components/errors/http-status-page";
import { buildErrorPageProps } from "@/lib/error-page-props";

export async function generateMetadata() {
  const t = await getTranslations("errors");
  return {
    title: t("metaTitle500"),
    robots: { index: false, follow: false },
  };
}

export default async function ServerErrorPage() {
  const t = await getTranslations("errors");
  const nav = await getTranslations("nav");

  const props = buildErrorPageProps(500, t, nav("brand"), {
    primaryCta: "home",
    showHome: true,
    showDashboard: true,
  });

  return <HttpStatusPage {...props} />;
}
