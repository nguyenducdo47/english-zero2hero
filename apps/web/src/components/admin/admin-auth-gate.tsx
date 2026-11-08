"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { fetchAuthMe, userHasAdminAccess, type AuthUser } from "@/lib/progress-sync";
import { useAuthToken } from "@/hooks/use-auth-token";
import { HttpStatusPageI18n } from "@/components/errors/http-status-page-i18n";

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
      <HttpStatusPageI18n
        code={401}
        primaryCta="login"
        showLogin
        showHome
      />
    );
  }

  if (user === undefined) {
    return (
      <div
        className="flex min-h-dvh items-center justify-center bg-background text-sm text-muted-foreground motion-reduce:transition-none"
        role="status"
      >
        {t("loading")}
      </div>
    );
  }

  if (!user || !userHasAdminAccess(user)) {
    return (
      <HttpStatusPageI18n
        code={403}
        primaryCta="dashboard"
        showDashboard
        showHome
      />
    );
  }

  return <>{children}</>;
}
