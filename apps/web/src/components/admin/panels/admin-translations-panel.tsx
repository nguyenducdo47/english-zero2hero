"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { apiGet, apiPut } from "@/lib/api";
import { formatApiError } from "@/lib/api-error";
import {
  attributesToForm,
  formToAttributes,
  TRANSLATION_SCHEMA,
  translationLookupParams,
  questionIdParam,
  type TranslationEntityType,
} from "@/lib/admin-translations";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { localeTabLabel } from "@/components/admin/admin-locale-tabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Textarea } from "@/components/ui/textarea";

type CatalogItem = { slug?: string; id?: number; label: string };

type AdminLocaleRow = { code: string; is_active: boolean };

export function AdminTranslationsPanel({ token }: { token: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("admin");
  const tLocale = useTranslations("locale");
  const tToast = useTranslations("toast");

  const [entityType, setEntityType] = useState<TranslationEntityType>("tense");
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [localeCodes, setLocaleCodes] = useState<string[]>([]);
  const [activeLocale, setActiveLocale] = useState("vi");
  const [forms, setForms] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiGet<{ data: AdminLocaleRow[] }>(
          "/api/v1/admin/locales",
          locale,
          token,
        );
        if (cancelled) return;
        const codes = res.data.filter((r) => r.is_active).map((r) => r.code);
        setLocaleCodes(codes);
        if (codes.length && !codes.includes(activeLocale)) setActiveLocale(codes[0]);
      } catch (e) {
        if (!cancelled) toast.error(tToast("errorTitle"), formatApiError(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeLocale, locale, token, tToast]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setSelectedSlug("");
      setSelectedId("");
      setForms({});
      try {
        let path = "/api/v1/admin/catalog/tenses";
        if (entityType === "tense_group") path = "/api/v1/admin/catalog/tense-groups";
        if (entityType === "question") path = "/api/v1/admin/catalog/questions";

        const res = await apiGet<{ data: CatalogItem[] }>(path, locale, token);
        if (!cancelled) setCatalog(res.data);
      } catch (e) {
        if (!cancelled) toast.error(tToast("errorTitle"), formatApiError(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [entityType, locale, token, tToast]);

  const loadTranslations = useCallback(async () => {
    const hasEntity =
      entityType === "question"
        ? questionIdParam(selectedId) !== null
        : selectedSlug !== "";
    if (!hasEntity) return;

    setLoading(true);
    try {
      const params = translationLookupParams(entityType, selectedSlug, selectedId);
      if (!params) return;

      const res = await apiGet<{
        data: { translations: Record<string, Record<string, unknown>> };
      }>(`/api/v1/admin/translations?${params}`, locale, token);

      const next: Record<string, Record<string, string>> = {};
      for (const loc of localeCodes) {
        next[loc] = attributesToForm(res.data.translations[loc], entityType);
      }
      setForms(next);
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, [entityType, locale, localeCodes, selectedId, selectedSlug, token, tToast]);

  useEffect(() => {
    const hasEntity =
      entityType === "question"
        ? questionIdParam(selectedId) !== null
        : selectedSlug !== "";
    if (!hasEntity) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params = translationLookupParams(entityType, selectedSlug, selectedId);
        if (!params) return;

        const res = await apiGet<{
          data: { translations: Record<string, Record<string, unknown>> };
        }>(`/api/v1/admin/translations?${params}`, locale, token);

        if (cancelled) return;
        const next: Record<string, Record<string, string>> = {};
        for (const loc of localeCodes) {
          next[loc] = attributesToForm(res.data.translations[loc], entityType);
        }
        setForms(next);
      } catch (e) {
        if (!cancelled) toast.error(tToast("errorTitle"), formatApiError(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    entityType,
    locale,
    localeCodes,
    selectedId,
    selectedSlug,
    token,
    tToast,
  ]);

  const onSaveLocale = async (e: FormEvent) => {
    e.preventDefault();
    if (!forms[activeLocale]) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        type: entityType,
        locale: activeLocale,
        attributes: formToAttributes(forms[activeLocale], entityType),
      };
      if (entityType === "question") {
        const qid = questionIdParam(selectedId);
        if (qid === null) return;
        body.id = qid;
      } else {
        body.slug = selectedSlug;
      }

      await apiPut("/api/v1/admin/translations", body, locale, token);
      toast.success(tToast("successTitle"), t("translationSaved"));
      await loadTranslations();
    } catch (err) {
      toast.error(tToast("errorTitle"), formatApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const entitySelected =
    entityType === "question"
      ? questionIdParam(selectedId) !== null
      : selectedSlug !== "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("translationsTitle")}</CardTitle>
        <CardDescription>{t("translationsDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tr-type">{t("translationType")}</Label>
            <select
              id="tr-type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={entityType}
              onChange={(ev) => setEntityType(ev.target.value as TranslationEntityType)}
            >
              <option value="tense_group">{t("typeTenseGroup")}</option>
              <option value="tense">{t("typeTense")}</option>
              <option value="question">{t("typeQuestion")}</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tr-entity">{t("translationEntity")}</Label>
            <select
              id="tr-entity"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={entityType === "question" ? selectedId : selectedSlug}
              onChange={(ev) => {
                if (entityType === "question") setSelectedId(ev.target.value);
                else setSelectedSlug(ev.target.value);
              }}
            >
              <option value="">{t("translationPick")}</option>
              {catalog.map((item) => {
                const value =
                  entityType === "question"
                    ? item.id != null
                      ? String(item.id)
                      : ""
                    : (item.slug ?? "");
                if (!value) return null;
                return (
                  <option key={`${entityType}-${value}`} value={value}>
                    {item.label}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {loading && <p className="text-sm text-muted-foreground">{t("loading")}</p>}

        {entitySelected && localeCodes.length > 0 ? (
          <Tabs value={activeLocale} onValueChange={setActiveLocale}>
            <TabsList className="h-auto w-full flex-wrap justify-start gap-1">
              {localeCodes.map((code) => (
                <TabsTrigger key={code} value={code}>
                  {localeTabLabel(code, (key) => tLocale(key))}
                </TabsTrigger>
              ))}
            </TabsList>
            {localeCodes.map((code) => (
              <TabsContent key={code} value={code} className="mt-4 space-y-3">
                <form onSubmit={onSaveLocale} className="space-y-3">
                  {TRANSLATION_SCHEMA[entityType].map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={`${code}-${field.key}`}>
                        {t(`field.translation.${field.key}`)}
                      </Label>
                      {field.multiline ? (
                        field.linesAsArray ? (
                          <Textarea
                            id={`${code}-${field.key}`}
                            rows={5}
                            value={forms[code]?.[field.key] ?? ""}
                            onChange={(ev) =>
                              setForms((prev) => ({
                                ...prev,
                                [code]: {
                                  ...(prev[code] ?? {}),
                                  [field.key]: ev.target.value,
                                },
                              }))
                            }
                          />
                        ) : (
                          <RichTextEditor
                            id={`${code}-${field.key}`}
                            minHeight={field.key === "explanation" ? 72 : 96}
                            value={forms[code]?.[field.key] ?? ""}
                            onChange={(value) =>
                              setForms((prev) => ({
                                ...prev,
                                [code]: {
                                  ...(prev[code] ?? {}),
                                  [field.key]: value,
                                },
                              }))
                            }
                          />
                        )
                      ) : (
                        <Input
                          id={`${code}-${field.key}`}
                          value={forms[code]?.[field.key] ?? ""}
                          onChange={(ev) =>
                            setForms((prev) => ({
                              ...prev,
                              [code]: {
                                ...(prev[code] ?? {}),
                                [field.key]: ev.target.value,
                              },
                            }))
                          }
                        />
                      )}
                    </div>
                  ))}
                  <Button type="submit" disabled={saving}>
                    {t("save")}
                  </Button>
                </form>
              </TabsContent>
            ))}
          </Tabs>
        ) : null}
      </CardContent>
    </Card>
  );
}
