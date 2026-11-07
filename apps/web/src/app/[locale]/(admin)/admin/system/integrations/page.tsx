import { getTranslations } from "next-intl/server";
import { IntegrationsPageClient } from "./integrations-page-client";

export const instant = false;

export async function generateMetadata() {
  const t = await getTranslations("admin");
  return { title: t("nav.integrations") };
}

export default function AdminIntegrationsPage() {
  return <IntegrationsPageClient />;
}
