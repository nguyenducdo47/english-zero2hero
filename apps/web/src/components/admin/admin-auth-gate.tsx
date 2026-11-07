"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { fetchAuthMe, userHasAdminAccess, type AuthUser } from "@/lib/progress-sync";
import { useAuthToken } from "@/hooks/use-auth-token";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminAuthGate({ children }: { children: ReactNode }) {
  const t = useTranslations("admin");
  const locale = useLocale() as Locale;
  const token = useAuthToken();
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const me = await fetchAuthMe(locale, token);
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) setUser(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locale, token]);

  if (!token) {
    return (
      <Alert>
        <AlertTitle>{t("loginRequired")}</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center gap-2">
          {t("loginRequiredDesc")}
          <Link href="/login" className={cn(buttonVariants({ size: "sm" }))}>
            {t("loginLink")}
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  if (user === undefined) {
    return <p className="text-sm text-[var(--admin-text-muted)]">{t("loading")}</p>;
  }

  if (!userHasAdminAccess(user)) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{t("forbiddenTitle")}</AlertTitle>
        <AlertDescription className="space-y-2">
          {t("forbiddenDesc")}
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            {t("backPortal")}
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}
