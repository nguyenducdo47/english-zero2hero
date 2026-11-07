"use client";

import { useTranslations } from "next-intl";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminUsersPanel } from "@/components/admin/panels/admin-users-panel";
import { useAuthToken } from "@/hooks/use-auth-token";

export function AdminUsersPageClient() {
  const t = useTranslations("admin");
  const token = useAuthToken();
  if (!token) return null;
  return (
    <>
      <AdminPageHeader title={t("nav.users")} description={t("users.pageDesc")} />
      <AdminUsersPanel token={token} />
    </>
  );
}
