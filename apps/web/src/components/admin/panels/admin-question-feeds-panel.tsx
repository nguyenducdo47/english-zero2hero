"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, Play, Plus, Trash2 } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { formatApiError } from "@/lib/api-error";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminConfirmModal } from "@/components/admin/admin-confirm-modal";

type FeedRow = {
  id: number;
  name: string;
  feed_url: string;
  adapter: string;
  is_enabled: boolean;
  default_tense_group_slug: string | null;
  license: string | null;
  last_fetched_at: string | null;
  last_result: { imported?: number; skipped?: number } | null;
};

type GroupOpt = { id: number; slug: string; label?: string };

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type Props = {
  token: string;
  groups: GroupOpt[];
  adapterKeys: string[];
  onCrawlAll?: () => void;
};

const emptyForm = () => ({
  name: "",
  feed_url: "",
  adapter: "json_feed",
  default_tense_group_slug: "",
  license: "",
  is_enabled: true,
});

export function AdminQuestionFeedsPanel({ token, groups, adapterKeys, onCrawlAll }: Props) {
  const locale = useLocale() as Locale;
  const t = useTranslations("admin");
  const tToast = useTranslations("toast");

  const [rows, setRows] = useState<FeedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [crawlingId, setCrawlingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeedRow | null>(null);

  const adapters = adapterKeys.length ? adapterKeys : ["json_feed", "html_json_ld"];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ data: FeedRow[] }>(
        "/api/v1/admin/grammar/question-feeds",
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
    void load();
  }, [load]);

  const saveFeed = async () => {
    if (!form.name.trim() || !form.feed_url.trim()) return;
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        feed_url: form.feed_url.trim(),
        adapter: form.adapter,
        is_enabled: form.is_enabled,
        license: form.license.trim() || null,
        default_tense_group_slug: form.default_tense_group_slug || null,
      };
      await apiPost("/api/v1/admin/grammar/question-feeds", body, locale, token);
      setShowForm(false);
      setForm(emptyForm());
      await load();
      toast.success(tToast("successTitle"), t("content.questions.feeds.saved"));
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (row: FeedRow) => {
    try {
      await apiPatch(
        `/api/v1/admin/grammar/question-feeds/${row.id}`,
        { is_enabled: !row.is_enabled },
        locale,
        token,
      );
      await load();
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
    }
  };

  const crawlFeed = async (id: number) => {
    setCrawlingId(id);
    try {
      const res = await apiPost<{
        data: { summary: { imported: number; skipped: number } };
      }>(`/api/v1/admin/grammar/question-feeds/${id}/crawl`, {}, locale, token);
      toast.success(
        tToast("successTitle"),
        t("content.questions.crawlOk", {
          imported: res.data.summary.imported,
          skipped: res.data.summary.skipped,
        }),
      );
      await load();
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
    } finally {
      setCrawlingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(`/api/v1/admin/grammar/question-feeds/${deleteTarget.id}`, locale, token);
      setDeleteTarget(null);
      await load();
      toast.success(tToast("successTitle"), t("content.questions.feeds.deleted"));
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium">{t("content.questions.feeds.title")}</p>
          <p className="text-xs text-muted-foreground">{t("content.questions.feeds.desc")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onCrawlAll ? (
            <Button type="button" variant="secondary" size="sm" onClick={() => onCrawlAll()}>
              {t("content.questions.crawlBank")}
            </Button>
          ) : null}
          <Button type="button" size="sm" onClick={() => setShowForm((v) => !v)}>
            <Plus className="size-4" />
            {t("content.questions.feeds.add")}
          </Button>
        </div>
      </div>

      {showForm ? (
        <div className="grid gap-3 rounded-md border border-dashed border-border p-3 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <Label>{t("content.questions.feeds.fieldName")}</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>{t("content.questions.feeds.fieldUrl")}</Label>
            <Input
              value={form.feed_url}
              onChange={(e) => setForm((f) => ({ ...f, feed_url: e.target.value }))}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1">
            <Label>{t("content.questions.feeds.fieldAdapter")}</Label>
            <select
              className={selectClassName}
              value={form.adapter}
              onChange={(e) => setForm((f) => ({ ...f, adapter: e.target.value }))}
            >
              {adapters.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>{t("content.questions.feeds.fieldDefaultGroup")}</Label>
            <select
              className={selectClassName}
              value={form.default_tense_group_slug}
              onChange={(e) =>
                setForm((f) => ({ ...f, default_tense_group_slug: e.target.value }))
              }
            >
              <option value="">{t("content.questions.feeds.noDefaultGroup")}</option>
              {groups.map((g) => (
                <option key={g.id} value={g.slug}>
                  {g.label ?? g.slug}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>{t("content.questions.feeds.fieldLicense")}</Label>
            <Input
              value={form.license}
              onChange={(e) => setForm((f) => ({ ...f, license: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="button" disabled={saving} onClick={() => void saveFeed()}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {t("save")}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              {t("content.questions.feeds.cancel")}
            </Button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("content.questions.feeds.empty")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr>
                <th className="pb-2 pr-2">{t("content.questions.feeds.colName")}</th>
                <th className="pb-2 pr-2">{t("content.questions.feeds.colAdapter")}</th>
                <th className="pb-2 pr-2">{t("content.questions.feeds.colLast")}</th>
                <th className="pb-2 text-right">{t("content.colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="py-2 pr-2 align-top">
                    <p className="font-medium">{row.name}</p>
                    <p className="max-w-md truncate text-xs text-muted-foreground">{row.feed_url}</p>
                    <label className="mt-1 flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={row.is_enabled}
                        onChange={() => void toggleEnabled(row)}
                      />
                      {t("content.questions.feeds.enabled")}
                    </label>
                  </td>
                  <td className="py-2 pr-2 align-top">{row.adapter}</td>
                  <td className="py-2 pr-2 align-top text-xs text-muted-foreground">
                    {row.last_result
                      ? t("content.questions.feeds.lastStats", {
                          imported: row.last_result.imported ?? 0,
                          skipped: row.last_result.skipped ?? 0,
                        })
                      : "—"}
                  </td>
                  <td className="py-2 text-right align-top">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        disabled={crawlingId === row.id}
                        onClick={() => void crawlFeed(row.id)}
                        title={t("content.questions.feeds.crawlOne")}
                      >
                        {crawlingId === row.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Play className="size-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteTarget(row)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminConfirmModal
        destructive
        open={Boolean(deleteTarget)}
        title={t("content.questions.feeds.confirmDeleteTitle")}
        description={
          deleteTarget
            ? t("content.questions.feeds.confirmDeleteDesc", { name: deleteTarget.name })
            : ""
        }
        confirmLabel={t("content.questions.feeds.delete")}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
