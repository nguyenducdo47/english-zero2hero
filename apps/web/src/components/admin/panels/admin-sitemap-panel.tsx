"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ExternalLink, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";
import { formatApiError } from "@/lib/api-error";
import { purgeSeoRuntimeCache } from "@/lib/seo-cache";
import { toast } from "@/lib/toast";
import { AdminConfirmModal } from "@/components/admin/admin-confirm-modal";
import { AdminModal } from "@/components/admin/admin-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SystemRow = {
  url: string;
  route_key: string | null;
  locale: string;
  source: string;
  last_modified?: string | null;
  priority?: number | null;
  changefreq?: string | null;
  reason?: string;
  label?: string | null;
  custom_id?: number | null;
};

type CustomRow = {
  id: number;
  name: string | null;
  loc: string;
  locale: string | null;
  priority: number | null;
  changefreq: string | null;
  is_enabled: boolean;
  sort_order: number;
  updated_at: string | null;
};

type Overview = {
  canonical_base: string;
  sitemap_xml: string;
  stats: { included: number; excluded: number; custom: number };
  included: SystemRow[];
  excluded: SystemRow[];
  custom: CustomRow[];
};

const CHANGEFREQ = [
  "",
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
] as const;

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const emptyCustomForm = () => ({
  name: "",
  loc: "",
  locale: "" as "" | "vi" | "en",
  priority: "",
  changefreq: "",
  is_enabled: true,
  sort_order: "0",
});

