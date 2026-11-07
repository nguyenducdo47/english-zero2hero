"use client";

import { useTranslations } from "next-intl";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTensesPanel } from "@/components/admin/panels/admin-tenses-panel";
import { useAuthToken } from "@/hooks/use-auth-token";

export function AdminTensesPageClient() {
  const t = useTranslations("admin");
  const token = useAuthToken();
  if (!token) return null;
  return (
    <>
      <AdminPageHeader title={t("nav.tenses")} description={t("content.tenses.pageDesc")} />
      <AdminTensesPanel token={token} />
    </>
  );
}
