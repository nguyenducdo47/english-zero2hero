import { getTranslations } from "next-intl/server";
import { AdminSitemapPageClient } from "./sitemap-page-client";

export const instant = false;

export async function generateMetadata() {
  const t = await getTranslations("admin");
  return { title: t("nav.sitemap") };
}

export default function AdminSitemapPage() {
  return <AdminSitemapPageClient />;
}
