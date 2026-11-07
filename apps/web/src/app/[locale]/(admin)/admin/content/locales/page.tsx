import { getTranslations } from "next-intl/server";
import { AdminLocalesPageClient } from "./locales-page-client";

export const instant = false;

export async function generateMetadata() {
  const t = await getTranslations("admin");
  return { title: t("nav.locales") };
}

export default function AdminLocalesPage() {
  return <AdminLocalesPageClient />;
}
