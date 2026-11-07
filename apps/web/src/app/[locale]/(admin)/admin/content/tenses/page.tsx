import { getTranslations } from "next-intl/server";
import { AdminTensesPageClient } from "./tenses-page-client";

export const instant = false;

export async function generateMetadata() {
  const t = await getTranslations("admin");
  return { title: t("nav.tenses") };
}

export default function AdminTensesPage() {
  return <AdminTensesPageClient />;
}
