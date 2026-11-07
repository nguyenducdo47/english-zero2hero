import { getTranslations } from "next-intl/server";
import { AdminExamsPageClient } from "./exams-page-client";

export const instant = false;

export async function generateMetadata() {
  const t = await getTranslations("admin");
  return { title: t("nav.exams") };
}

export default function AdminExamsPage() {
  return <AdminExamsPageClient />;
}
