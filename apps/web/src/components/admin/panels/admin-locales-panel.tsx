"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import { formatApiError } from "@/lib/api-error";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AdminLocaleRow = {
  code: string;
  name: string;
  native_name: string;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
};

export function AdminLocalesPanel({ token }: { token: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("admin");
  const tToast = useTranslations("toast");
  const [rows, setRows] = useState<AdminLocaleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newNative, setNewNative] = useState("");
  const [newSort, setNewSort] = useState("10");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ data: AdminLocaleRow[] }>(
        "/api/v1/admin/locales",
        locale,
        token,
      );
      setRows(res.data);
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, [locale, token, tToast]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await apiGet<{ data: AdminLocaleRow[] }>(
          "/api/v1/admin/locales",
          locale,
          token,
        );
        if (!cancelled) setRows(res.data);
      } catch (e) {
        if (!cancelled) toast.error(tToast("errorTitle"), formatApiError(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locale, token, tToast]);

  const patchLocale = async (code: string, body: Record<string, unknown>) => {
    setSaving(code);
    try {
      await apiPatch(`/api/v1/admin/locales/${code}`, body, locale, token);
      await load();
      toast.success(tToast("successTitle"), t("localeSaved"));
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
    } finally {
      setSaving(null);
    }
  };

  const onAdd = async (e: FormEvent) => {
    e.preventDefault();
    setSaving("__new");
    try {
      await apiPost(
        "/api/v1/admin/locales",
        {
          code: newCode,
          name: newName,
          native_name: newNative,
          is_active: true,
          sort_order: Number(newSort) || 0,
        },
        locale,
        token,
      );
      setNewCode("");
      setNewName("");
      setNewNative("");
      await load();
      toast.success(tToast("successTitle"), t("localeAdded"));
    } catch (err) {
      toast.error(tToast("errorTitle"), formatApiError(err));
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("localesTitle")}</CardTitle>
          <CardDescription>{t("localesDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground">{t("loading")}</p>
          ) : (
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-2">{t("localeCode")}</th>
                  <th className="py-2 pr-2">{t("localeName")}</th>
                  <th className="py-2 pr-2">{t("localeNative")}</th>
                  <th className="py-2 pr-2">{t("localeActive")}</th>
                  <th className="py-2">{t("localeDefault")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.code} className="border-b border-border/60">
                    <td className="py-2 pr-2 font-mono">{row.code}</td>
                    <td className="py-2 pr-2">{row.name}</td>
                    <td className="py-2 pr-2">{row.native_name}</td>
                    <td className="py-2 pr-2">
                      <input
                        type="checkbox"
                        checked={row.is_active}
                        disabled={saving === row.code}
                        onChange={(ev) =>
                          void patchLocale(row.code, { is_active: ev.target.checked })
                        }
                        aria-label={t("localeActive")}
                      />
                    </td>
                    <td className="py-2">
                      {row.is_default ? (
                        <span className="text-primary">{t("localeDefaultYes")}</span>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={saving === row.code}
                          onClick={() => void patchLocale(row.code, { is_default: true })}
                        >
                          {t("localeSetDefault")}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("localeAddTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onAdd} className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="loc-code">{t("localeCode")}</Label>
              <Input
                id="loc-code"
                required
                maxLength={16}
                value={newCode}
                onChange={(ev) => setNewCode(ev.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loc-sort">{t("localeSort")}</Label>
              <Input
                id="loc-sort"
                type="number"
                value={newSort}
                onChange={(ev) => setNewSort(ev.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loc-name">{t("localeName")}</Label>
              <Input
                id="loc-name"
                required
                value={newName}
                onChange={(ev) => setNewName(ev.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loc-native">{t("localeNative")}</Label>
              <Input
                id="loc-native"
                required
                value={newNative}
                onChange={(ev) => setNewNative(ev.target.value)}
              />
            </div>
            <Button type="submit" disabled={saving === "__new"} className="sm:col-span-2">
              {t("localeAddBtn")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
