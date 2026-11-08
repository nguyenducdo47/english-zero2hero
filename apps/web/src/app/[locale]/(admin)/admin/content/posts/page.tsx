import { getTranslations } from "next-intl/server";
import { AdminContentPostsPageClient } from "./posts-page-client";

export const instant = false;

export async function generateMetadata() {
  const t = await getTranslations("admin");
  return { title: t("nav.articles") };
}

export default function AdminContentPostsPage() {
  return <AdminContentPostsPageClient />;
}
