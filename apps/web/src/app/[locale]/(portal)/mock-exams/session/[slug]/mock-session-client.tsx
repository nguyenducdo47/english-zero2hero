"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { apiGet } from "@/lib/api";
import type { Locale } from "@/i18n/routing";
import {
  ExamClient,
  type ExamClientHandle,
} from "@/app/[locale]/(portal)/exams/[slug]/exam-client";
import { ExamCountdown } from "@/components/learning/exam-countdown";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthToken } from "@/hooks/use-auth-token";
import {
  clearMockSession,
  getSessionForSlug,
  startMockSession,
} from "@/lib/mock-session";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { ArrowLeft, Lock } from "lucide-react";

type ExamPayload = {
  title: string;
  duration_minutes?: number;
  questions: {
    id: number;
    type: string;
    prompt_en?: string;
    prompt_locale?: string | null;
    options?: string[] | null;
  }[];
};

const DEFAULT_MOCK_MINUTES = 30;

export function MockSessionClient({ slug }: { slug: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("mock");
  const tExams = useTranslations("exams");
  const tToast = useTranslations("toast");
  const token = useAuthToken();
  const examRef = useRef<ExamClientHandle>(null);
  const expireHandled = useRef(false);

  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<ExamPayload["questions"]>([]);
  const [session, setSession] = useState<ReturnType<typeof getSessionForSlug>>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    apiGet<{ data: ExamPayload }>(`/api/v1/exams/${slug}`, locale, token)
      .then((res) => {
        if (cancelled) return;
        const duration = res.data.duration_minutes ?? DEFAULT_MOCK_MINUTES;
        let active = getSessionForSlug(slug);
        if (!active || new Date(active.endsAt).getTime() < Date.now()) {
          active = startMockSession(slug, duration);
        }
        setSession(active);
        setTitle(res.data.title);
        setQuestions(res.data.questions);
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
  }, [locale, slug, token, tToast]);

  const onExpire = useCallback(() => {
    if (expireHandled.current) return;
    expireHandled.current = true;
    toast.info(tToast("successTitle"), t("autoSubmit"));
    if (!examRef.current?.hasSubmitted()) {
      void examRef.current?.submit();
    }
  }, [t, tToast]);

  const onFinish = () => {
    clearMockSession();
  };

  const loading = Boolean(token) && !loaded;

  return (
    <div className="space-y-6">
      <Link
        href="/mock-exams"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "-ml-2 gap-1 text-muted-foreground",
        )}
        onClick={onFinish}
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t("backMock")}
      </Link>

      {loading && (
        <div className="space-y-4" aria-busy>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {!token && (
        <Alert>
          <Lock className="size-4" aria-hidden />
          <AlertTitle>{tExams("loginRequired")}</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-2">
            {t("loginFirst")}
            <Link href="/login" className={cn(buttonVariants({ size: "sm" }))}>
              {t("loginLink")}
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {token && !loading && !error && session && loaded && (
        <>
          <ExamCountdown
            endsAtIso={session.endsAt}
            startedAtIso={session.startedAt}
            onExpire={onExpire}
          />
          <PageHeader title={title} description={t("sessionIntro")} />
          <ExamClient
            ref={examRef}
            slug={slug}
            title={title}
            questions={questions}
          />
        </>
      )}
    </div>
  );
}
