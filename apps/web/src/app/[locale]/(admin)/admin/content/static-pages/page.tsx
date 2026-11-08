import { getTranslations } from "next-intl/server";
import { AdminStaticPagesPageClient } from "./static-pages-page-client";

export const instant = false;

export async function generateMetadata() {
  const t = await getTranslations("admin");
  return { title: t("nav.staticPages") };
}

export default function AdminStaticPagesPage() {
  return <AdminStaticPagesPageClient />;
}
