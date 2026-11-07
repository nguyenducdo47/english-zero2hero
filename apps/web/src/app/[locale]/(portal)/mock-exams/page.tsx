import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { MockExamsPageClient } from "./mock-exams-page-client";

export const instant = false;

export default async function MockExamPage() {
  const t = await getTranslations("mock");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("pageIntro")} />
      <MockExamsPageClient />
    </div>
  );
}
