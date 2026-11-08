"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { formatApiError } from "@/lib/api-error";
import {
  attributesToForm,
  buildViEnTranslations,
  type TranslationEntityType,
} from "@/lib/admin-translations";
import { isRichTextEmpty } from "@/lib/rich-text";
import { toast } from "@/lib/toast";
import { AdminConfirmModal } from "@/components/admin/admin-confirm-modal";
import { AdminLocaleTabs } from "@/components/admin/admin-locale-tabs";
import { AdminModal } from "@/components/admin/admin-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { SlugInput } from "@/components/ui/slug-input";
import { Textarea } from "@/components/ui/textarea";

type Row = {
  id: number;
  channel: string;
  slug: string;
  is_published: boolean;
  published_at: string | null;
  sort_order: number;
  label?: string;
  translations: Record<string, Record<string, unknown>>;
};

const TR_TYPE: TranslationEntityType = "content_post";
const CHANNELS = ["blog", "news"] as const;

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const emptyForm = () => ({ title: "", excerpt: "", body: "" });

export function AdminContentPostsPanel({ token }: { token: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("admin");
  const tToast = useTranslations("toast");

  const [channelFilter, setChannelFilter] = useState<(typeof CHANNELS)[number]>("blog");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [channel, setChannel] = useState<(typeof CHANNELS)[number]>("blog");
  const [slug, setSlug] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [publishedAt, setPublishedAt] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [viForm, setViForm] = useState(emptyForm);
  const [enForm, setEnForm] = useState(emptyForm);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ data: Row[] }>(
        `/api/v1/admin/content-posts?channel=${channelFilter}`,
        locale,
        token,
      );
      setRows(res.data);
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, [channelFilter, locale, token, tToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setChannel(channelFilter);
    setSlug("");
    setIsPublished(false);
    setPublishedAt("");
    setSortOrder("0");
    setViForm(emptyForm());
    setEnForm(emptyForm());
    setEditorOpen(true);
  };

  const openEdit = (row: Row) => {
    setEditingId(row.id);
    setChannel(row.channel as (typeof CHANNELS)[number]);
    setSlug(row.slug);
    setIsPublished(row.is_published);
    setPublishedAt(row.published_at ? row.published_at.slice(0, 16) : "");
    setSortOrder(String(row.sort_order));
    setViForm(attributesToForm(row.translations?.vi, TR_TYPE) as typeof viForm);
    setEnForm(attributesToForm(row.translations?.en, TR_TYPE) as typeof enForm);
    setEditorOpen(true);
  };

  const requestSave = () => {
    if (!slug.trim() || !viForm.title.trim() || !enForm.title.trim()) {
      toast.error(tToast("errorTitle"), t("content.posts.validation"));
      return;
    }
    if (isRichTextEmpty(viForm.body) || isRichTextEmpty(enForm.body)) {
      toast.error(tToast("errorTitle"), t("content.posts.validationBody"));
      return;
    }
    setConfirmSaveOpen(true);
  };

  const persistSave = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        slug: slug.trim().toLowerCase(),
        is_published: isPublished,
        sort_order: Number(sortOrder) || 0,
        translations: buildViEnTranslations(viForm, enForm, TR_TYPE),
      };
      if (publishedAt.trim()) {
        body.published_at = new Date(publishedAt).toISOString();
      } else {
        body.published_at = null;
      }
      if (editingId) {
        await apiPatch(`/api/v1/admin/content-posts/${editingId}`, body, locale, token);
      } else {
        await apiPost(
          "/api/v1/admin/content-posts",
          { ...body, channel },
          locale,
          token,
        );
      }
      setConfirmSaveOpen(false);
      setEditorOpen(false);
      await load();
      toast.success(tToast("successTitle"), t("content.posts.saved"));
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await apiDelete(`/api/v1/admin/content-posts/${deleteTarget.id}`, locale, token);
      setDeleteTarget(null);
      await load();
      toast.success(tToast("successTitle"), t("content.posts.deleted"));
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t("content.posts.hint")}</p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <select
          className={selectClassName}
          style={{ maxWidth: 200 }}
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value as typeof channelFilter)}
        >
          <option value="blog">{t("content.posts.channelBlog")}</option>
          <option value="news">{t("content.posts.channelNews")}</option>
        </select>
        <Button type="button" onClick={openCreate}>
          <Plus className="size-4" />
          {t("content.posts.add")}
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">{t("content.posts.colTitle")}</th>
              <th className="px-3 py-2">{t("content.fieldSlug")}</th>
              <th className="px-3 py-2">{t("content.posts.colPublished")}</th>
              <th className="px-3 py-2">{t("content.posts.colDate")}</th>
              <th className="px-3 py-2 text-right">{t("content.colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-b border-border/60" key={row.id}>
                <td className="px-3 py-2">{row.label}</td>
                <td className="px-3 py-2 font-mono text-xs">
                  /{row.channel}/{row.slug}
                </td>
                <td className="px-3 py-2">
                  {row.is_published ? t("sitemap.yes") : t("sitemap.no")}
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {row.published_at
                    ? new Date(row.published_at).toLocaleString()
                    : "—"}
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" type="button" variant="outline" onClick={() => openEdit(row)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button size="sm" type="button" variant="outline" onClick={() => setDeleteTarget(row)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminModal
        description={editingId ? t("content.posts.editDesc") : t("content.posts.createDesc")}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>
              {t("modal.cancel")}
            </Button>
            <Button type="button" onClick={requestSave}>
              {t("content.reviewSave")}
            </Button>
          </>
        }
        open={editorOpen}
        title={editingId ? t("content.posts.editTitle") : t("content.posts.createTitle")}
        wide
        onClose={() => setEditorOpen(false)}
      >
        <div className="space-y-3">
          {!editingId ? (
            <div className="space-y-1.5">
              <Label htmlFor="cp_channel">{t("content.posts.fieldChannel")}</Label>
              <select
                className={selectClassName}
                id="cp_channel"
                value={channel}
                onChange={(e) => setChannel(e.target.value as typeof channel)}
              >
                <option value="blog">{t("content.posts.channelBlog")}</option>
                <option value="news">{t("content.posts.channelNews")}</option>
              </select>
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="cp_slug">{t("content.fieldSlug")}</Label>
            <SlugInput id="cp_slug" value={slug} onChange={setSlug} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                checked={isPublished}
                type="checkbox"
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              {t("content.posts.fieldPublished")}
            </label>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="cp_pub_at">{t("content.posts.fieldPublishedAt")}</Label>
              <Input
                id="cp_pub_at"
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
              />
            </div>
          </div>
          <AdminLocaleTabs
            en={
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>{t("content.posts.fieldTitle")}</Label>
                  <Input
                    value={enForm.title}
                    onChange={(e) => setEnForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("content.posts.fieldExcerpt")}</Label>
                  <Textarea
                    rows={2}
                    value={enForm.excerpt}
                    onChange={(e) => setEnForm((f) => ({ ...f, excerpt: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("content.posts.fieldBody")}</Label>
                  <RichTextEditor
                    value={enForm.body}
                    onChange={(body) => setEnForm((f) => ({ ...f, body }))}
                  />
                </div>
              </div>
            }
            vi={
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>{t("content.posts.fieldTitle")}</Label>
                  <Input
                    value={viForm.title}
                    onChange={(e) => setViForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("content.posts.fieldExcerpt")}</Label>
                  <Textarea
                    rows={2}
                    value={viForm.excerpt}
                    onChange={(e) => setViForm((f) => ({ ...f, excerpt: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("content.posts.fieldBody")}</Label>
                  <RichTextEditor
                    value={viForm.body}
                    onChange={(body) => setViForm((f) => ({ ...f, body }))}
                  />
                </div>
              </div>
            }
          />
        </div>
      </AdminModal>

      <AdminConfirmModal
        confirmLabel={t("modal.confirmSave")}
        description={t("content.posts.confirmSaveDesc")}
        loading={saving}
        open={confirmSaveOpen}
        title={t("content.posts.confirmSaveTitle")}
        onCancel={() => setConfirmSaveOpen(false)}
        onConfirm={persistSave}
      />

      <AdminConfirmModal
        confirmLabel={t("modal.confirmDelete")}
        description={t("content.posts.confirmDeleteDesc", {
          name: deleteTarget?.label ?? deleteTarget?.slug ?? "",
        })}
        destructive
        loading={saving}
        open={Boolean(deleteTarget)}
        title={t("content.posts.confirmDeleteTitle")}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
