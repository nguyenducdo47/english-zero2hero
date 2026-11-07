"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { LearningStats } from "@/lib/learning-stats";
import { TENSE_COUNT } from "@/lib/grammar-slugs";
import { useLearningStats } from "@/hooks/use-learning-stats";
import { CheckCircle2, CircleDashed } from "lucide-react";

const LEVEL_IDS = [
  "foundation",
  "basic",
  "elementary",
  "preIntermediate",
  "intermediate",
  "upperIntermediate",
  "advanced",
] as const;

function currentLevelIndex(stats: LearningStats): number {
  const t = stats.completedTenses.length;
  const g = stats.completedGroups.length;
  if (g >= 3 || t >= TENSE_COUNT) return 6;
  if (g >= 2 || t >= 10) return 5;
  if (g >= 1 || t >= 8) return 4;
  if (t >= 6) return 3;
  if (t >= 3) return 2;
  if (t >= 1) return 1;
  return 0;
}

function levelProgress(stats: LearningStats, index: number): number {
  const t = stats.completedTenses.length;
  const g = stats.completedGroups.length;
  switch (index) {
    case 0:
      return Math.min(100, Math.round((t / Math.min(3, TENSE_COUNT)) * 100));
    case 1:
      return Math.min(100, Math.round((Math.max(0, t - 1) / 2) * 100));
    case 2:
      return Math.min(100, Math.round((Math.max(0, t - 3) / 3) * 100));
    case 3:
      return Math.min(100, Math.round((Math.max(0, t - 6) / 3) * 100));
    case 4:
      return Math.min(100, g >= 1 ? 100 : Math.round((Math.max(0, t - 8) / 2) * 100));
    case 5:
      return Math.min(100, g >= 2 ? 100 : g === 1 ? 50 : 0);
    case 6:
      return g >= 3 ? 100 : Math.round((g / 3) * 100);
    default:
      return 0;
  }
}

export function RoadmapLevels() {
  const t = useTranslations("roadmap");
  const stats = useLearningStats();

  const activeIndex = useMemo(() => currentLevelIndex(stats), [stats]);

  return (
    <div className="space-y-4">
      {LEVEL_IDS.map((id, index) => {
        const isPast = index < activeIndex;
        const isCurrent = index === activeIndex;
        const pct = levelProgress(stats, index);

        return (
          <Card
            key={id}
            className={
              isCurrent
                ? "border-primary/40 shadow-sm"
                : "border-border/80"
            }
          >
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{t("level", { n: index + 1 })}</Badge>
                  {isPast && (
                    <Badge variant="secondary" className="gap-1 font-normal">
                      <CheckCircle2 className="size-3" aria-hidden />
                      {t("statusDone")}
                    </Badge>
                  )}
                  {isCurrent && (
                    <Badge className="font-normal">{t("statusCurrent")}</Badge>
                  )}
                  {!isPast && !isCurrent && (
                    <Badge variant="outline" className="gap-1 font-normal text-muted-foreground">
                      <CircleDashed className="size-3" aria-hidden />
                      {t("statusNext")}
                    </Badge>
                  )}
                </div>
                <CardTitle>{t(`${id}Title`)}</CardTitle>
                <CardDescription className="mt-2 max-w-2xl leading-relaxed">
                  {t(`${id}Desc`)}
                </CardDescription>
                <div className="mt-4 max-w-md space-y-1">
                  <Progress value={pct} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {t("levelProgress", { pct })}
                  </p>
                </div>
              </div>
            </CardHeader>
            {id === "foundation" && (
              <CardContent>
                <Link href="/grammar" className="text-sm font-medium text-primary hover:underline">
                  {t("startGrammar")} →
                </Link>
              </CardContent>
            )}
            {(id === "intermediate" || id === "upperIntermediate") && (
              <CardContent>
                <Link href="/exams" className="text-sm font-medium text-primary hover:underline">
                  {t("viewExams")} →
                </Link>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
