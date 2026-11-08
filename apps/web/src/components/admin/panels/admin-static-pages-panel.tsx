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
  slug: string;
  page_kind: string;
  is_published: boolean;
  show_in_header: boolean;
  show_in_footer: boolean;
  sort_order: number;
  label?: string;
  translations: Record<string, Record<string, unknown>>;
};

const TR_TYPE: TranslationEntityType = "static_page";
const KINDS = ["generic", "blog", "news"] as const;

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const emptyForm = () => ({ title: "", excerpt: "", body: "" });

export function AdminStaticPagesPanel({ token }: { token: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("admin");
  const tToast = useTranslations("toast");

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [slug, setSlug] = useState("");
  const [pageKind, setPageKind] = useState<(typeof KINDS)[number]>("generic");
  const [isPublished, setIsPublished] = useState(false);
  const [showInHeader, setShowInHeader] = useState(true);
  const [showInFooter, setShowInFooter] = useState(true);
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
        "/api/v1/admin/static-pages",
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

  const openCreate = () => {
    setEditingId(null);
    setSlug("");
    setPageKind("generic");
    setIsPublished(false);
    setShowInHeader(true);
    setShowInFooter(true);
    setSortOrder("0");
    setViForm(emptyForm());
    setEnForm(emptyForm());
    setEditorOpen(true);
  };

  const openEdit = (row: Row) => {
    setEditingId(row.id);
    setSlug(row.slug);
    setPageKind((row.page_kind as (typeof KINDS)[number]) || "generic");
    setIsPublished(row.is_published);
    setShowInHeader(row.show_in_header ?? true);
    setShowInFooter(row.show_in_footer ?? true);
    setSortOrder(String(row.sort_order));
    setViForm(attributesToForm(row.translations?.vi, TR_TYPE) as typeof viForm);
    setEnForm(attributesToForm(row.translations?.en, TR_TYPE) as typeof enForm);
    setEditorOpen(true);
  };

  const requestSave = () => {
    if (!slug.trim() || !viForm.title.trim() || !enForm.title.trim()) {
      toast.error(tToast("errorTitle"), t("content.staticPages.validation"));
      return;
    }
    if (isRichTextEmpty(viForm.body) || isRichTextEmpty(enForm.body)) {
      toast.error(tToast("errorTitle"), t("content.staticPages.validationBody"));
      return;
    }
    setConfirmSaveOpen(true);
  };

  const persistSave = async () => {
    setSaving(true);
    try {
      const body = {
        slug: slug.trim().toLowerCase(),
        page_kind: pageKind,
        is_published: isPublished,
        show_in_header: showInHeader,
        show_in_footer: showInFooter,
        sort_order: Number(sortOrder) || 0,
        translations: buildViEnTranslations(viForm, enForm, TR_TYPE),
      };
      if (editingId) {
        await apiPatch(`/api/v1/admin/static-pages/${editingId}`, body, locale, token);
      } else {
        await apiPost("/api/v1/admin/static-pages", body, locale, token);
      }
      setConfirmSaveOpen(false);
      setEditorOpen(false);
      await load();
      toast.success(tToast("successTitle"), t("content.staticPages.saved"));
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
      await apiDelete(`/api/v1/admin/static-pages/${deleteTarget.id}`, locale, token);
      setDeleteTarget(null);
      await load();
      toast.success(tToast("successTitle"), t("content.staticPages.deleted"));
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
      <p className="text-sm text-muted-foreground">{t("content.staticPages.hint")}</p>
      <div className="flex justify-end">
        <Button type="button" onClick={openCreate}>
          <Plus className="size-4" />
          {t("content.staticPages.add")}
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">{t("content.staticPages.colTitle")}</th>
              <th className="px-3 py-2">{t("content.fieldSlug")}</th>
              <th className="px-3 py-2">{t("content.staticPages.colKind")}</th>
              <th className="px-3 py-2">{t("content.staticPages.colPublished")}</th>
              <th className="px-3 py-2">{t("content.staticPages.colHeader")}</th>
              <th className="px-3 py-2">{t("content.staticPages.colFooter")}</th>
              <th className="px-3 py-2">{t("content.colSort")}</th>
              <th className="px-3 py-2 text-right">{t("content.colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-b border-border/60" key={row.id}>
                <td className="px-3 py-2">{row.label}</td>
                <td className="px-3 py-2 font-mono text-xs">/{row.slug}</td>
                <td className="px-3 py-2">{row.page_kind}</td>
                <td className="px-3 py-2">{row.is_published ? t("sitemap.yes") : t("sitemap.no")}</td>
                <td className="px-3 py-2">
                  {row.show_in_header ? t("sitemap.yes") : t("sitemap.no")}
                </td>
                <td className="px-3 py-2">{row.show_in_footer ? t("sitemap.yes") : t("sitemap.no")}</td>
                <td className="px-3 py-2">{row.sort_order}</td>
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
        description={
          editingId
            ? t("content.staticPages.editDesc")
            : t("content.staticPages.createDesc", {
                slugParam: slug.trim() || "…",
              })
        }
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
        title={editingId ? t("content.staticPages.editTitle") : t("content.staticPages.createTitle")}
        wide
        onClose={() => setEditorOpen(false)}
      >
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="sp_slug">{t("content.fieldSlug")}</Label>
              <SlugInput
                disabled={Boolean(editingId)}
                id="sp_slug"
                value={slug}
                onChange={setSlug}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sp_kind">{t("content.staticPages.fieldKind")}</Label>
              <select
                className={selectClassName}
                id="sp_kind"
                value={pageKind}
                onChange={(e) => setPageKind(e.target.value as (typeof KINDS)[number])}
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {t(`content.staticPages.kind.${k}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="sp_sort">{t("content.colSort")}</Label>
              <Input
                id="sp_sort"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 pt-6 text-sm">
              <input
                checked={isPublished}
                type="checkbox"
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              {t("content.staticPages.fieldPublished")}
            </label>
            <label className="flex items-center gap-2 pt-6 text-sm">
              <input
                checked={showInHeader}
                type="checkbox"
                onChange={(e) => setShowInHeader(e.target.checked)}
              />
              {t("content.staticPages.fieldHeader")}
            </label>
            <label className="flex items-center gap-2 pt-6 text-sm">
              <input
                checked={showInFooter}
                type="checkbox"
                onChange={(e) => setShowInFooter(e.target.checked)}
              />
              {t("content.staticPages.fieldFooter")}
            </label>
          </div>
          <div className="space-y-2">
            <Label>{t("content.translationsTab")}</Label>
            <AdminLocaleTabs
              en={
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>{t("content.staticPages.fieldTitle")}</Label>
                    <Input
                      value={enForm.title}
                      onChange={(e) => setEnForm((f) => ({ ...f, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("content.staticPages.fieldExcerpt")}</Label>
                    <Textarea
                      rows={2}
                      value={enForm.excerpt}
                      onChange={(e) => setEnForm((f) => ({ ...f, excerpt: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("content.staticPages.fieldBody")}</Label>
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
                    <Label>{t("content.staticPages.fieldTitle")}</Label>
                    <Input
                      value={viForm.title}
                      onChange={(e) => setViForm((f) => ({ ...f, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("content.staticPages.fieldExcerpt")}</Label>
                    <Textarea
                      rows={2}
                      value={viForm.excerpt}
                      onChange={(e) => setViForm((f) => ({ ...f, excerpt: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("content.staticPages.fieldBody")}</Label>
                    <RichTextEditor
                      value={viForm.body}
                      onChange={(body) => setViForm((f) => ({ ...f, body }))}
                    />
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </AdminModal>

      <AdminConfirmModal
        confirmLabel={t("modal.confirmSave")}
        description={t("content.staticPages.confirmSaveDesc")}
        loading={saving}
        open={confirmSaveOpen}
        title={t("content.staticPages.confirmSaveTitle")}
        onCancel={() => setConfirmSaveOpen(false)}
        onConfirm={persistSave}
      />

      <AdminConfirmModal
        confirmLabel={t("modal.confirmDelete")}
        description={t("content.staticPages.confirmDeleteDesc", {
          name: deleteTarget?.label ?? deleteTarget?.slug ?? "",
        })}
        destructive
        loading={saving}
        open={Boolean(deleteTarget)}
        title={t("content.staticPages.confirmDeleteTitle")}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
