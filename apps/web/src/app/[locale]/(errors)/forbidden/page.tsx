import { getTranslations } from "next-intl/server";
import { HttpStatusPage } from "@/components/errors/http-status-page";
import { buildErrorPageProps } from "@/lib/error-page-props";

export async function generateMetadata() {
  const t = await getTranslations("errors");
  return {
    title: t("metaTitle403"),
    robots: { index: false, follow: false },
  };
}

export default async function ForbiddenPage() {
  const t = await getTranslations("errors");
  const nav = await getTranslations("nav");

  const props = buildErrorPageProps(403, t, nav("brand"), {
    primaryCta: "dashboard",
    showDashboard: true,
    showHome: true,
  });

  return <HttpStatusPage {...props} />;
}
