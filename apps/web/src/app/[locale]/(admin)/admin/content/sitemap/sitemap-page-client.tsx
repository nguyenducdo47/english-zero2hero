"use client";

import { useTranslations } from "next-intl";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSitemapPanel } from "@/components/admin/panels/admin-sitemap-panel";
import { useAuthToken } from "@/hooks/use-auth-token";

export function AdminSitemapPageClient() {
  const t = useTranslations("admin");
  const token = useAuthToken();
  if (!token) return null;
  return (
    <>
      <AdminPageHeader title={t("nav.sitemap")} description={t("sitemap.pageDesc")} />
      <AdminSitemapPanel token={token} />
    </>
  );
}
