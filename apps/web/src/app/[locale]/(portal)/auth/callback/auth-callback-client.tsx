"use client";

import { Suspense, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { setStoredToken } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Loader2 } from "lucide-react";

function CallbackInner() {
  const params = useSearchParams();
  const router = useRouter();
  const t = useTranslations("auth");
  const token = params.get("token");

  useEffect(() => {
    if (token) {
      setStoredToken(token);
      router.replace("/exams");
    }
  }, [token, router]);

  const ok = token ? true : false;

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {!token && <Loader2 className="size-4 animate-spin text-primary" aria-hidden />}
          {token && <CheckCircle2 className="size-4 text-primary" aria-hidden />}
          {t("processing")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!ok ? (
          <Alert variant="destructive">
            <AlertTitle>{t("missingToken")}</AlertTitle>
            <AlertDescription>{t("missingToken")}</AlertDescription>
          </Alert>
        ) : (
          <p className="text-sm text-muted-foreground">{t("success")}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function AuthCallbackClient() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md space-y-2" aria-busy>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-20 w-full" />
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
