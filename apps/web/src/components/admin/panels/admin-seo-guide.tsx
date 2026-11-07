"use client";

import { useTranslations } from "next-intl";
import { BookOpen } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const WORKFLOW_STEPS = ["step1", "step2", "step3", "step4", "step5", "step6"] as const;

const GLOBAL_TIPS = ["tabGlobal1", "tabGlobal2", "tabGlobal3", "tabGlobal4"] as const;

export function AdminSeoGuide() {
  const t = useTranslations("admin.seo.guide");

  return (
    <details className="group rounded-lg border border-primary/20 bg-primary/5 open:shadow-sm">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
        <BookOpen aria-hidden className="size-4 shrink-0 text-primary" />
        <span>{t("title")}</span>
        <span className="ml-auto text-xs font-normal text-muted-foreground">
          {t("summary")}
        </span>
      </summary>
      <div className="space-y-4 border-t border-primary/10 px-4 pb-4 pt-3 text-sm text-muted-foreground">
        <p>{t("intro")}</p>

        <div>
          <p className="mb-2 font-medium text-foreground">{t("workflowTitle")}</p>
          <ol className="list-decimal space-y-1.5 pl-5">
            {WORKFLOW_STEPS.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ol>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md border border-border/60 bg-background/80 p-3">
            <p className="mb-2 font-medium text-foreground">{t("tabGlobalTitle")}</p>
            <ul className="list-disc space-y-1 pl-4">
              {GLOBAL_TIPS.map((key) => (
                <li key={key}>{t(key)}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <div className="rounded-md border border-border/60 bg-background/80 p-3">
              <p className="mb-1 font-medium text-foreground">{t("tabPagesTitle")}</p>
              <p>{t("tabPagesBody")}</p>
            </div>
            <div className="rounded-md border border-border/60 bg-background/80 p-3">
              <p className="mb-1 font-medium text-foreground">{t("tabTechnicalTitle")}</p>
              <p>{t("tabTechnicalBody")}</p>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-dashed border-border/80 bg-muted/30 p-3">
          <p className="mb-1 font-medium text-foreground">{t("exampleTitle")}</p>
          <p className="text-xs leading-relaxed">{t("exampleBody")}</p>
        </div>

        <Alert>
          <AlertTitle>{t("skipTitle")}</AlertTitle>
          <AlertDescription>{t("skipBody")}</AlertDescription>
        </Alert>
      </div>
    </details>
  );
}

export function AdminSeoTabHint({ messageKey }: { messageKey: string }) {
  const t = useTranslations("admin.seo.guide");
  return (
    <p className="mb-3 rounded-md border border-border/50 bg-muted/25 px-3 py-2 text-xs text-muted-foreground">
      {t(messageKey)}
    </p>
  );
}
