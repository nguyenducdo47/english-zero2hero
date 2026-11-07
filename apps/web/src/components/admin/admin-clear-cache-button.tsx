"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { useAuthToken } from "@/hooks/use-auth-token";
import { purgeAllPortalCache } from "@/lib/runtime-cache";
import { formatApiError } from "@/lib/api-error";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function AdminClearCacheButton() {
  const t = useTranslations("admin");
  const tToast = useTranslations("toast");
  const locale = useLocale() as Locale;
  const token = useAuthToken();
  const [clearing, setClearing] = useState(false);

  const onClear = async () => {
    if (!token) {
      toast.error(tToast("errorTitle"), t("loginRequired"));
      return;
    }
    setClearing(true);
    try {
      const res = await purgeAllPortalCache(locale, token);
      const grammar = res.data.grammar;
      if (grammar.synced) {
        toast.success(
          tToast("successTitle"),
          t("clearAllCacheOk", { groups: grammar.groups, tenses: grammar.tenses }),
        );
      } else {
        toast.success(tToast("successTitle"), t("clearAllCacheOkPartial"));
      }
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
    } finally {
      setClearing(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-1"
      disabled={clearing || !token}
      title={t("clearAllCacheHint")}
      onClick={() => void onClear()}
    >
      <RefreshCw className={`size-4 ${clearing ? "animate-spin" : ""}`} aria-hidden />
      <span className="hidden md:inline">{t("clearAllCache")}</span>
    </Button>
  );
}
