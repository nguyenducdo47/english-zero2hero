import { getTranslations } from "next-intl/server";
import { MaintenancePageClient } from "./maintenance-page-client";

export async function generateMetadata() {
  const t = await getTranslations("errors");
  return {
    title: t("metaTitle503"),
    robots: { index: false, follow: false },
  };
}

export default function MaintenancePage() {
  return <MaintenancePageClient />;
}
