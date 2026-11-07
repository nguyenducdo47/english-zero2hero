"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { apiGet } from "@/lib/api";
import { formatApiError } from "@/lib/api-error";
import { useAuthToken } from "@/hooks/use-auth-token";
import { toast } from "@/lib/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageHeader } from "./admin-page-header";

type Metrics = {
  users_total: number;
  users_admins: number;
  locales_active: number;
  locales_total: number;
  tense_groups: number;
  tenses: number;
  questions: number;
  exams_total: number;
  exams_published: number;
  integrations_configured: number;
};

export function AdminDashboardClient() {
  const t = useTranslations("admin");
  const tToast = useTranslations("toast");
  const locale = useLocale() as Locale;
  const token = useAuthToken();
  const [data, setData] = useState<Metrics | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiGet<{ data: Metrics }>("/api/v1/admin/metrics", locale, token);
        if (!cancelled) setData(res.data);
      } catch (e) {
        if (!cancelled) toast.error(tToast("errorTitle"), formatApiError(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locale, token, tToast]);

  const tiles: { key: keyof Metrics; label: string }[] = [
    { key: "users_total", label: t("metrics.usersTotal") },
    { key: "users_admins", label: t("metrics.usersAdmins") },
    { key: "locales_active", label: t("metrics.localesActive") },
    { key: "tenses", label: t("metrics.tenses") },
    { key: "questions", label: t("metrics.questions") },
    { key: "exams_published", label: t("metrics.examsPublished") },
    { key: "integrations_configured", label: t("metrics.integrationsConfigured") },
  ];

  return (
    <>
      <AdminPageHeader title={t("nav.dashboard")} description={t("dashboardDesc")} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map(({ key, label }) => (
          <Card
            key={key}
            className="border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[var(--admin-text-muted)]">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums text-[var(--admin-text)]">
                {data ? data[key] : "—"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
