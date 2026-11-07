"use client";

import { useTranslations } from "next-intl";
import { AdminTranslationsPanel } from "@/components/admin/panels/admin-translations-panel";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { useAuthToken } from "@/hooks/use-auth-token";

export function AdminTranslationsPageClient() {
  const t = useTranslations("admin");
  const token = useAuthToken();
  if (!token) return null;
  return (
    <>
      <AdminPageHeader title={t("nav.translations")} description={t("translationsDesc")} />
      <AdminTranslationsPanel token={token} />
    </>
  );
}
