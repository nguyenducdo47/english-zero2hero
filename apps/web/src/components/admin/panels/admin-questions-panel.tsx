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
  parseJsonObject,
  type TranslationEntityType,
} from "@/lib/admin-translations";
import { toast } from "@/lib/toast";
import { AdminConfirmModal } from "@/components/admin/admin-confirm-modal";
import { AdminLocaleTabs } from "@/components/admin/admin-locale-tabs";
import { AdminModal } from "@/components/admin/admin-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Textarea } from "@/components/ui/textarea";
import { isRichTextEmpty } from "@/lib/rich-text";
import { AdminQuestionFeedsPanel } from "@/components/admin/panels/admin-question-feeds-panel";

type GroupOpt = { id: number; slug: string; label?: string };
type ExamOpt = { id: number; slug: string; title: string };

type Row = {
  id: number;
  type: string;
  tense_group_id: number | null;
  exam_id: number | null;
  sort_order: number;
  payload: Record<string, unknown>;
  label?: string;
  translations: Record<string, Record<string, unknown>>;
};

const TR_TYPE: TranslationEntityType = "question";
const emptyQForm = () => ({ prompt: "", explanation: "" });

export function AdminQuestionsPanel({ token }: { token: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("admin");
  const tToast = useTranslations("toast");

  const [groups, setGroups] = useState<GroupOpt[]>([]);
  const [exams, setExams] = useState<ExamOpt[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [scope, setScope] = useState<"grammar" | "exam" | "all">("grammar");
  const [filterGroupId, setFilterGroupId] = useState("");
  const [filterExamId, setFilterExamId] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [qType, setQType] = useState<"multiple_choice" | "fill_blank">("multiple_choice");
  const [groupId, setGroupId] = useState("");
  const [examId, setExamId] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [payloadJson, setPayloadJson] = useState("{}");
  const [viForm, setViForm] = useState(emptyQForm);
  const [enForm, setEnForm] = useState(emptyQForm);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);
  const [bankPools, setBankPools] = useState<Array<{ slug: string; count: number }>>([]);
  const [lastCrawlAt, setLastCrawlAt] = useState<string | null>(null);
  const [adapterKeys, setAdapterKeys] = useState<string[]>([]);
  const [crawling, setCrawling] = useState(false);

  const loadBankStatus = useCallback(async () => {
    try {
      const res = await apiGet<{
        data: {
          pools: Array<{ slug: string; count: number }>;
          last_crawl: { finished_at?: string } | null;
          adapters?: string[];
        };
      }>("/api/v1/admin/grammar/question-bank/status", locale, token);
      setBankPools(res.data.pools);
      setLastCrawlAt(res.data.last_crawl?.finished_at ?? null);
      setAdapterKeys(res.data.adapters ?? []);
    } catch {
      setBankPools([]);
      setLastCrawlAt(null);
    }
  }, [locale, token]);

  const runBankCrawl = async () => {
    setCrawling(true);
    try {
      const res = await apiPost<{
        data: {
          mode: string;
          summary?: { imported: number; skipped: number };
        };
      }>("/api/v1/admin/grammar/question-bank/crawl", {}, locale, token);
      if (res.data.mode === "sync" && res.data.summary) {
        toast.success(
          tToast("successTitle"),
          t("content.questions.crawlOk", {
            imported: res.data.summary.imported,
            skipped: res.data.summary.skipped,
          }),
        );
      } else {
        toast.success(tToast("successTitle"), t("content.questions.crawlQueued"));
      }
      await Promise.all([loadBankStatus(), load()]);
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
    } finally {
      setCrawling(false);
    }
  };

  const loadMeta = useCallback(async () => {
    const [gRes, eRes] = await Promise.all([
      apiGet<{ data: GroupOpt[] }>("/api/v1/admin/tense-groups", locale, token),
      apiGet<{ data: ExamOpt[] }>("/api/v1/admin/exams", locale, token),
    ]);
    setGroups(gRes.data);
    setExams(eRes.data);
  }, [locale, token]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ per_page: "30", page: String(page) });
      if (scope !== "all") params.set("scope", scope);
      if (filterGroupId) params.set("tense_group_id", filterGroupId);
      if (filterExamId) params.set("exam_id", filterExamId);
      const res = await apiGet<{
        data: Row[];
        meta: { current_page: number; last_page: number; total: number };
      }>(`/api/v1/admin/questions?${params}`, locale, token);
      setRows(res.data);
      setMeta(res.meta);
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, [filterExamId, filterGroupId, locale, page, scope, token, tToast]);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setQType("multiple_choice");
    setGroupId(filterGroupId || (groups[0] ? String(groups[0].id) : ""));
    setExamId(scope === "exam" ? filterExamId || (exams[0] ? String(exams[0].id) : "") : "");
    setSortOrder("0");
    setPayloadJson(
      JSON.stringify(
        {
          options: ["A", "B", "C", "D"],
          correct_index: 0,
        },
        null,
        2,
      ),
    );
    setViForm(emptyQForm());
    setEnForm(emptyQForm());
    setEditorOpen(true);
  };

  const openEdit = (row: Row) => {
    setEditingId(row.id);
    setQType(row.type as "multiple_choice" | "fill_blank");
    setGroupId(row.tense_group_id ? String(row.tense_group_id) : "");
    setExamId(row.exam_id ? String(row.exam_id) : "");
    setSortOrder(String(row.sort_order));
    setPayloadJson(JSON.stringify(row.payload ?? {}, null, 2));
    setViForm(attributesToForm(row.translations?.vi, TR_TYPE));
    setEnForm(attributesToForm(row.translations?.en, TR_TYPE));
    setEditorOpen(true);
  };

  const requestSave = () => {
    if (!groupId && !examId) {
      toast.error(tToast("errorTitle"), t("content.questions.validationLink"));
      return;
    }
    try {
      parseJsonObject(payloadJson, "payload");
    } catch (e) {
      toast.error(tToast("errorTitle"), e instanceof Error ? e.message : String(e));
      return;
    }
    if (isRichTextEmpty(viForm.prompt)) {
      toast.error(tToast("errorTitle"), t("content.questions.validationPrompt"));
      return;
    }
    setConfirmSaveOpen(true);
  };

  const persistSave = async () => {
    setSaving(true);
    try {
      const body = {
        type: qType,
        tense_group_id: groupId ? Number(groupId) : null,
        exam_id: examId ? Number(examId) : null,
        sort_order: Number(sortOrder) || 0,
        payload: parseJsonObject(payloadJson, "payload"),
        translations: buildViEnTranslations(viForm, enForm, TR_TYPE),
      };
      if (editingId) {
        await apiPatch(`/api/v1/admin/questions/${editingId}`, body, locale, token);
      } else {
        await apiPost("/api/v1/admin/questions", body, locale, token);
      }
      setConfirmSaveOpen(false);
      setEditorOpen(false);
      await load();
      toast.success(tToast("successTitle"), t("content.questions.saved"));
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
      await apiDelete(`/api/v1/admin/questions/${deleteTarget.id}`, locale, token);
      setDeleteTarget(null);
      await load();
      toast.success(tToast("successTitle"), t("content.questions.deleted"));
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
      {scope === "grammar" || scope === "all" ? (
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
          <p className="font-medium">{t("content.questions.bankStatusTitle")}</p>
          <p className="mt-1 text-muted-foreground">
            {bankPools.length
              ? bankPools.map((p) => `${p.slug}: ${p.count}`).join(" · ")
              : "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {lastCrawlAt
              ? t("content.questions.bankLastCrawl", { at: lastCrawlAt })
              : t("content.questions.bankNeverCrawled")}
          </p>
        </div>
      ) : null}
      {scope === "grammar" || scope === "all" ? (
        <AdminQuestionFeedsPanel
          adapterKeys={adapterKeys}
          groups={groups}
          token={token}
          onCrawlAll={() => void runBankCrawl()}
        />
      ) : null}
        <div className="space-y-1">
          <Label>{t("content.questions.filterScope")}</Label>
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={scope}
            onChange={(e) => {
              setScope(e.target.value as typeof scope);
              setPage(1);
            }}
          >
            <option value="grammar">{t("content.questions.scopeGrammar")}</option>
            <option value="exam">{t("content.questions.scopeExam")}</option>
            <option value="all">{t("content.questions.scopeAll")}</option>
          </select>
        </div>
        {scope !== "exam" ? (
          <div className="space-y-1">
            <Label>{t("content.tenses.colGroup")}</Label>
            <select
              className="flex h-10 min-w-[10rem] rounded-md border border-input bg-background px-3 text-sm"
              value={filterGroupId}
              onChange={(e) => {
                setFilterGroupId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{t("content.tenses.allGroups")}</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label ?? g.slug}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        {scope !== "grammar" ? (
          <div className="space-y-1">
            <Label>{t("content.exams.colTitle")}</Label>
            <select
              className="flex h-10 min-w-[10rem] rounded-md border border-input bg-background px-3 text-sm"
              value={filterExamId}
              onChange={(e) => {
                setFilterExamId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{t("content.questions.allExams")}</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div className="ml-auto flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={crawling}
            onClick={() => void runBankCrawl()}
          >
            {crawling ? t("content.questions.crawlingBank") : t("content.questions.crawlBank")}
          </Button>
          <Button type="button" onClick={openCreate}>
            <Plus className="size-4" />
            {t("content.questions.add")}
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">{t("content.questions.colPrompt")}</th>
                <th className="px-3 py-2">{t("content.questions.colType")}</th>
                <th className="px-3 py-2 text-right">{t("content.colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr className="border-b border-border/60" key={row.id}>
                  <td className="px-3 py-2 text-muted-foreground">{row.id}</td>
                  <td className="max-w-md px-3 py-2">{row.label}</td>
                  <td className="px-3 py-2 font-mono text-xs">{row.type}</td>
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
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{t("content.questions.pageInfo", { page: meta.current_page, total: meta.total })}</span>
        <div className="flex gap-2">
          <Button
            disabled={meta.current_page <= 1}
            size="sm"
            type="button"
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            {t("content.questions.prev")}
          </Button>
          <Button
            disabled={meta.current_page >= meta.last_page}
            size="sm"
            type="button"
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
          >
            {t("content.questions.next")}
          </Button>
        </div>
      </div>

      <AdminModal
        description={editingId ? t("content.questions.editDesc") : t("content.questions.createDesc")}
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
        title={editingId ? t("content.questions.editTitle") : t("content.questions.createTitle")}
        wide
        onClose={() => setEditorOpen(false)}
      >
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("content.questions.colType")}</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={qType}
                onChange={(e) => setQType(e.target.value as typeof qType)}
              >
                <option value="multiple_choice">multiple_choice</option>
                <option value="fill_blank">fill_blank</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="q_sort">{t("content.colSort")}</Label>
              <Input id="q_sort" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("content.tenses.colGroup")}</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
              >
                <option value="">—</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label ?? g.slug}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("content.exams.colTitle")}</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
              >
                <option value="">—</option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="q_payload">{t("content.questions.fieldPayload")}</Label>
            <Textarea className="font-mono text-xs" id="q_payload" rows={6} value={payloadJson} onChange={(e) => setPayloadJson(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("content.translationsTab")}</Label>
            <AdminLocaleTabs
              en={
                <>
                  <div className="space-y-1.5">
                    <Label>{t("content.questions.promptEn")}</Label>
                    <RichTextEditor
                      minHeight={96}
                      value={enForm.prompt}
                      onChange={(html) => setEnForm({ ...enForm, prompt: html })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("content.questions.explanationEn")}</Label>
                    <RichTextEditor
                      minHeight={72}
                      value={enForm.explanation}
                      onChange={(html) => setEnForm({ ...enForm, explanation: html })}
                    />
                  </div>
                </>
              }
              vi={
                <>
                  <div className="space-y-1.5">
                    <Label>{t("content.questions.promptVi")}</Label>
                    <RichTextEditor
                      minHeight={96}
                      value={viForm.prompt}
                      onChange={(html) => setViForm({ ...viForm, prompt: html })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("content.questions.explanationVi")}</Label>
                    <RichTextEditor
                      minHeight={72}
                      value={viForm.explanation}
                      onChange={(html) => setViForm({ ...viForm, explanation: html })}
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
        description={t("content.questions.confirmSaveDesc")}
        loading={saving}
        open={confirmSaveOpen}
        title={t("content.questions.confirmSaveTitle")}
        onCancel={() => setConfirmSaveOpen(false)}
        onConfirm={persistSave}
      />

      <AdminConfirmModal
        confirmLabel={t("modal.confirmDelete")}
        description={t("content.questions.confirmDeleteDesc", { id: deleteTarget?.id ?? 0 })}
        destructive
        loading={saving}
        open={Boolean(deleteTarget)}
        title={t("content.questions.confirmDeleteTitle")}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
