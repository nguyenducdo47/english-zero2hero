"use client";

import { useTranslations } from "next-intl";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSeoPanel } from "@/components/admin/panels/admin-seo-panel";
import { useAuthToken } from "@/hooks/use-auth-token";

export function AdminSeoPageClient() {
  const t = useTranslations("admin");
  const token = useAuthToken();
  if (!token) return null;
  return (
    <>
      <AdminPageHeader title={t("nav.seo")} description={t("seo.pageDesc")} />
      <AdminSeoPanel token={token} />
    </>
  );
}
