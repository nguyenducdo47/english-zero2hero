"use client";

import {
  type Dispatch,
  type FormEvent,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import { formatApiError } from "@/lib/api-error";
import { toast } from "@/lib/toast";
import {
  AdminIntegrationHealth,
  type IntegrationHealth,
} from "@/components/admin/panels/admin-integration-health";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SettingField = {
  value: string | null;
  masked?: string | null;
  secret: boolean;
  configured?: boolean;
};

type SettingsGroup = "mail" | "google" | "grammar_tool";

const MAIL_KEYS = [
  "mailer",
  "host",
  "port",
  "username",
  "password",
  "address",
  "name",
] as const;

const GOOGLE_KEYS = ["oauth_enabled", "client_id", "client_secret", "redirect"] as const;

const GRAMMAR_TOOL_KEYS = [
  "enabled",
  "guest_daily_limit",
  "user_daily_limit",
  "libretranslate_enabled",
  "libretranslate_url",
  "libretranslate_api_key",
] as const;

const GRAMMAR_TOOL_BOOL_KEYS = new Set(["enabled", "libretranslate_enabled"]);
const GRAMMAR_TOOL_SECRET_KEYS = new Set(["libretranslate_api_key"]);
const INTEGRATION_NUMBER_KEYS = new Set([
  "port",
  "guest_daily_limit",
  "user_daily_limit",
]);

function isTruthySetting(value: string | undefined): boolean {
  const v = (value ?? "").toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

const MAILER_OPTIONS = ["log", "smtp", "sendmail", "array"] as const;

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function AdminIntegrationsPanel({ token }: { token: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("admin");
  const tInt = useTranslations("admin.integrations");
  const tToast = useTranslations("toast");

  const [mailForm, setMailForm] = useState<Record<string, string>>({});
  const [googleForm, setGoogleForm] = useState<Record<string, string>>({});
  const [grammarToolForm, setGrammarToolForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<SettingsGroup | null>(null);

  const [mailHealth, setMailHealth] = useState<IntegrationHealth | null>(null);
  const [googleHealth, setGoogleHealth] = useState<IntegrationHealth | null>(null);
  const [mailHealthLoading, setMailHealthLoading] = useState(false);
  const [googleHealthLoading, setGoogleHealthLoading] = useState(false);

  const [testMailTo, setTestMailTo] = useState("");
  const [testMailSending, setTestMailSending] = useState(false);

  const loadGroup = useCallback(
    async (group: SettingsGroup) => {
      const res = await apiGet<{
        data: { fields: Record<string, SettingField> };
      }>(`/api/v1/admin/settings/${group}`, locale, token);
      const next: Record<string, string> = {};
      for (const [key, meta] of Object.entries(res.data.fields)) {
        if (meta.secret) next[key] = "";
        else if (key === "oauth_enabled" || GRAMMAR_TOOL_BOOL_KEYS.has(key)) {
          next[key] = isTruthySetting(meta.value ?? undefined) ? "1" : "0";
        } else next[key] = meta.value ?? "";
      }
      if (group === "mail") setMailForm(next);
      else if (group === "google") setGoogleForm(next);
      else setGrammarToolForm(next);
    },
    [locale, token],
  );

  const fetchMailHealth = useCallback(async () => {
    setMailHealthLoading(true);
    try {
      const res = await apiGet<{ data: IntegrationHealth }>(
        "/api/v1/admin/settings/mail/health",
        locale,
        token,
      );
      setMailHealth(res.data);
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
    } finally {
      setMailHealthLoading(false);
    }
  }, [locale, token, tToast]);

  const fetchGoogleHealth = useCallback(async () => {
    setGoogleHealthLoading(true);
    try {
      const res = await apiGet<{ data: IntegrationHealth }>(
        "/api/v1/admin/settings/google/health",
        locale,
        token,
      );
      setGoogleHealth(res.data);
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
    } finally {
      setGoogleHealthLoading(false);
    }
  }, [locale, token, tToast]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await Promise.all([loadGroup("mail"), loadGroup("google"), loadGroup("grammar_tool")]);
        if (!cancelled) {
          await Promise.all([fetchMailHealth(), fetchGoogleHealth()]);
        }
      } catch (e) {
        if (!cancelled) toast.error(tToast("errorTitle"), formatApiError(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchGoogleHealth, fetchMailHealth, loadGroup, tToast]);

  const saveGroup = async (group: SettingsGroup, keys: readonly string[], e: FormEvent) => {
    e.preventDefault();
    setSaving(group);
    const source =
      group === "mail" ? mailForm : group === "google" ? googleForm : grammarToolForm;
    const body: Record<string, string> = {};
    for (const key of keys) {
      if (key === "password" || key === "client_secret" || GRAMMAR_TOOL_SECRET_KEYS.has(key)) {
        if (source[key]) body[key] = source[key];
      } else {
        body[key] = source[key] ?? "";
      }
    }
    try {
      await apiPatch(`/api/v1/admin/settings/${group}`, body, locale, token);
      await loadGroup(group);
      if (group === "mail") await fetchMailHealth();
      else await fetchGoogleHealth();
      toast.success(tToast("successTitle"), t("settingsSaved"));
    } catch (err) {
      toast.error(tToast("errorTitle"), formatApiError(err));
    } finally {
      setSaving(null);
    }
  };

  const sendTestMail = async () => {
    if (!testMailTo.trim()) return;
    setTestMailSending(true);
    try {
      await apiPost(
        "/api/v1/admin/settings/mail/test",
        { to: testMailTo.trim() },
        locale,
        token,
      );
      toast.success(tToast("successTitle"), tInt("mailTestOk"));
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e) || tInt("mailTestFail"));
    } finally {
      setTestMailSending(false);
    }
  };

  const renderField = (
    group: SettingsGroup,
    key: string,
    form: Record<string, string>,
    setForm: Dispatch<SetStateAction<Record<string, string>>>,
    secret?: boolean,
  ) => (
    <div key={key} className="space-y-2">
      <Label htmlFor={`${group}-${key}`}>{t(`field.${group}.${key}`)}</Label>
      <Input
        id={`${group}-${key}`}
        type={secret ? "password" : INTEGRATION_NUMBER_KEYS.has(key) ? "number" : "text"}
        autoComplete="off"
        min={INTEGRATION_NUMBER_KEYS.has(key) ? 0 : undefined}
        step={INTEGRATION_NUMBER_KEYS.has(key) ? 1 : undefined}
        placeholder={secret ? t("secretPlaceholder") : undefined}
        value={form[key] ?? ""}
        onChange={(ev) => setForm((prev) => ({ ...prev, [key]: ev.target.value }))}
      />
      {secret ? <p className="text-xs text-muted-foreground">{t("secretHint")}</p> : null}
    </div>
  );

  if (loading) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("mailTitle")}</CardTitle>
          <CardDescription>{t("mailDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AdminIntegrationHealth
            health={mailHealth}
            loading={mailHealthLoading}
            onRefresh={() => void fetchMailHealth()}
          />
          <p className="text-xs text-muted-foreground">{tInt("healthUsesSavedConfig")}</p>
          <form
            onSubmit={(e) => void saveGroup("mail", MAIL_KEYS, e)}
            className="grid gap-3 sm:grid-cols-2"
          >
            {MAIL_KEYS.map((key) => {
              if (key === "mailer") {
                const value = mailForm.mailer || "log";
                return (
                  <div key="mailer" className="space-y-2 sm:col-span-2">
                    <Label htmlFor="mail-mailer">{t("field.mail.mailer")}</Label>
                    <select
                      className={selectClassName}
                      id="mail-mailer"
                      value={value}
                      onChange={(ev) =>
                        setMailForm((prev) => ({ ...prev, mailer: ev.target.value }))
                      }
                    >
                      {MAILER_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {tInt(`mailerOption.${opt}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }
              return renderField(
                "mail",
                key,
                mailForm,
                setMailForm,
                key === "password",
              );
            })}
            <Button type="submit" disabled={saving === "mail"} className="sm:col-span-2">
              {t("save")}
            </Button>
          </form>
          <div className="flex flex-wrap items-end gap-2 border-t border-border pt-4">
            <div className="min-w-[14rem] flex-1 space-y-1.5">
              <Label htmlFor="mail-test-to">{tInt("mailTestTo")}</Label>
              <Input
                id="mail-test-to"
                placeholder="you@example.com"
                type="email"
                value={testMailTo}
                onChange={(e) => setTestMailTo(e.target.value)}
              />
            </div>
            <Button
              disabled={testMailSending || !testMailTo.trim()}
              type="button"
              variant="secondary"
              onClick={() => void sendTestMail()}
            >
              {tInt("mailTestSend")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("googleTitle")}</CardTitle>
          <CardDescription>{t("googleDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AdminIntegrationHealth
            health={googleHealth}
            loading={googleHealthLoading}
            onRefresh={() => void fetchGoogleHealth()}
          />
          <p className="text-xs text-muted-foreground">{tInt("healthUsesSavedConfig")}</p>
          <form
            onSubmit={(e) => void saveGroup("google", GOOGLE_KEYS, e)}
            className="grid gap-3"
          >
            {GOOGLE_KEYS.map((key) => {
              if (key === "oauth_enabled") {
                const enabled = isTruthySetting(googleForm.oauth_enabled);
                return (
                  <div key="oauth_enabled" className="space-y-2 rounded-md border border-border p-3">
                    <div className="flex items-start gap-3">
                      <input
                        id="google-oauth_enabled"
                        type="checkbox"
                        className="mt-1 size-4 shrink-0 rounded border border-input accent-primary"
                        checked={enabled}
                        onChange={(ev) =>
                          setGoogleForm((prev) => ({
                            ...prev,
                            oauth_enabled: ev.target.checked ? "1" : "0",
                          }))
                        }
                      />
                      <div className="space-y-1">
                        <Label htmlFor="google-oauth_enabled" className="cursor-pointer font-medium">
                          {t("field.google.oauth_enabled")}
                        </Label>
                        <p className="text-xs text-muted-foreground">{tInt("googleOAuthEnabledHint")}</p>
                      </div>
                    </div>
                  </div>
                );
              }
              return renderField(
                "google",
                key,
                googleForm,
                setGoogleForm,
                key === "client_secret",
              );
            })}
            <Button type="submit" disabled={saving === "google"}>
              {t("save")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("grammarToolTitle")}</CardTitle>
          <CardDescription>{t("grammarToolDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            onSubmit={(e) => void saveGroup("grammar_tool", GRAMMAR_TOOL_KEYS, e)}
            className="grid gap-3 sm:grid-cols-2"
          >
            {GRAMMAR_TOOL_KEYS.map((key) => {
              if (GRAMMAR_TOOL_BOOL_KEYS.has(key)) {
                const enabled = isTruthySetting(grammarToolForm[key]);
                return (
                  <div
                    key={key}
                    className="space-y-2 rounded-md border border-border p-3 sm:col-span-2"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        id={`grammar_tool-${key}`}
                        type="checkbox"
                        className="mt-1 size-4 shrink-0 rounded border border-input accent-primary"
                        checked={enabled}
                        onChange={(ev) =>
                          setGrammarToolForm((prev) => ({
                            ...prev,
                            [key]: ev.target.checked ? "1" : "0",
                          }))
                        }
                      />
                      <div className="space-y-1">
                        <Label htmlFor={`grammar_tool-${key}`} className="cursor-pointer font-medium">
                          {t(`field.grammar_tool.${key}`)}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {tInt(`grammarToolHint.${key}`)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
              return renderField(
                "grammar_tool",
                key,
                grammarToolForm,
                setGrammarToolForm,
                GRAMMAR_TOOL_SECRET_KEYS.has(key),
              );
            })}
            <Button type="submit" disabled={saving === "grammar_tool"} className="sm:col-span-2">
              {t("save")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
