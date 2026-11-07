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
  parseJsonValue,
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
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Textarea } from "@/components/ui/textarea";

type GroupOpt = { id: number; slug: string; label?: string };
type Row = {
  id: number;
  tense_group_id: number;
  group_slug?: string;
  slug: string;
  sort_order: number;
  structure: string;
  signals: unknown;
  examples: unknown;
  label?: string;
  translations: Record<string, Record<string, unknown>>;
};

const TR_TYPE: TranslationEntityType = "tense";
const emptyTenseForm = () => ({ name: "", usage: "", pitfalls: "" });

export function AdminTensesPanel({ token }: { token: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("admin");
  const tToast = useTranslations("toast");

  const [groups, setGroups] = useState<GroupOpt[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [filterGroupId, setFilterGroupId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [groupId, setGroupId] = useState("");
  const [slug, setSlug] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [structure, setStructure] = useState("");
  const [signalsJson, setSignalsJson] = useState("[]");
  const [examplesJson, setExamplesJson] = useState("[]");
  const [viForm, setViForm] = useState(emptyTenseForm);
  const [enForm, setEnForm] = useState(emptyTenseForm);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);

  const loadGroups = useCallback(async () => {
    const res = await apiGet<{ data: GroupOpt[] }>("/api/v1/admin/tense-groups", locale, token);
    setGroups(res.data);
  }, [locale, token]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = filterGroupId ? `?tense_group_id=${filterGroupId}` : "";
      const res = await apiGet<{ data: Row[] }>(`/api/v1/admin/tenses${qs}`, locale, token);
      setRows(res.data);
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, [filterGroupId, locale, token, tToast]);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setGroupId(filterGroupId || (groups[0] ? String(groups[0].id) : ""));
    setSlug("");
    setSortOrder("0");
    setStructure("");
    setSignalsJson("[]");
    setExamplesJson("[]");
    setViForm(emptyTenseForm());
    setEnForm(emptyTenseForm());
    setEditorOpen(true);
  };

  const openEdit = (row: Row) => {
    setEditingId(row.id);
    setGroupId(String(row.tense_group_id));
    setSlug(row.slug);
    setSortOrder(String(row.sort_order));
    setStructure(row.structure ?? "");
    setSignalsJson(JSON.stringify(row.signals ?? [], null, 2));
    setExamplesJson(JSON.stringify(row.examples ?? [], null, 2));
    setViForm(attributesToForm(row.translations?.vi, TR_TYPE));
    setEnForm(attributesToForm(row.translations?.en, TR_TYPE));
    setEditorOpen(true);
  };

  const requestSave = () => {
    if (!slug.trim() || !groupId || !structure.trim() || !viForm.name.trim()) {
      toast.error(tToast("errorTitle"), t("content.tenses.validation"));
      return;
    }
    try {
      parseJsonValue(signalsJson, "signals");
      parseJsonValue(examplesJson, "examples");
    } catch (e) {
      toast.error(tToast("errorTitle"), e instanceof Error ? e.message : String(e));
      return;
    }
    setConfirmSaveOpen(true);
  };

  const persistSave = async () => {
    setSaving(true);
    try {
      const body = {
        tense_group_id: Number(groupId),
        slug: slug.trim().toLowerCase(),
        sort_order: Number(sortOrder) || 0,
        structure,
        signals: parseJsonValue(signalsJson, "signals"),
        examples: parseJsonValue(examplesJson, "examples"),
        translations: buildViEnTranslations(viForm, enForm, TR_TYPE),
      };
      if (editingId) {
        await apiPatch(`/api/v1/admin/tenses/${editingId}`, body, locale, token);
      } else {
        await apiPost("/api/v1/admin/tenses", body, locale, token);
      }
      setConfirmSaveOpen(false);
      setEditorOpen(false);
      await load();
      toast.success(tToast("successTitle"), t("content.tenses.saved"));
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
      await apiDelete(`/api/v1/admin/tenses/${deleteTarget.id}`, locale, token);
      setDeleteTarget(null);
      await load();
      toast.success(tToast("successTitle"), t("content.tenses.deleted"));
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading && rows.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="space-y-1">
          <Label htmlFor="filter_group">{t("content.tenses.filterGroup")}</Label>
          <select
            className="flex h-10 min-w-[12rem] rounded-md border border-input bg-background px-3 text-sm"
            id="filter_group"
            value={filterGroupId}
            onChange={(e) => setFilterGroupId(e.target.value)}
          >
            <option value="">{t("content.tenses.allGroups")}</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label ?? g.slug}
              </option>
            ))}
          </select>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus className="size-4" />
          {t("content.tenses.add")}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">{t("content.tenses.colName")}</th>
              <th className="px-3 py-2">{t("content.tenses.colGroup")}</th>
              <th className="px-3 py-2">{t("content.fieldSlug")}</th>
              <th className="px-3 py-2 text-right">{t("content.colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-b border-border/60" key={row.id}>
                <td className="px-3 py-2">{row.label}</td>
                <td className="px-3 py-2 font-mono text-xs">{row.group_slug}</td>
                <td className="px-3 py-2 font-mono text-xs">{row.slug}</td>
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
        description={editingId ? t("content.tenses.editDesc") : t("content.tenses.createDesc")}
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
        title={editingId ? t("content.tenses.editTitle") : t("content.tenses.createTitle")}
        wide
        onClose={() => setEditorOpen(false)}
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="t_group">{t("content.tenses.colGroup")}</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              id="t_group"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label ?? g.slug}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="t_slug">{t("content.fieldSlug")}</Label>
              <SlugInput
                disabled={Boolean(editingId)}
                id="t_slug"
                value={slug}
                onChange={setSlug}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t_sort">{t("content.colSort")}</Label>
              <Input id="t_sort" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t_structure">{t("content.tenses.fieldStructure")}</Label>
            <Textarea id="t_structure" rows={3} value={structure} onChange={(e) => setStructure(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t_signals">{t("content.tenses.fieldSignals")}</Label>
            <Textarea className="font-mono text-xs" id="t_signals" rows={3} value={signalsJson} onChange={(e) => setSignalsJson(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t_examples">{t("content.tenses.fieldExamples")}</Label>
            <Textarea className="font-mono text-xs" id="t_examples" rows={4} value={examplesJson} onChange={(e) => setExamplesJson(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("content.translationsTab")}</Label>
            <AdminLocaleTabs
              en={
                <>
                  <div className="space-y-1.5">
                    <Label>{t("content.nameEn")}</Label>
                    <Input value={enForm.name} onChange={(e) => setEnForm({ ...enForm, name: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("content.tenses.fieldUsage")}</Label>
                    <Textarea rows={3} value={enForm.usage} onChange={(e) => setEnForm({ ...enForm, usage: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("content.tenses.fieldPitfalls")}</Label>
                    <RichTextEditor
                      minHeight={72}
                      value={enForm.pitfalls}
                      onChange={(html) => setEnForm({ ...enForm, pitfalls: html })}
                    />
                  </div>
                </>
              }
              vi={
                <>
                  <div className="space-y-1.5">
                    <Label>{t("content.nameVi")}</Label>
                    <Input value={viForm.name} onChange={(e) => setViForm({ ...viForm, name: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("content.tenses.fieldUsage")}</Label>
                    <Textarea rows={3} value={viForm.usage} onChange={(e) => setViForm({ ...viForm, usage: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("content.tenses.fieldPitfalls")}</Label>
                    <RichTextEditor
                      minHeight={72}
                      value={viForm.pitfalls}
                      onChange={(html) => setViForm({ ...viForm, pitfalls: html })}
                    />
                  </div>
                </>
              }
            />
          </div>
        </div>
      </AdminModal>

      <AdminConfirmModal
        confirmLabel={t("modal.confirmSave")}
        description={t("content.tenses.confirmSaveDesc")}
        loading={saving}
        open={confirmSaveOpen}
        title={t("content.tenses.confirmSaveTitle")}
        onCancel={() => setConfirmSaveOpen(false)}
        onConfirm={persistSave}
      />

      <AdminConfirmModal
        confirmLabel={t("modal.confirmDelete")}
        description={t("content.tenses.confirmDeleteDesc", { name: deleteTarget?.label ?? deleteTarget?.slug ?? "" })}
        destructive
        loading={saving}
        open={Boolean(deleteTarget)}
        title={t("content.tenses.confirmDeleteTitle")}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
