"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ExamClient } from "./exam-client";
import { apiGet } from "@/lib/api";
import { toast } from "@/lib/toast";
import type { Locale } from "@/i18n/routing";
import { useAuthToken } from "@/hooks/use-auth-token";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowLeft, Lock } from "lucide-react";

export function ExamDetailLoader({ slug }: { slug: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("exams");
  const tToast = useTranslations("toast");
  const token = useAuthToken();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<
    {
      id: number;
      type: string;
      prompt_en: string;
      prompt_locale?: string | null;
      options?: string[] | null;
    }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    apiGet<{
      data: {
        title: string;
        questions: typeof questions;
      };
    }>(`/api/v1/exams/${slug}`, locale, token)
      .then((res) => {
        if (!cancelled) {
          setTitle(res.data.title);
          setQuestions(res.data.questions);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message);
          toast.error(tToast("errorTitle"), e.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, locale, token, tToast]);

  const loading = Boolean(token) && !loaded;

  return (
    <div className="space-y-6">
      <Link
        href="/exams"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "-ml-2 gap-1 text-muted-foreground",
        )}
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t("backCatalog")}
      </Link>

      {loading && (
        <div className="space-y-4" aria-busy>
          <Skeleton className="h-9 w-2/3 max-w-md" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {!token && (
        <Alert>
          <Lock className="size-4" aria-hidden />
          <AlertTitle>{t("loginRequired")}</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-2">
            {t("loginToView")}
            <Link href="/login" className={cn(buttonVariants({ size: "sm" }))}>
              {t("loginLink")}
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {token && !loading && error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {token && !loading && !error && loaded && (
        <>
          <PageHeader title={title} description={t("examDetailIntro")} />
          <ExamClient slug={slug} title={title} questions={questions} />
        </>
      )}
    </div>
  );
}
