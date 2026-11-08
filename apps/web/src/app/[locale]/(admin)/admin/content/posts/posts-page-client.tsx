"use client";

import { useTranslations } from "next-intl";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminContentPostsPanel } from "@/components/admin/panels/admin-content-posts-panel";
import { useAuthToken } from "@/hooks/use-auth-token";

export function AdminContentPostsPageClient() {
  const t = useTranslations("admin");
  const token = useAuthToken();
  if (!token) return null;
  return (
    <>
      <AdminPageHeader
        description={t("content.posts.pageDesc")}
        title={t("nav.articles")}
      />
      <AdminContentPostsPanel token={token} />
    </>
  );
}
