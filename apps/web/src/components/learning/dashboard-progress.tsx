"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GROUP_COUNT, TENSE_COUNT } from "@/lib/grammar-slugs";
import { Progress } from "@/components/ui/progress";
import { useLearningStats } from "@/hooks/use-learning-stats";

export function DashboardProgress() {
  const t = useTranslations("dashboard");
  const stats = useLearningStats();

  const tensePct = Math.round((stats.completedTenses.length / TENSE_COUNT) * 100);
  const groupPct = Math.round((stats.completedGroups.length / GROUP_COUNT) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("progressTitle")}</CardTitle>
        <CardDescription>{t("localHint")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t("tensesLabel")}</span>
            <span>
              {stats.completedTenses.length}/{TENSE_COUNT}
            </span>
          </div>
          <Progress value={tensePct} className="h-2" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t("groupsLabel")}</span>
            <span>
              {stats.completedGroups.length}/{GROUP_COUNT}
            </span>
          </div>
          <Progress value={groupPct} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
