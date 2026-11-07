import { getTranslations } from "next-intl/server";
import { AdminQuestionsPageClient } from "./questions-page-client";

export const instant = false;

export async function generateMetadata() {
  const t = await getTranslations("admin");
  return { title: t("nav.questions") };
}

export default function AdminQuestionsPage() {
  return <AdminQuestionsPageClient />;
}
