"use client";

import { useTranslations } from "next-intl";
import { Flame, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLearningStats } from "@/hooks/use-learning-stats";

export function LearningStatsBar() {
  const t = useTranslations("gamification");
  const stats = useLearningStats();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="secondary" className="gap-1 font-normal">
        <Flame className="size-3.5 text-accent-brand" aria-hidden />
        {t("streak", { days: stats.streakDays })}
      </Badge>
      <Badge variant="outline" className="gap-1 font-normal">
        <Sparkles className="size-3.5 text-primary" aria-hidden />
        {t("xp", { xp: stats.xp })}
      </Badge>
    </div>
  );
}
