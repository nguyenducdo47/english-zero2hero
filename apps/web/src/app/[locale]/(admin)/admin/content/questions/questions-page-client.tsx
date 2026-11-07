"use client";

import { useTranslations } from "next-intl";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminQuestionsPanel } from "@/components/admin/panels/admin-questions-panel";
import { useAuthToken } from "@/hooks/use-auth-token";

export function AdminQuestionsPageClient() {
  const t = useTranslations("admin");
  const token = useAuthToken();
  if (!token) return null;
  return (
    <>
      <AdminPageHeader title={t("nav.questions")} description={t("content.questions.pageDesc")} />
      <AdminQuestionsPanel token={token} />
    </>
  );
}
