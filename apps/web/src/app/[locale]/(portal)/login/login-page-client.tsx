"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { apiGet, apiPost, setStoredToken } from "@/lib/api";
import { formatApiError } from "@/lib/api-error";
import { DEV_LOGIN_ENABLED } from "@/lib/feature-flags";
import type { Locale } from "@/i18n/routing";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FileCheck, LogIn, Shield, UserPlus } from "lucide-react";

type AuthTokenResponse = { token: string };

export function LoginPageClient() {
  const t = useTranslations("login");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const tToast = useTranslations("toast");
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [googleLoginEnabled, setGoogleLoginEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    if (searchParams.get("oauth") === "failed") {
      toast.error(tToast("errorTitle"), t("oauthFailed"));
    }
  }, [searchParams, t, tToast]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiGet<{ data: { enabled: boolean } }>(
          "/api/v1/auth/google/status",
          locale,
        );
        if (!cancelled) setGoogleLoginEnabled(res.data.enabled);
      } catch {
        if (!cancelled) setGoogleLoginEnabled(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locale]);
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPasswordConfirm, setRegPasswordConfirm] = useState("");

  const finishWithToken = (token: string, successMessage: string) => {
    setStoredToken(token);
    toast.success(tToast("successTitle"), successMessage);
    router.push("/exams");
  };

  const loginGoogle = async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ url: string }>(
        "/api/v1/auth/google/redirect",
        locale,
      );
      window.location.href = res.url;
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
      setLoading(false);
    }
  };

  const devLogin = async () => {
    setLoading(true);
    try {
      const res = await apiGet<AuthTokenResponse>("/api/v1/auth/dev-login", locale);
      finishWithToken(res.token, t("loginOk"));
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
    } finally {
      setLoading(false);
    }
  };

  const onEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiPost<AuthTokenResponse>(
        "/api/v1/auth/login",
        { email: loginEmail, password: loginPassword },
        locale,
      );
      finishWithToken(res.token, t("loginOk"));
    } catch (err) {
      toast.error(tToast("errorTitle"), formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (regPassword !== regPasswordConfirm) {
      toast.error(tToast("errorTitle"), t("passwordMismatch"));
      return;
    }
    setLoading(true);
    try {
      const res = await apiPost<AuthTokenResponse>(
        "/api/v1/auth/register",
        {
          name: regName,
          email: regEmail,
          password: regPassword,
          password_confirmation: regPasswordConfirm,
        },
        locale,
      );
      finishWithToken(res.token, t("registerOk"));
    } catch (err) {
      toast.error(tToast("errorTitle"), formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">{t("whyTitle")}</h2>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <FileCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            {t("whyExams")}
          </li>
          <li className="flex gap-3">
            <BookOpen className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            {t("whyProgress")}
          </li>
          <li className="flex gap-3">
            <Shield className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            {t("whyGrammar")}
          </li>
        </ul>
        <p className="text-sm text-muted-foreground">
          <Link href="/grammar" className="text-primary hover:underline">
            {t("grammarFree")} →
          </Link>
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("intro")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {googleLoginEnabled ? (
            <>
              <Button
                type="button"
                className="w-full gap-2"
                size="lg"
                disabled={loading}
                onClick={loginGoogle}
              >
                <LogIn className="size-4" aria-hidden />
                {loading ? t("redirecting") : t("google")}
              </Button>

              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  {t("or")}
                </span>
              </div>
            </>
          ) : null}

          <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">{t("tabSignIn")}</TabsTrigger>
              <TabsTrigger value="signup">{t("tabSignUp")}</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-4 space-y-4">
              <form onSubmit={onEmailLogin} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{t("email")}</Label>
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={loginEmail}
                    onChange={(ev) => setLoginEmail(ev.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">{t("password")}</Label>
                  <Input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    required
                    minLength={8}
                    value={loginPassword}
                    onChange={(ev) => setLoginPassword(ev.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {t("loginSubmit")}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-4 space-y-4">
              <form onSubmit={onRegister} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">{t("name")}</Label>
                  <Input
                    id="reg-name"
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={120}
                    value={regName}
                    onChange={(ev) => setRegName(ev.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">{t("email")}</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={regEmail}
                    onChange={(ev) => setRegEmail(ev.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">{t("password")}</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={regPassword}
                    onChange={(ev) => setRegPassword(ev.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">{t("passwordHint")}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password-confirm">{t("passwordConfirm")}</Label>
                  <Input
                    id="reg-password-confirm"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={regPasswordConfirm}
                    onChange={(ev) => setRegPasswordConfirm(ev.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  <UserPlus className="size-4" aria-hidden />
                  {t("registerSubmit")}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {DEV_LOGIN_ENABLED ? (
            <>
              <p className="text-center text-xs text-muted-foreground">{t("devNote")}</p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={loading}
                onClick={devLogin}
              >
                {t("devCta")}
              </Button>
            </>
          ) : null}
        </CardContent>
        {DEV_LOGIN_ENABLED ? (
          <CardFooter className="justify-center border-t border-border/60 pt-4 text-xs text-muted-foreground">
            {t("devHint")}
          </CardFooter>
        ) : null}
      </Card>
    </div>
  );
}
