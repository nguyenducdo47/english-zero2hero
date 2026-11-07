import { getTranslations } from "next-intl/server";
import { AdminSeoPageClient } from "./seo-page-client";

export const instant = false;

export async function generateMetadata() {
  const t = await getTranslations("admin");
  return { title: t("nav.seo") };
}

export default function AdminSeoPage() {
  return <AdminSeoPageClient />;
}
