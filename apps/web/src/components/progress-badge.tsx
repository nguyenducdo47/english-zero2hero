"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { useGrammarProgress } from "@/hooks/use-grammar-progress";

export function ProgressBadge() {
  const t = useTranslations("gamification");
  const p = useGrammarProgress();

  return (
    <Badge variant="outline" className="font-normal">
      {t("xp", { xp: p.completedTenses.length + p.completedGroups.length * 5 })}
    </Badge>
  );
}
