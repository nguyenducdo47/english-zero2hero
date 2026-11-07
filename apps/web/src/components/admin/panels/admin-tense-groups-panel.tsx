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
import { toast } from "@/lib/toast";
import { AdminConfirmModal } from "@/components/admin/admin-confirm-modal";
import { AdminLocaleTabs } from "@/components/admin/admin-locale-tabs";
import { AdminModal } from "@/components/admin/admin-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SlugInput } from "@/components/ui/slug-input";
import { Label } from "@/components/ui/label";

type Row = {
  id: number;
  slug: string;
  sort_order: number;
  tenses_count?: number;
  label?: string;
  translations: Record<string, Record<string, unknown>>;
};

const TR_TYPE: TranslationEntityType = "tense_group";

export function AdminTenseGroupsPanel({ token }: { token: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("admin");
  const tToast = useTranslations("toast");

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [slug, setSlug] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [viForm, setViForm] = useState<Record<string, string>>({ name: "" });
  const [enForm, setEnForm] = useState<Record<string, string>>({ name: "" });
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ data: Row[] }>("/api/v1/admin/tense-groups", locale, token);
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
    setSortOrder("0");
    setViForm({ name: "" });
    setEnForm({ name: "" });
    setEditorOpen(true);
  };

  const openEdit = (row: Row) => {
    setEditingId(row.id);
    setSlug(row.slug);
    setSortOrder(String(row.sort_order));
    setViForm(attributesToForm(row.translations?.vi, TR_TYPE));
    setEnForm(attributesToForm(row.translations?.en, TR_TYPE));
    setEditorOpen(true);
  };

  const requestSave = () => {
    if (!slug.trim() || !viForm.name.trim() || !enForm.name.trim()) {
      toast.error(tToast("errorTitle"), t("content.tenseGroups.validation"));
      return;
    }
    setConfirmSaveOpen(true);
  };

  const persistSave = async () => {
    setSaving(true);
    try {
      const body = {
        slug: slug.trim().toLowerCase(),
        sort_order: Number(sortOrder) || 0,
        translations: buildViEnTranslations(viForm, enForm, TR_TYPE),
      };
      if (editingId) {
        await apiPatch(`/api/v1/admin/tense-groups/${editingId}`, body, locale, token);
      } else {
        await apiPost("/api/v1/admin/tense-groups", body, locale, token);
      }
      setConfirmSaveOpen(false);
      setEditorOpen(false);
      await load();
      toast.success(tToast("successTitle"), t("content.tenseGroups.saved"));
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
      await apiDelete(`/api/v1/admin/tense-groups/${deleteTarget.id}`, locale, token);
      setDeleteTarget(null);
      await load();
      toast.success(tToast("successTitle"), t("content.tenseGroups.deleted"));
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
      <div className="flex justify-end">
        <Button type="button" onClick={openCreate}>
          <Plus className="size-4" />
          {t("content.tenseGroups.add")}
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">{t("content.tenseGroups.colName")}</th>
              <th className="px-3 py-2">{t("content.tenseGroups.colSlug")}</th>
              <th className="px-3 py-2">{t("content.tenseGroups.colTenses")}</th>
              <th className="px-3 py-2">{t("content.colSort")}</th>
              <th className="px-3 py-2 text-right">{t("content.colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-b border-border/60" key={row.id}>
                <td className="px-3 py-2">{row.label}</td>
                <td className="px-3 py-2 font-mono text-xs">{row.slug}</td>
                <td className="px-3 py-2">{row.tenses_count ?? 0}</td>
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
        description={editingId ? t("content.tenseGroups.editDesc") : t("content.tenseGroups.createDesc")}
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
        title={editingId ? t("content.tenseGroups.editTitle") : t("content.tenseGroups.createTitle")}
        onClose={() => setEditorOpen(false)}
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="tg_slug">{t("content.fieldSlug")}</Label>
            <SlugInput
              disabled={Boolean(editingId)}
              id="tg_slug"
              value={slug}
              onChange={setSlug}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tg_sort">{t("content.colSort")}</Label>
            <Input id="tg_sort" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("content.translationsTab")}</Label>
            <AdminLocaleTabs
              en={
                <div className="space-y-1.5">
                  <Label htmlFor="tg_name_en">{t("content.nameEn")}</Label>
                  <Input
                    id="tg_name_en"
                    value={enForm.name}
                    onChange={(e) => setEnForm({ name: e.target.value })}
                  />
                </div>
              }
              vi={
                <div className="space-y-1.5">
                  <Label htmlFor="tg_name_vi">{t("content.nameVi")}</Label>
                  <Input
                    id="tg_name_vi"
                    value={viForm.name}
                    onChange={(e) => setViForm({ name: e.target.value })}
                  />
                </div>
              }
            />
          </div>
        </div>
      </AdminModal>

      <AdminConfirmModal
        confirmLabel={t("modal.confirmSave")}
        description={t("content.tenseGroups.confirmSaveDesc")}
        loading={saving}
        open={confirmSaveOpen}
        title={t("content.tenseGroups.confirmSaveTitle")}
        onCancel={() => setConfirmSaveOpen(false)}
        onConfirm={persistSave}
      />

      <AdminConfirmModal
        confirmLabel={t("modal.confirmDelete")}
        description={t("content.tenseGroups.confirmDeleteDesc", { name: deleteTarget?.label ?? deleteTarget?.slug ?? "" })}
        destructive
        loading={saving}
        open={Boolean(deleteTarget)}
        title={t("content.tenseGroups.confirmDeleteTitle")}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
