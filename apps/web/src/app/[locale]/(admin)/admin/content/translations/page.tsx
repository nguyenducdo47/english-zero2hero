import { getTranslations } from "next-intl/server";
import { AdminTranslationsPageClient } from "./translations-page-client";

export const instant = false;

export async function generateMetadata() {
  const t = await getTranslations("admin");
  return { title: t("nav.translations") };
}

export default function AdminTranslationsPage() {
  return <AdminTranslationsPageClient />;
}
