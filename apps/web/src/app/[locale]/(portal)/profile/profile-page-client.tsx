"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { apiPost, setStoredToken } from "@/lib/api";
import {
  fetchAuthMe,
  pullServerLearningStats,
  pushLearningStatsToServer,
  userHasAdminAccess,
  type AuthUser,
} from "@/lib/progress-sync";
import { readLearningStats, writeLearningStats } from "@/lib/learning-stats";
import { LearningStatsBar } from "@/components/learning/learning-stats-bar";
import { useAuthToken } from "@/hooks/use-auth-token";
import { useLearningStats } from "@/hooks/use-learning-stats";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { LogOut, RefreshCw, Shield } from "lucide-react";

export function ProfilePageClient() {
  const locale = useLocale() as Locale;
  const t = useTranslations("profile");
  const tToast = useTranslations("toast");
  const token = useAuthToken();
  const stats = useLearningStats();
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);
  const [syncing, setSyncing] = useState(false);

  const loadingProfile = Boolean(token) && user === undefined;

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const me = await fetchAuthMe(locale, token);
        if (cancelled) return;
        setUser(me);
        await pullServerLearningStats(locale, token).catch(() => null);
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : "Error";
          toast.error(tToast("errorTitle"), msg);
          setUser(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locale, token, tToast]);

  const onSync = async () => {
    if (!token) return;
    setSyncing(true);
    try {
      await pushLearningStatsToServer(locale, token);
      toast.success(tToast("successTitle"), t("syncOk"));
    } catch (e) {
      toast.error(
        tToast("errorTitle"),
        e instanceof Error ? e.message : "Error",
      );
    } finally {
      setSyncing(false);
    }
  };

  const onLogout = async () => {
    if (token) {
      try {
        await apiPost("/api/v1/auth/logout", {}, locale, token);
      } catch {
        /* still clear local */
      }
    }
    setStoredToken(null);
    setUser(undefined);
  };

  if (loadingProfile) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!token) {
    return (
      <Alert>
        <AlertTitle>{t("loginTitle")}</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center gap-2">
          {t("loginDesc")}
          <Link href="/login" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
            {t("loginCta")}
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("account")}</CardTitle>
          <CardDescription>{t("accountDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {user ? (
            <>
              <p>
                <span className="text-muted-foreground">{t("name")}: </span>
                {user.name}
              </p>
              <p>
                <span className="text-muted-foreground">{t("email")}: </span>
                {user.email}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">{t("userLoadFail")}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {userHasAdminAccess(user) ? (
              <Link
                href="/admin"
                className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-1")}
              >
                <Shield className="size-4" aria-hidden />
                {t("adminConsole")}
              </Link>
            ) : null}
            <Button variant="outline" size="sm" className="gap-1" onClick={onLogout}>
              <LogOut className="size-4" aria-hidden />
              {t("logout")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>{t("progressTitle")}</CardTitle>
            <CardDescription>{t("progressDesc")}</CardDescription>
          </div>
          <Button size="sm" variant="secondary" className="gap-1" disabled={syncing} onClick={onSync}>
            <RefreshCw className={cn("size-4", syncing && "animate-spin")} aria-hidden />
            {syncing ? t("syncing") : t("syncNow")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <LearningStatsBar />
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <p>
              <span className="text-muted-foreground">{t("tensesRead")}: </span>
              {stats.completedTenses.length}
            </p>
            <p>
              <span className="text-muted-foreground">{t("groupsDone")}: </span>
              {stats.completedGroups.length}
            </p>
          </div>
          <div className="max-w-xs space-y-2">
            <Label htmlFor="daily-goal">{t("dailyGoal")}</Label>
            <Input
              id="daily-goal"
              type="number"
              min={5}
              max={120}
              defaultValue={stats.dailyGoalMinutes}
              onBlur={(e) => {
                const next = readLearningStats();
                next.dailyGoalMinutes = Number(e.target.value) || 15;
                writeLearningStats(next);
                toast.success(tToast("saved"));
              }}
            />
            <p className="text-xs text-muted-foreground">{t("dailyGoalHint")}</p>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        <Link href="/analytics" className="text-primary hover:underline">
          {t("viewAnalytics")} →
        </Link>
      </p>
    </div>
  );
}
