"use client";

import { useTranslations } from "next-intl";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStaticPagesPanel } from "@/components/admin/panels/admin-static-pages-panel";
import { useAuthToken } from "@/hooks/use-auth-token";

export function AdminStaticPagesPageClient() {
  const t = useTranslations("admin");
  const token = useAuthToken();
  if (!token) return null;
  return (
    <>
      <AdminPageHeader
        description={t("content.staticPages.pageDesc")}
        title={t("nav.staticPages")}
      />
      <AdminStaticPagesPanel token={token} />
    </>
  );
}
