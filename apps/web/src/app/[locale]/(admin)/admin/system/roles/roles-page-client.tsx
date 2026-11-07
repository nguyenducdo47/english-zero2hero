"use client";

import { useTranslations } from "next-intl";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminRolesPanel } from "@/components/admin/panels/admin-roles-panel";
import { useAuthToken } from "@/hooks/use-auth-token";

export function AdminRolesPageClient() {
  const t = useTranslations("admin");
  const token = useAuthToken();
  if (!token) return null;
  return (
    <>
      <AdminPageHeader title={t("nav.roles")} description={t("roles.pageDesc")} />
      <AdminRolesPanel token={token} />
    </>
  );
}
