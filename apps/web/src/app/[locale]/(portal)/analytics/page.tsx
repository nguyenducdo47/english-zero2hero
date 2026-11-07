import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LearningStatsBar } from "@/components/learning/learning-stats-bar";
import { AnalyticsPageClient } from "./analytics-page-client";

export const instant = false;

export default async function AnalyticsPage() {
  const t = await getTranslations("analytics");

  const groupNames = [
    t("groupPresent"),
    t("groupPast"),
    t("groupFuture"),
    t("groupPerfect"),
  ];

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} description={t("intro")} />
      <LearningStatsBar />
      <Card>
        <CardHeader>
          <CardTitle>{t("chartTitle")}</CardTitle>
          <CardDescription>{t("chartDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <AnalyticsPageClient
            tenseLabel={t("tensesAxis")}
            groupLabel={t("groupDone")}
            groupNames={groupNames}
          />
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">{t("apiHint")}</p>
    </div>
  );
}
