"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { readProgress } from "@/lib/progress";

export function ProgressSummary() {
  const t = useTranslations("home");
  const [counts, setCounts] = useState({ tenses: 0, groups: 0 });

  useEffect(() => {
    const p = readProgress();
    setCounts({
      tenses: p.completedTenses.length,
      groups: p.completedGroups.length,
    });
  }, []);

  return (
    <p className="text-sm text-slate-600">
      {t("progress", {
        tenses: counts.tenses,
        groups: counts.groups,
      })}
    </p>
  );
}
