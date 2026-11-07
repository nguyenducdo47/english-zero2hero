"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { formatApiError } from "@/lib/api-error";
import { parseJsonObject, parseJsonValue } from "@/lib/admin-translations";
import { toast } from "@/lib/toast";
import { AdminConfirmModal } from "@/components/admin/admin-confirm-modal";
import { AdminModal } from "@/components/admin/admin-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SlugInput } from "@/components/ui/slug-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SectionRow = {
  skill: string;
  title: string;
  sort_order?: number;
  time_limit_minutes?: number | null;
};

type Row = {
  id: number;
  slug: string;
  title: string;
  exam_type: "toeic" | "ielts";
  skill_mode: "two" | "four";
  duration_minutes: number;
  is_published: boolean;
  questions_count?: number;
  target_score_min?: number | null;
  target_score_max?: number | null;
  target_band_min?: number | null;
  target_band_max?: number | null;
  metadata?: Record<string, unknown> | null;
  sections?: SectionRow[];
};

export function AdminExamsPanel({ token }: { token: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("admin");
  const tToast = useTranslations("toast");

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [examType, setExamType] = useState<"toeic" | "ielts">("toeic");
  const [skillMode, setSkillMode] = useState<"two" | "four">("two");
  const [duration, setDuration] = useState("60");
  const [published, setPublished] = useState(false);
  const [scoreMin, setScoreMin] = useState("");
  const [scoreMax, setScoreMax] = useState("");
  const [bandMin, setBandMin] = useState("");
  const [bandMax, setBandMax] = useState("");
  const [metadataJson, setMetadataJson] = useState("{}");
  const [sectionsJson, setSectionsJson] = useState("[]");
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ data: Row[] }>("/api/v1/admin/exams", locale, token);
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

  const resetForm = () => {
    setSlug("");
    setTitle("");
    setExamType("toeic");
    setSkillMode("two");
    setDuration("60");
    setPublished(false);
    setScoreMin("");
    setScoreMax("");
    setBandMin("");
    setBandMax("");
    setMetadataJson("{}");
    setSectionsJson("[]");
  };

  const openCreate = () => {
    setEditingId(null);
    resetForm();
    setEditorOpen(true);
  };

  const openEdit = async (row: Row) => {
    setEditingId(row.id);
    setSlug(row.slug);
    setTitle(row.title);
    setExamType(row.exam_type);
    setSkillMode(row.skill_mode);
    setDuration(String(row.duration_minutes));
    setPublished(row.is_published);
    setEditorOpen(true);
    try {
      const res = await apiGet<{ data: Row }>(`/api/v1/admin/exams/${row.id}`, locale, token);
      const detail = res.data;
      setScoreMin(detail.target_score_min != null ? String(detail.target_score_min) : "");
      setScoreMax(detail.target_score_max != null ? String(detail.target_score_max) : "");
      setBandMin(detail.target_band_min != null ? String(detail.target_band_min) : "");
      setBandMax(detail.target_band_max != null ? String(detail.target_band_max) : "");
      setMetadataJson(JSON.stringify(detail.metadata ?? {}, null, 2));
      setSectionsJson(JSON.stringify(detail.sections ?? [], null, 2));
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
    }
  };

  const buildBody = () => ({
    slug: slug.trim().toLowerCase(),
    title: title.trim(),
    exam_type: examType,
    skill_mode: skillMode,
    duration_minutes: Number(duration) || 60,
    is_published: published,
    target_score_min: scoreMin ? Number(scoreMin) : null,
    target_score_max: scoreMax ? Number(scoreMax) : null,
    target_band_min: bandMin ? Number(bandMin) : null,
    target_band_max: bandMax ? Number(bandMax) : null,
    metadata: parseJsonObject(metadataJson, "metadata"),
    sections: parseJsonValue(sectionsJson, "sections") as SectionRow[],
  });

  const requestSave = () => {
    if (!slug.trim() || !title.trim()) {
      toast.error(tToast("errorTitle"), t("content.exams.validation"));
      return;
    }
    try {
      parseJsonObject(metadataJson, "metadata");
      parseJsonValue(sectionsJson, "sections");
    } catch (e) {
      toast.error(tToast("errorTitle"), e instanceof Error ? e.message : String(e));
      return;
    }
    setConfirmSaveOpen(true);
  };

  const persistSave = async () => {
    setSaving(true);
    try {
      const body = buildBody();
      if (editingId) {
        await apiPatch(`/api/v1/admin/exams/${editingId}`, body, locale, token);
      } else {
        await apiPost("/api/v1/admin/exams", body, locale, token);
      }
      setConfirmSaveOpen(false);
      setEditorOpen(false);
      await load();
      toast.success(tToast("successTitle"), t("content.exams.saved"));
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
      await apiDelete(`/api/v1/admin/exams/${deleteTarget.id}`, locale, token);
      setDeleteTarget(null);
      await load();
      toast.success(tToast("successTitle"), t("content.exams.deleted"));
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
          {t("content.exams.add")}
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">{t("content.exams.colTitle")}</th>
              <th className="px-3 py-2">{t("content.fieldSlug")}</th>
              <th className="px-3 py-2">{t("content.exams.colType")}</th>
              <th className="px-3 py-2">{t("content.exams.colPublished")}</th>
              <th className="px-3 py-2">{t("content.exams.colQuestions")}</th>
              <th className="px-3 py-2 text-right">{t("content.colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-b border-border/60" key={row.id}>
                <td className="px-3 py-2">{row.title}</td>
                <td className="px-3 py-2 font-mono text-xs">{row.slug}</td>
                <td className="px-3 py-2 uppercase text-xs">{row.exam_type}</td>
                <td className="px-3 py-2">{row.is_published ? t("users.yes") : "—"}</td>
                <td className="px-3 py-2">{row.questions_count ?? 0}</td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" type="button" variant="outline" onClick={() => void openEdit(row)}>
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
        description={editingId ? t("content.exams.editDesc") : t("content.exams.createDesc")}
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
        title={editingId ? t("content.exams.editTitle") : t("content.exams.createTitle")}
        wide
        onClose={() => setEditorOpen(false)}
      >
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ex_slug">{t("content.fieldSlug")}</Label>
              <SlugInput
                disabled={Boolean(editingId)}
                id="ex_slug"
                value={slug}
                onChange={setSlug}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ex_title">{t("content.exams.colTitle")}</Label>
              <Input id="ex_title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>{t("content.exams.colType")}</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={examType}
                onChange={(e) => setExamType(e.target.value as "toeic" | "ielts")}
              >
                <option value="toeic">TOEIC</option>
                <option value="ielts">IELTS</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("content.exams.fieldSkillMode")}</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={skillMode}
                onChange={(e) => setSkillMode(e.target.value as "two" | "four")}
              >
                <option value="two">{t("content.exams.skillTwo")}</option>
                <option value="four">{t("content.exams.skillFour")}</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ex_dur">{t("content.exams.fieldDuration")}</Label>
              <Input id="ex_dur" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input checked={published} type="checkbox" onChange={(e) => setPublished(e.target.checked)} />
            {t("content.exams.fieldPublished")}
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("content.exams.fieldScoreRange")}</Label>
              <div className="flex gap-2">
                <Input placeholder="min" value={scoreMin} onChange={(e) => setScoreMin(e.target.value)} />
                <Input placeholder="max" value={scoreMax} onChange={(e) => setScoreMax(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t("content.exams.fieldBandRange")}</Label>
              <div className="flex gap-2">
                <Input placeholder="min" value={bandMin} onChange={(e) => setBandMin(e.target.value)} />
                <Input placeholder="max" value={bandMax} onChange={(e) => setBandMax(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ex_meta">{t("content.exams.fieldMetadata")}</Label>
            <Textarea className="font-mono text-xs" id="ex_meta" rows={3} value={metadataJson} onChange={(e) => setMetadataJson(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ex_sections">{t("content.exams.fieldSections")}</Label>
            <Textarea className="font-mono text-xs" id="ex_sections" rows={5} value={sectionsJson} onChange={(e) => setSectionsJson(e.target.value)} />
          </div>
        </div>
      </AdminModal>

      <AdminConfirmModal
        confirmLabel={t("modal.confirmSave")}
        description={t("content.exams.confirmSaveDesc")}
        loading={saving}
        open={confirmSaveOpen}
        title={t("content.exams.confirmSaveTitle")}
        onCancel={() => setConfirmSaveOpen(false)}
        onConfirm={persistSave}
      />

      <AdminConfirmModal
        confirmLabel={t("modal.confirmDelete")}
        description={t("content.exams.confirmDeleteDesc", { title: deleteTarget?.title ?? "" })}
        destructive
        loading={saving}
        open={Boolean(deleteTarget)}
        title={t("content.exams.confirmDeleteTitle")}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
