"use client";

import { FormEvent, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { useAuthToken } from "@/hooks/use-auth-token";
import type { Locale } from "@/i18n/routing";
import { startMockSession } from "@/lib/mock-session";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, PlayCircle } from "lucide-react";

type Registration = {
  id: number;
  scheduled_at: string;
  exam?: { slug: string; title: string };
};

export function MockExamsPageClient() {
  const t = useTranslations("mock");
  const tToast = useTranslations("toast");
  const locale = useLocale() as Locale;
  const token = useAuthToken();
  const router = useRouter();
  const [examSlug, setExamSlug] = useState("toeic-mini-lr-450");
  const [scheduledAt, setScheduledAt] = useState("");
  const [practiceMinutes, setPracticeMinutes] = useState(30);
  const [registrations, setRegistrations] = useState<Registration[] | null>(null);

  useEffect(() => {
    if (!token) return;
    apiGet<{ data: Registration[] }>("/api/v1/mock-registrations", locale, token)
      .then((res) => setRegistrations(res.data ?? []))
      .catch(() => setRegistrations([]));
  }, [locale, token]);

  const promptLogin = () => {
    toast.error(t("loginFirst"), undefined, {
      action: {
        label: t("loginLink"),
        onClick: () => router.push("/login"),
      },
    });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      promptLogin();
      return;
    }
    try {
      const res = await apiPost<{ data: { id: number } }>(
        "/api/v1/mock-registrations",
        { exam_slug: examSlug, scheduled_at: scheduledAt },
        locale,
        token,
      );
      toast.success(tToast("successTitle"), t("registered", { id: res.data.id }));
    } catch (err) {
      toast.error(
        tToast("errorTitle"),
        err instanceof Error ? err.message : "Error",
      );
    }
  };

  const startTimedMock = (slug: string) => {
    if (!token) {
      promptLogin();
      return;
    }
    const minutes = Math.min(180, Math.max(5, practiceMinutes || 30));
    startMockSession(slug, minutes);
    router.push(`/mock-exams/session/${slug}`);
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/15">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="size-4 text-primary" aria-hidden />
            {t("timedTitle")}
          </CardTitle>
          <CardDescription>{t("timedDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="practice-minutes">{t("practiceDuration")}</Label>
              <Input
                id="practice-minutes"
                type="number"
                min={5}
                max={180}
                value={practiceMinutes}
                onChange={(e) => setPracticeMinutes(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">{t("durationHint")}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timed-slug">{t("examCode")}</Label>
              <Input
                id="timed-slug"
                value={examSlug}
                onChange={(e) => setExamSlug(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" className="gap-1" onClick={() => startTimedMock(examSlug)}>
              <PlayCircle className="size-4" aria-hidden />
              {t("startTimed")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => startTimedMock("toeic-mini-lr-450")}
            >
              TOEIC mini
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => startTimedMock("ielts-mini-band-5")}
            >
              IELTS mini
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("formTitle")}</CardTitle>
          <CardDescription>{t("formDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exam-slug">{t("examCode")}</Label>
              <Input
                id="exam-slug"
                value={examSlug}
                onChange={(e) => setExamSlug(e.target.value)}
                placeholder="toeic-mini-lr-450"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduled">{t("time")}</Label>
              <Input
                id="scheduled"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              {t("register")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {registrations === null && token && (
        <Skeleton className="h-24 w-full" />
      )}
      {registrations && registrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("upcomingTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {registrations.map((row) => (
                <li key={row.id} className="flex flex-wrap justify-between gap-2 border-b border-border/60 py-2 last:border-0">
                  <span>{row.exam?.title ?? row.exam?.slug ?? "—"}</span>
                  <time className="text-muted-foreground">
                    {new Date(row.scheduled_at).toLocaleString(locale)}
                  </time>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <p className="text-sm text-muted-foreground">
        <Link href="/exams" className="text-primary hover:underline">
          {t("browseExams")}
        </Link>
      </p>
    </div>
  );
}
