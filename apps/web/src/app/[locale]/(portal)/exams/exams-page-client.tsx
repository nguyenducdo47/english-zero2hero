"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { apiGet } from "@/lib/api";
import { toast } from "@/lib/toast";
import type { Locale } from "@/i18n/routing";
import { useAuthToken } from "@/hooks/use-auth-token";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Exam = {
  id: number;
  slug: string;
  title: string;
  exam_type: string;
  skill_mode: string;
};

type TabKey = "all" | "toeic" | "ielts";

export function ExamsPageClient() {
  const t = useTranslations("exams");
  const tToast = useTranslations("toast");
  const locale = useLocale() as Locale;
  const token = useAuthToken();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [tab, setTab] = useState<TabKey>("all");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    apiGet<{ data: Exam[] }>("/api/v1/exams", locale, token)
      .then((res) => {
        if (!cancelled) setExams(res.data);
      })
      .catch((e) => {
        if (!cancelled) {
          setLoadFailed(true);
          toast.error(tToast("errorTitle"), e.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [locale, token, tToast]);

  const filtered = useMemo(() => {
    if (tab === "all") return exams;
    return exams.filter((e) => e.exam_type === tab);
  }, [exams, tab]);

  const loading = Boolean(token) && !loaded;

  if (!token) {
    return (
      <Alert>
        <AlertTitle>{t("loginRequired")}</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center gap-2">
          {t("loginToView")}
          <Link href="/login" className={cn(buttonVariants({ size: "sm" }))}>
            {t("loginLink")}
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  if (loadFailed && loaded) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  }

  if (loading) {
    return (
      <div className="space-y-4" aria-busy>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="space-y-6">
      <TabsList>
        <TabsTrigger value="all">{t("tabAll")}</TabsTrigger>
        <TabsTrigger value="toeic">{t("tabToeic")}</TabsTrigger>
        <TabsTrigger value="ielts">{t("tabIelts")}</TabsTrigger>
      </TabsList>
      <TabsContent value={tab} className="space-y-4">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("emptyTab")}</p>
        ) : (
          filtered.map((exam) => (
            <Card key={exam.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base">{exam.title}</CardTitle>
                  <CardDescription>
                    {t("skills", { type: exam.exam_type.toUpperCase(), mode: exam.skill_mode })}
                  </CardDescription>
                </div>
                <Badge variant="outline">{exam.exam_type}</Badge>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/exams/${exam.slug}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {t("openExam")}
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>
    </Tabs>
  );
}
