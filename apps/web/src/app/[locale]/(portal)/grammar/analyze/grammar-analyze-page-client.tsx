"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { GrammarAnalyzeForm } from "@/components/learning/grammar-analyze-form";
import type { GrammarAnalysisQuota } from "@/lib/grammar-analysis";

export function GrammarAnalyzePageClient() {
  const t = useTranslations("grammarAnalyze");
  const [quota, setQuota] = useState<GrammarAnalysisQuota | null>(null);

  return (
    <div className="space-y-4">
      {quota ? (
        <p className="text-sm text-muted-foreground">
          {t("quotaRemaining", { remaining: quota.remaining, limit: quota.limit })}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">{t("quotaHint")}</p>
      )}
      <GrammarAnalyzeForm onQuotaChange={setQuota} />
    </div>
  );
}
