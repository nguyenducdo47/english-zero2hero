"use client";

import { useTranslations } from "next-intl";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTenseGroupsPanel } from "@/components/admin/panels/admin-tense-groups-panel";
import { useAuthToken } from "@/hooks/use-auth-token";

export function AdminTenseGroupsPageClient() {
  const t = useTranslations("admin");
  const token = useAuthToken();
  if (!token) return null;
  return (
    <>
      <AdminPageHeader title={t("nav.tenseGroups")} description={t("content.tenseGroups.pageDesc")} />
      <AdminTenseGroupsPanel token={token} />
    </>
  );
}
