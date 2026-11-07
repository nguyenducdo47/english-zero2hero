"use client";

import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type IntegrationHealth = {
  ok: boolean;
  status: string;
  message: string;
  checks?: { id: string; ok: boolean; label: string; detail?: string }[];
};

type Props = {
  health: IntegrationHealth | null;
  loading: boolean;
  onRefresh: () => void;
};

export function AdminIntegrationHealth({ health, loading, onRefresh }: Props) {
  const t = useTranslations("admin.integrations");

  const badgeLabel = !health
    ? t("healthUnknown")
    : health.status === "ok" || health.ok
      ? t("healthOk")
      : health.status === "warning"
        ? t("healthWarning")
        : t("healthError");

  const badgeClass = !health
    ? "bg-muted text-muted-foreground"
    : health.status === "ok" || health.ok
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
      : health.status === "warning"
        ? "bg-amber-500/15 text-amber-800 dark:text-amber-300"
        : "bg-destructive/15 text-destructive";

  return (
    <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{t("healthLabel")}</span>
          <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", badgeClass)}>
            {loading ? t("healthChecking") : badgeLabel}
          </span>
        </div>
        <Button disabled={loading} size="sm" type="button" variant="outline" onClick={onRefresh}>
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          {t("checkHealth")}
        </Button>
      </div>
      {health?.message ? <p className="text-xs text-muted-foreground">{health.message}</p> : null}
      {health?.checks?.length ? (
        <ul className="space-y-1 text-xs">
          {health.checks.map((c) => (
            <li className="flex flex-wrap gap-x-2" key={c.id}>
              <span className={c.ok ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}>
                {c.ok ? "✓" : "✗"}
              </span>
              <span>{c.label}</span>
              {c.detail ? <span className="text-muted-foreground">— {c.detail}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
