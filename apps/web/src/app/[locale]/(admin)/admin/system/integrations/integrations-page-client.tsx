"use client";

import { useTranslations } from "next-intl";
import { AdminIntegrationsPanel } from "@/components/admin/panels/admin-integrations-panel";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { useAuthToken } from "@/hooks/use-auth-token";

export function IntegrationsPageClient() {
  const t = useTranslations("admin");
  const token = useAuthToken();
  if (!token) return null;
  return (
    <>
      <AdminPageHeader
        title={t("nav.integrations")}
        description={t("integrationsPageDesc")}
      />
      <AdminIntegrationsPanel token={token} />
    </>
  );
}