export function AdminSitemapPanel({ token }: { token: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("admin");
  const tToast = useTranslations("toast");

  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [cacheClearing, setCacheClearing] = useState(false);
  const [systemFilter, setSystemFilter] = useState<"all" | "included" | "excluded">("included");
  const [search, setSearch] = useState("");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyCustomForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CustomRow | null>(null);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ data: Overview }>(
        "/api/v1/admin/sitemap/overview",
        locale,
        token,
      );
      setOverview(res.data);
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, [locale, token, tToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const systemRows = useMemo(() => {
    if (!overview) return [];
    const base =
      systemFilter === "included"
        ? overview.included.filter((r) => r.source === "registry")
        : systemFilter === "excluded"
          ? overview.excluded.filter((r) => r.source === "registry")
          : [
              ...overview.included.filter((r) => r.source === "registry"),
              ...overview.excluded.filter((r) => r.source === "registry"),
            ];
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (r) =>
        r.url.toLowerCase().includes(q) ||
        (r.route_key ?? "").toLowerCase().includes(q) ||
        (r.label ?? "").toLowerCase().includes(q),
    );
  }, [overview, systemFilter, search]);

  const clearSeoCache = async () => {
    setCacheClearing(true);
    try {
      await purgeSeoRuntimeCache(locale, token);
      await load();
      toast.success(tToast("successTitle"), t("seo.cacheCleared"));
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
    } finally {
      setCacheClearing(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyCustomForm());
    setEditorOpen(true);
  };

  const openEdit = (row: CustomRow) => {
    setEditingId(row.id);
    setForm({
      name: row.name ?? "",
      loc: row.loc,
      locale: (row.locale ?? "") as "" | "vi" | "en",
      priority: row.priority != null ? String(row.priority) : "",
      changefreq: row.changefreq ?? "",
      is_enabled: row.is_enabled,
      sort_order: String(row.sort_order),
    });
    setEditorOpen(true);
  };

  const saveCustom = async () => {
    if (!form.loc.trim()) return;
    setSaving(true);
    try {
      const body = {
        name: form.name.trim() || null,
        loc: form.loc.trim(),
        locale: form.locale || null,
        priority: form.priority.trim() ? Number(form.priority) : null,
        changefreq: form.changefreq || null,
        is_enabled: form.is_enabled,
        sort_order: Number(form.sort_order) || 0,
      };
      if (editingId) {
        await apiPatch(`/api/v1/admin/sitemap/custom/${editingId}`, body, locale, token);
      } else {
        await apiPost("/api/v1/admin/sitemap/custom", body, locale, token);
      }
      setEditorOpen(false);
      await load();
      toast.success(tToast("successTitle"), t("sitemap.customSaved"));
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(`/api/v1/admin/sitemap/custom/${deleteTarget.id}`, locale, token);
      setDeleteTarget(null);
      await load();
      toast.success(tToast("successTitle"), t("sitemap.customDeleted"));
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
    }
  };

  const toggleRegistryIndex = async (row: SystemRow, allowIndex: boolean) => {
    if (!row.route_key) return;
    const key = `${row.route_key}|${row.locale}`;
    setTogglingKey(key);
    try {
      await apiPut(
        "/api/v1/admin/seo/pages",
        { route_key: row.route_key, locale: row.locale, robots_index: allowIndex },
        locale,
        token,
      );
      await load();
      toast.success(tToast("successTitle"), t("sitemap.indexUpdated"));
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
    } finally {
      setTogglingKey(null);
    }
  };

  if (loading && !overview) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  }

  const stats = overview?.stats ?? { included: 0, excluded: 0, custom: 0 };
  const sitemapXml = overview?.sitemap_xml ?? "";
  const canonicalBase = overview?.canonical_base ?? "";

  const reasonLabel = (reason?: string) => {
    if (!reason) return "—";
    const map: Record<string, string> = {
      static_noindex: t("sitemap.reasonStaticNoindex"),
      robots_index: t("sitemap.reasonRobotsIndex"),
      disabled: t("sitemap.reasonDisabled"),
    };
    return map[reason] ?? reason;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{t("seo.cacheHint")}</p>
        <Button
          disabled={cacheClearing}
          size="sm"
          type="button"
          variant="outline"
          onClick={() => void clearSeoCache()}
        >
          <RefreshCw className={`mr-2 size-4 ${cacheClearing ? "animate-spin" : ""}`} />
          {t("seo.clearCache")}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("sitemap.statIncluded")}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{stats.included}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("sitemap.statExcluded")}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{stats.excluded}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("sitemap.statCustom")}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{stats.custom}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("sitemap.publicFile")}</CardTitle>
          <CardDescription>{t("sitemap.publicFileDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-muted-foreground">{t("sitemap.canonicalBase")}:</span>
          <code className="rounded bg-muted px-2 py-1">{canonicalBase || "—"}</code>
          {sitemapXml ? (
            <a
              className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
              href={sitemapXml}
              rel="noopener noreferrer"
              target="_blank"
            >
              {t("sitemap.openXml")}
              <ExternalLink className="size-3.5" />
            </a>
          ) : null}
          <Link className="text-primary underline-offset-4 hover:underline" href="/admin/content/seo">
            {t("sitemap.editCanonical")}
          </Link>
        </CardContent>
      </Card>

      <Tabs defaultValue="system">
        <TabsList>
          <TabsTrigger value="system">{t("sitemap.tabSystem")}</TabsTrigger>
          <TabsTrigger value="custom">{t("sitemap.tabCustom")}</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-3" value="system">
          <div className="flex flex-wrap gap-2">
            <select
              className={selectClassName}
              style={{ maxWidth: 200 }}
              value={systemFilter}
              onChange={(e) => setSystemFilter(e.target.value as typeof systemFilter)}
            >
              <option value="included">{t("sitemap.filterIncluded")}</option>
              <option value="excluded">{t("sitemap.filterExcluded")}</option>
              <option value="all">{t("sitemap.filterAll")}</option>
            </select>
            <Input
              className="max-w-sm"
              placeholder={t("sitemap.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 font-medium">{t("sitemap.colUrl")}</th>
                  <th className="px-3 py-2 font-medium">{t("sitemap.colRoute")}</th>
                  <th className="px-3 py-2 font-medium">{t("sitemap.colLocale")}</th>
                  <th className="px-3 py-2 font-medium">{t("sitemap.colLastmod")}</th>
                  <th className="px-3 py-2 font-medium">{t("sitemap.colReason")}</th>
                  <th className="px-3 py-2 font-medium">{t("sitemap.colActions")}</th>
                </tr>
              </thead>
              <tbody>
                {systemRows.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-muted-foreground" colSpan={6}>
                      {t("sitemap.emptySystem")}
                    </td>
                  </tr>
                ) : (
                  systemRows.map((row) => {
                    const excluded = Boolean(row.reason);
                    const toggleKey = `${row.route_key}|${row.locale}`;
                    return (
                      <tr key={`${row.url}-${row.locale}`} className="border-b last:border-0">
                        <td className="max-w-[240px] truncate px-3 py-2" title={row.url}>
                          {row.url}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">{row.route_key ?? "—"}</td>
                        <td className="px-3 py-2">{row.locale}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">
                          {row.last_modified
                            ? new Date(row.last_modified).toLocaleString()
                            : "—"}
                        </td>
                        <td className="px-3 py-2 text-xs">{reasonLabel(row.reason)}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {row.route_key ? (
                              <>
                                <Link
                                  className="inline-flex h-8 items-center rounded-md px-3 text-sm hover:bg-muted"
                                  href="/admin/content/seo"
                                >
                                  {t("sitemap.editSeo")}
                                </Link>
                                <Button
                                  disabled={togglingKey === toggleKey}
                                  size="sm"
                                  type="button"
                                  variant="outline"
                                  onClick={() =>
                                    void toggleRegistryIndex(row, excluded)
                                  }
                                >
                                  {excluded ? t("sitemap.allowIndex") : t("sitemap.blockIndex")}
                                </Button>
                              </>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent className="space-y-3" value="custom">
          <div className="flex justify-end">
            <Button size="sm" type="button" onClick={openCreate}>
              <Plus className="mr-2 size-4" />
              {t("sitemap.addCustom")}
            </Button>
          </div>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 font-medium">{t("sitemap.colName")}</th>
                  <th className="px-3 py-2 font-medium">{t("sitemap.colLoc")}</th>
                  <th className="px-3 py-2 font-medium">{t("sitemap.colLocale")}</th>
                  <th className="px-3 py-2 font-medium">{t("sitemap.colPriority")}</th>
                  <th className="px-3 py-2 font-medium">{t("sitemap.colChangefreq")}</th>
                  <th className="px-3 py-2 font-medium">{t("sitemap.colEnabled")}</th>
                  <th className="px-3 py-2 font-medium">{t("sitemap.colActions")}</th>
                </tr>
              </thead>
              <tbody>
                {(overview?.custom ?? []).length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-muted-foreground" colSpan={7}>
                      {t("sitemap.emptyCustom")}
                    </td>
                  </tr>
                ) : (
                  (overview?.custom ?? []).map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="px-3 py-2">{row.name ?? "—"}</td>
                      <td className="max-w-[200px] truncate px-3 py-2 font-mono text-xs" title={row.loc}>
                        {row.loc}
                      </td>
                      <td className="px-3 py-2">{row.locale ?? t("sitemap.localeAll")}</td>
                      <td className="px-3 py-2">{row.priority ?? "—"}</td>
                      <td className="px-3 py-2">{row.changefreq ?? "—"}</td>
                      <td className="px-3 py-2">{row.is_enabled ? t("sitemap.yes") : t("sitemap.no")}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <Button
                            aria-label={t("sitemap.edit")}
                            size="icon"
                            type="button"
                            variant="ghost"
                            onClick={() => openEdit(row)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            aria-label={t("sitemap.delete")}
                            size="icon"
                            type="button"
                            variant="ghost"
                            onClick={() => setDeleteTarget(row)}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <AdminModal
        open={editorOpen}
        title={editingId ? t("sitemap.editCustomTitle") : t("sitemap.addCustomTitle")}
        onClose={() => setEditorOpen(false)}
      >
        <div className="space-y-3">
          <div>
            <Label htmlFor="sitemap-name">{t("sitemap.fieldName")}</Label>
            <Input
              id="sitemap-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="sitemap-loc">{t("sitemap.fieldLoc")}</Label>
            <Input
              id="sitemap-loc"
              placeholder="/landing"
              value={form.loc}
              onChange={(e) => setForm((f) => ({ ...f, loc: e.target.value }))}
            />
            <p className="mt-1 text-xs text-muted-foreground">{t("sitemap.fieldLocHint")}</p>
          </div>
          <div>
            <Label htmlFor="sitemap-locale">{t("sitemap.fieldLocale")}</Label>
            <select
              className={selectClassName}
              id="sitemap-locale"
              value={form.locale}
              onChange={(e) =>
                setForm((f) => ({ ...f, locale: e.target.value as typeof form.locale }))
              }
            >
              <option value="">{t("sitemap.localeAll")}</option>
              <option value="vi">vi</option>
              <option value="en">en</option>
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="sitemap-priority">{t("sitemap.fieldPriority")}</Label>
              <Input
                id="sitemap-priority"
                max="1"
                min="0"
                step="0.1"
                type="number"
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="sitemap-changefreq">{t("sitemap.fieldChangefreq")}</Label>
              <select
                className={selectClassName}
                id="sitemap-changefreq"
                value={form.changefreq}
                onChange={(e) => setForm((f) => ({ ...f, changefreq: e.target.value }))}
              >
                {CHANGEFREQ.map((v) => (
                  <option key={v || "default"} value={v}>
                    {v || "—"}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="sitemap-sort">{t("sitemap.fieldSort")}</Label>
              <Input
                id="sitemap-sort"
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
              />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <input
                checked={form.is_enabled}
                id="sitemap-enabled"
                type="checkbox"
                onChange={(e) => setForm((f) => ({ ...f, is_enabled: e.target.checked }))}
              />
              <Label htmlFor="sitemap-enabled">{t("sitemap.fieldEnabled")}</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>
              {t("sitemap.cancel")}
            </Button>
            <Button disabled={saving || !form.loc.trim()} type="button" onClick={() => void saveCustom()}>
              {t("save")}
            </Button>
          </div>
        </div>
      </AdminModal>

      <AdminConfirmModal
        cancelLabel={t("sitemap.cancel")}
        confirmLabel={t("sitemap.delete")}
        description={t("sitemap.deleteConfirm")}
        destructive
        open={Boolean(deleteTarget)}
        title={t("sitemap.deleteTitle")}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
