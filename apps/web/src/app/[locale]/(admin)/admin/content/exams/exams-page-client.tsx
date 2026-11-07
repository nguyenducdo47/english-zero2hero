"use client";

import { useTranslations } from "next-intl";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminExamsPanel } from "@/components/admin/panels/admin-exams-panel";
import { useAuthToken } from "@/hooks/use-auth-token";

export function AdminExamsPageClient() {
  const t = useTranslations("admin");
  const token = useAuthToken();
  if (!token) return null;
  return (
    <>
      <AdminPageHeader title={t("nav.exams")} description={t("content.exams.pageDesc")} />
      <AdminExamsPanel token={token} />
    </>
  );
}
