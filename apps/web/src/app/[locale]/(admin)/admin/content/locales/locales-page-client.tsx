"use client";

import { useTranslations } from "next-intl";
import { AdminLocalesPanel } from "@/components/admin/panels/admin-locales-panel";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { useAuthToken } from "@/hooks/use-auth-token";

export function AdminLocalesPageClient() {
  const t = useTranslations("admin");
  const token = useAuthToken();
  if (!token) return null;
  return (
    <>
      <AdminPageHeader title={t("nav.locales")} description={t("localesDesc")} />
      <AdminLocalesPanel token={token} />
    </>
  );
}
