"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPostFormData,
  apiPut,
} from "@/lib/api";
import { AdminSeoImageField } from "@/components/admin/panels/admin-seo-image-field";
import { AdminSeoGuide, AdminSeoTabHint } from "@/components/admin/panels/admin-seo-guide";
import { purgeSeoRuntimeCache } from "@/lib/seo-cache";
import { formatApiError } from "@/lib/api-error";
import { RefreshCw } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AdminLocaleTabSwitch } from "@/components/admin/admin-locale-tabs";
import { AdminSeoFieldLabel } from "@/components/admin/panels/admin-seo-field-label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import type { SeoResolved } from "@/lib/seo-metadata";
import { plainTextLength } from "@/lib/rich-text";

const fieldTextareaClass =
  "flex min-h-[80px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type SeoGlobal = {
  site_name: string;
  default_title: string | null;
  default_description: string | null;
  default_keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  favicon_url: string | null;
  site_logo_url: string | null;
  twitter_card: string;
  canonical_base: string | null;
  robots_default_index: boolean;
  robots_default_follow: boolean;
  default_locale: string;
  organization_name: string | null;
  organization_logo_url: string | null;
  organization_url: string | null;
  maintenance_noindex: boolean;
};

type RegistryItem = {
  route_key: string;
  label: string;
  path: string;
  dynamic: boolean;
  noindex?: boolean;
};

type SeoPageRow = {
  route_key: string;
  locale: string;
  title: string | null;
  description: string | null;
  canonical_path: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  robots_index: boolean | null;
  robots_follow: boolean | null;
  structured_data?: unknown;
};

type ValidationIssue = {
  type: string;
  field?: string;
  message?: string;
  route_key?: string;
  locale?: string;
  duplicate_of?: string;
};

function charHint(len: number, soft: number) {
  return len > soft ? "text-amber-600" : "text-muted-foreground";
}

export function AdminSeoPanel({ token }: { token: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("admin");
  const tToast = useTranslations("toast");
  const th = (key: string) => t(`seo.fieldHelp.${key}`);

  const [globalForm, setGlobalForm] = useState<SeoGlobal | null>(null);
  const [registry, setRegistry] = useState<RegistryItem[]>([]);
  const [selectedRoute, setSelectedRoute] = useState("home");
  const [pageLocale, setPageLocale] = useState<"vi" | "en">("vi");
  const [pageForm, setPageForm] = useState<Partial<SeoPageRow>>({});
  const [preview, setPreview] = useState<SeoResolved | null>(null);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [assetUploading, setAssetUploading] = useState<string | null>(null);
  const [cacheClearing, setCacheClearing] = useState(false);

  const loadAll = useCallback(async () => {
    const [g, reg, val] = await Promise.all([
      apiGet<{ data: SeoGlobal }>("/api/v1/admin/seo/global", locale, token),
      apiGet<{ data: RegistryItem[] }>("/api/v1/admin/seo/registry", locale, token),
      apiGet<{ data: ValidationIssue[] }>("/api/v1/admin/seo/validate", locale, token),
    ]);
    setGlobalForm(g.data);
    setRegistry(reg.data);
    setIssues(val.data);
    setSelectedRoute((current) => {
      if (reg.data.length && !reg.data.some((r) => r.route_key === current)) {
        return reg.data[0].route_key;
      }
      return current;
    });
  }, [locale, token]);

  const loadPage = useCallback(async () => {
    const encoded = encodeURIComponent(selectedRoute);
    const res = await apiGet<{ data: SeoPageRow[] }>(
      `/api/v1/admin/seo/pages/${encoded}`,
      locale,
      token,
    );
    const row =
      res.data.find((p) => p.locale === pageLocale) ??
      res.data.find((p) => p.locale === "*");
    setPageForm(
      row ?? {
        route_key: selectedRoute,
        locale: pageLocale,
        title: "",
        description: "",
      },
    );
  }, [locale, token, selectedRoute, pageLocale]);

  const loadPreview = useCallback(async () => {
    const q = new URLSearchParams({
      route_key: selectedRoute,
      locale: pageLocale,
    });
    const res = await apiGet<{ data: SeoResolved }>(
      `/api/v1/admin/seo/preview?${q}`,
      locale,
      token,
    );
    setPreview(res.data);
  }, [locale, token, selectedRoute, pageLocale]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await loadAll();
      } catch (e) {
        if (!cancelled) toast.error(tToast("errorTitle"), formatApiError(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadAll, tToast]);

  useEffect(() => {
    if (!token || loading) return;
    let cancelled = false;
    (async () => {
      try {
        await loadPage();
        await loadPreview();
      } catch (e) {
        if (!cancelled) toast.error(tToast("errorTitle"), formatApiError(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, loading, loadPage, loadPreview, tToast]);

  const registryOptions = useMemo(
    () => registry.filter((r) => !r.noindex),
    [registry],
  );

  const clearSeoCache = useCallback(async () => {
    setCacheClearing(true);
    try {
      await purgeSeoRuntimeCache(locale, token);
      await loadPreview();
      toast.success(tToast("successTitle"), t("seo.cacheCleared"));
    } catch (err) {
      toast.error(tToast("errorTitle"), formatApiError(err));
    } finally {
      setCacheClearing(false);
    }
  }, [locale, token, loadPreview, t, tToast]);

  const uploadAsset = async (
    type: "favicon" | "site_logo" | "organization_logo" | "og_image",
    file: File,
  ) => {
    setAssetUploading(type);
    const body = new FormData();
    body.append("type", type);
    body.append("file", file, file.name);
    try {
      const res = await apiPostFormData<{
        data: { global: SeoGlobal };
      }>("/api/v1/admin/seo/assets", body, locale, token);
      setGlobalForm(res.data.global);
      await purgeSeoRuntimeCache(locale, token).catch(() => undefined);
      toast.success(tToast("successTitle"), t("seo.assetUploaded"));
    } catch (err) {
      toast.error(tToast("errorTitle"), formatApiError(err));
      throw err;
    } finally {
      setAssetUploading(null);
    }
  };

  const saveGlobal = async (e: FormEvent) => {
    e.preventDefault();
    if (!globalForm) return;
    setSaving("global");
    try {
      await apiPatch("/api/v1/admin/seo/global", globalForm, locale, token);
      await loadAll();
      await purgeSeoRuntimeCache(locale, token).catch(() => undefined);
      toast.success(tToast("successTitle"), t("seo.savedGlobal"));
    } catch (err) {
      toast.error(tToast("errorTitle"), formatApiError(err));
    } finally {
      setSaving(null);
    }
  };

  const savePage = async (e: FormEvent) => {
    e.preventDefault();
    setSaving("page");
    const body = {
      ...pageForm,
      route_key: selectedRoute,
      locale: pageLocale,
    };
    try {
      await apiPut("/api/v1/admin/seo/pages", body, locale, token);
      await loadPreview();
      const val = await apiGet<{ data: ValidationIssue[] }>(
        "/api/v1/admin/seo/validate",
        locale,
        token,
      );
      setIssues(val.data);
      toast.success(tToast("successTitle"), t("seo.savedPage"));
    } catch (err) {
      toast.error(tToast("errorTitle"), formatApiError(err));
    } finally {
      setSaving(null);
    }
  };

  const clearPage = async () => {
    setSaving("clear");
    try {
      const encoded = encodeURIComponent(selectedRoute);
      await apiDelete(
        `/api/v1/admin/seo/pages/${encoded}/${pageLocale}`,
        locale,
        token,
      );
      await loadPage();
      await loadPreview();
      toast.success(tToast("successTitle"), t("seo.clearedPage"));
    } catch (err) {
      toast.error(tToast("errorTitle"), formatApiError(err));
    } finally {
      setSaving(null);
    }
  };

  if (loading || !globalForm) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  }

  const titleLen = globalForm.default_title?.length ?? 0;
  const descLen = plainTextLength(globalForm.default_description);

  return (
    <Tabs className="space-y-4" defaultValue="global">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{t("seo.cacheHint")}</p>
        <Button
          disabled={cacheClearing}
          size="sm"
          type="button"
          variant="outline"
          onClick={clearSeoCache}
        >
          <RefreshCw
            className={`mr-2 size-4 ${cacheClearing ? "animate-spin" : ""}`}
          />
          {t("seo.clearCache")}
        </Button>
      </div>
      <AdminSeoGuide />
      <TabsList>
        <TabsTrigger value="global">{t("seo.tabGlobal")}</TabsTrigger>
        <TabsTrigger value="pages">{t("seo.tabPages")}</TabsTrigger>
        <TabsTrigger value="technical">{t("seo.tabTechnical")}</TabsTrigger>
        <TabsTrigger value="preview">{t("seo.tabPreview")}</TabsTrigger>
        <TabsTrigger value="validate">{t("seo.tabValidate")}</TabsTrigger>
      </TabsList>

      <TabsContent value="global">
        <AdminSeoTabHint messageKey="hintGlobal" />
        <form className="space-y-4" onSubmit={saveGlobal}>
          <Card>
            <CardHeader>
              <CardTitle>{t("seo.globalTitle")}</CardTitle>
              <CardDescription>{t("seo.globalDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <AdminSeoFieldLabel
                  help={th("siteName")}
                  htmlFor="site_name"
                  label={t("seo.siteName")}
                />
                <Input
                  id="site_name"
                  value={globalForm.site_name}
                  onChange={(e) =>
                    setGlobalForm({ ...globalForm, site_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <AdminSeoFieldLabel
                  help={th("defaultTitle")}
                  htmlFor="default_title"
                  label={t("seo.defaultTitle")}
                />
                <Input
                  id="default_title"
                  value={globalForm.default_title ?? ""}
                  onChange={(e) =>
                    setGlobalForm({
                      ...globalForm,
                      default_title: e.target.value,
                    })
                  }
                />
                <p className={`text-xs ${charHint(titleLen, 60)}`}>
                  {titleLen} / 60
                </p>
              </div>
              <div className="space-y-2">
                <AdminSeoFieldLabel
                  help={th("keywords")}
                  htmlFor="default_keywords"
                  label={t("seo.keywords")}
                />
                <Input
                  id="default_keywords"
                  value={globalForm.default_keywords ?? ""}
                  onChange={(e) =>
                    setGlobalForm({
                      ...globalForm,
                      default_keywords: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <AdminSeoFieldLabel
                  help={th("defaultDescription")}
                  htmlFor="default_description"
                  label={t("seo.defaultDescription")}
                />
                <RichTextEditor
                  id="default_description"
                  minHeight={96}
                  value={globalForm.default_description ?? ""}
                  onChange={(html) =>
                    setGlobalForm({
                      ...globalForm,
                      default_description: html,
                    })
                  }
                />
                <p className={`text-xs ${charHint(descLen, 160)}`}>
                  {descLen} / 160
                </p>
              </div>
              <div className="space-y-2">
                <AdminSeoFieldLabel
                  help={th("ogTitle")}
                  htmlFor="og_title"
                  label={t("seo.ogTitle")}
                />
                <Input
                  id="og_title"
                  value={globalForm.og_title ?? ""}
                  onChange={(e) =>
                    setGlobalForm({ ...globalForm, og_title: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <AdminSeoImageField
                  accept=".ico,.png,.jpg,.jpeg,.webp,.svg"
                  help={th("ogImage")}
                  hint={t("seo.ogImageHint")}
                  id="og_image_url"
                  label={t("seo.ogImage")}
                  uploading={assetUploading === "og_image"}
                  value={globalForm.og_image_url ?? ""}
                  onChange={(url) =>
                    setGlobalForm({ ...globalForm, og_image_url: url })
                  }
                  onUpload={(file) => uploadAsset("og_image", file)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <AdminSeoFieldLabel
                  help={th("ogDescription")}
                  htmlFor="og_description"
                  label={t("seo.ogDescription")}
                />
                <RichTextEditor
                  id="og_description"
                  minHeight={72}
                  value={globalForm.og_description ?? ""}
                  onChange={(html) =>
                    setGlobalForm({
                      ...globalForm,
                      og_description: html,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <AdminSeoFieldLabel
                  help={th("orgName")}
                  htmlFor="organization_name"
                  label={t("seo.orgName")}
                />
                <Input
                  id="organization_name"
                  value={globalForm.organization_name ?? ""}
                  onChange={(e) =>
                    setGlobalForm({
                      ...globalForm,
                      organization_name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <AdminSeoFieldLabel
                  help={th("orgUrl")}
                  htmlFor="organization_url"
                  label={t("seo.orgUrl")}
                />
                <Input
                  id="organization_url"
                  value={globalForm.organization_url ?? ""}
                  onChange={(e) =>
                    setGlobalForm({
                      ...globalForm,
                      organization_url: e.target.value,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("seo.brandingTitle")}</CardTitle>
              <CardDescription>{t("seo.brandingDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <AdminSeoImageField
                accept=".ico,.png,.jpg,.jpeg,.webp,.svg"
                help={th("favicon")}
                hint={t("seo.faviconHint")}
                id="favicon_url"
                label={t("seo.favicon")}
                uploading={assetUploading === "favicon"}
                value={globalForm.favicon_url ?? ""}
                onChange={(url) =>
                  setGlobalForm({ ...globalForm, favicon_url: url })
                }
                onUpload={(file) => uploadAsset("favicon", file)}
              />
              <AdminSeoImageField
                accept=".png,.jpg,.jpeg,.webp,.svg"
                help={th("siteLogo")}
                hint={t("seo.siteLogoHint")}
                id="site_logo_url"
                label={t("seo.siteLogo")}
                uploading={assetUploading === "site_logo"}
                value={globalForm.site_logo_url ?? ""}
                onChange={(url) =>
                  setGlobalForm({ ...globalForm, site_logo_url: url })
                }
                onUpload={(file) => uploadAsset("site_logo", file)}
              />
              <div className="md:col-span-2">
                <AdminSeoImageField
                  accept=".png,.jpg,.jpeg,.webp,.svg"
                  help={th("orgLogo")}
                  hint={t("seo.orgLogoHint")}
                  id="organization_logo_url"
                  label={t("seo.orgLogo")}
                  uploading={assetUploading === "organization_logo"}
                  value={globalForm.organization_logo_url ?? ""}
                  onChange={(url) =>
                    setGlobalForm({ ...globalForm, organization_logo_url: url })
                  }
                  onUpload={(file) => uploadAsset("organization_logo", file)}
                />
              </div>
            </CardContent>
          </Card>
          <Button disabled={saving === "global"} type="submit">
            {t("save")}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="pages">
        <AdminSeoTabHint messageKey="hintPages" />
        <form className="space-y-4" onSubmit={savePage}>
          <div className="flex flex-wrap gap-3">
            <div className="min-w-[240px] flex-1 space-y-2">
              <AdminSeoFieldLabel
                help={th("routeKey")}
                htmlFor="route_key"
                label={t("seo.routeKey")}
              />
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                id="route_key"
                value={selectedRoute}
                onChange={(e) => {
                  e.preventDefault();
                  setSelectedRoute(e.target.value);
                }}
              >
                {registry.map((r) => (
                  <option key={r.route_key} value={r.route_key}>
                    {r.label} ({r.route_key})
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[12rem] space-y-2">
              <AdminSeoFieldLabel help={th("pageLocale")} label={t("seo.pageLocale")} />
              <AdminLocaleTabSwitch value={pageLocale} onValueChange={setPageLocale} />
            </div>
          </div>
          <Card>
            <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <AdminSeoFieldLabel
                  help={th("pageTitle")}
                  htmlFor="page_title"
                  label={t("seo.pageTitle")}
                />
                <Input
                  id="page_title"
                  value={pageForm.title ?? ""}
                  onChange={(e) =>
                    setPageForm({ ...pageForm, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <AdminSeoFieldLabel
                  help={th("pageDescription")}
                  htmlFor="page_description"
                  label={t("seo.pageDescription")}
                />
                <RichTextEditor
                  id="page_description"
                  minHeight={96}
                  value={pageForm.description ?? ""}
                  onChange={(html) =>
                    setPageForm({ ...pageForm, description: html })
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <AdminSeoFieldLabel
                  help={th("canonicalPath")}
                  htmlFor="canonical_path"
                  label={t("seo.canonicalPath")}
                />
                <Input
                  id="canonical_path"
                  placeholder="/grammar/present-simple"
                  value={pageForm.canonical_path ?? ""}
                  onChange={(e) =>
                    setPageForm({ ...pageForm, canonical_path: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  checked={pageForm.robots_index ?? true}
                  id="robots_index"
                  type="checkbox"
                  onChange={(e) =>
                    setPageForm({
                      ...pageForm,
                      robots_index: e.target.checked,
                    })
                  }
                />
                <AdminSeoFieldLabel
                  help={th("robotsIndex")}
                  htmlFor="robots_index"
                  label={t("seo.robotsIndex")}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  checked={pageForm.robots_follow ?? true}
                  id="robots_follow"
                  type="checkbox"
                  onChange={(e) =>
                    setPageForm({
                      ...pageForm,
                      robots_follow: e.target.checked,
                    })
                  }
                />
                <AdminSeoFieldLabel
                  help={th("robotsFollow")}
                  htmlFor="robots_follow"
                  label={t("seo.robotsFollow")}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <AdminSeoFieldLabel
                  help={th("structuredData")}
                  htmlFor="structured_data"
                  label={t("seo.structuredData")}
                />
                <textarea
                  className={fieldTextareaClass}
                  id="structured_data"
                  placeholder='{"@type":"Article"}'
                  rows={4}
                  value={
                    typeof pageForm.structured_data === "string"
                      ? pageForm.structured_data
                      : pageForm.structured_data
                        ? JSON.stringify(pageForm.structured_data, null, 2)
                        : ""
                  }
                  onChange={(e) =>
                    setPageForm({
                      ...pageForm,
                      structured_data: e.target.value,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-wrap gap-2">
            <Button disabled={saving === "page"} type="submit">
              {t("save")}
            </Button>
            <Button
              disabled={saving === "clear"}
              type="button"
              variant="outline"
              onClick={clearPage}
            >
              {t("seo.clearOverride")}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("seo.registryCount", { count: registryOptions.length })}
          </p>
        </form>
      </TabsContent>

      <TabsContent value="technical">
        <AdminSeoTabHint messageKey="hintTechnical" />
        <form className="space-y-4" onSubmit={saveGlobal}>
          <Card>
            <CardHeader>
              <CardTitle>{t("seo.technicalTitle")}</CardTitle>
              <CardDescription>{t("seo.technicalDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <AdminSeoFieldLabel
                  help={th("canonicalBase")}
                  htmlFor="canonical_base"
                  label={t("seo.canonicalBase")}
                />
                <Input
                  id="canonical_base"
                  placeholder="https://english-zero2hero.com"
                  value={globalForm.canonical_base ?? ""}
                  onChange={(e) =>
                    setGlobalForm({
                      ...globalForm,
                      canonical_base: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  checked={globalForm.robots_default_index}
                  id="robots_default_index"
                  type="checkbox"
                  onChange={(e) =>
                    setGlobalForm({
                      ...globalForm,
                      robots_default_index: e.target.checked,
                    })
                  }
                />
                <AdminSeoFieldLabel
                  help={th("robotsDefaultIndex")}
                  htmlFor="robots_default_index"
                  label={t("seo.robotsDefaultIndex")}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  checked={globalForm.robots_default_follow}
                  id="robots_default_follow"
                  type="checkbox"
                  onChange={(e) =>
                    setGlobalForm({
                      ...globalForm,
                      robots_default_follow: e.target.checked,
                    })
                  }
                />
                <AdminSeoFieldLabel
                  help={th("robotsDefaultFollow")}
                  htmlFor="robots_default_follow"
                  label={t("seo.robotsDefaultFollow")}
                />
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  checked={globalForm.maintenance_noindex}
                  id="maintenance_noindex"
                  type="checkbox"
                  onChange={(e) =>
                    setGlobalForm({
                      ...globalForm,
                      maintenance_noindex: e.target.checked,
                    })
                  }
                />
                <AdminSeoFieldLabel
                  help={th("maintenanceNoindex")}
                  htmlFor="maintenance_noindex"
                  label={t("seo.maintenanceNoindex")}
                />
              </div>
            </CardContent>
          </Card>
          <Button disabled={saving === "global"} type="submit">
            {t("save")}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="preview">
        <AdminSeoTabHint messageKey="hintPreview" />
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("seo.previewGoogle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="text-lg text-[#1a0dab]">
                {preview?.title ?? globalForm.default_title}
              </p>
              <p className="text-[#006621]">{preview?.canonical ?? "—"}</p>
              <p className="text-muted-foreground">
                {preview?.description ?? globalForm.default_description}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("seo.previewOg")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">
                {preview?.open_graph.title ?? preview?.title}
              </p>
              <p className="text-muted-foreground">
                {preview?.open_graph.description ?? preview?.description}
              </p>
              {preview?.open_graph.image ? (
                <p className="break-all text-xs">{preview.open_graph.image}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {t("seo.noOgImage")}
                </p>
              )}
            </CardContent>
          </Card>
          {preview?.alternates && Object.keys(preview.alternates).length > 0 ? (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>{t("seo.hreflangPreview")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs">
                {Object.entries(preview.alternates).map(([loc, url]) => (
                  <p key={loc}>
                    <span className="font-mono">{loc}</span>: {url}
                  </p>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </TabsContent>

      <TabsContent value="validate">
        <AdminSeoTabHint messageKey="hintValidate" />
        <Card>
          <CardHeader>
            <CardTitle>{t("seo.validateTitle")}</CardTitle>
            <CardDescription>{t("seo.validateDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {issues.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("seo.noIssues")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 pr-4">{t("seo.issueType")}</th>
                      <th className="py-2 pr-4">{t("seo.issueField")}</th>
                      <th className="py-2">{t("seo.issueDetail")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((issue, i) => (
                      <tr className="border-b border-border/60" key={i}>
                        <td className="py-2 pr-4 font-mono text-xs">
                          {issue.type}
                        </td>
                        <td className="py-2 pr-4 text-xs">
                          {issue.field ?? issue.route_key ?? "—"}
                        </td>
                        <td className="py-2 text-xs text-muted-foreground">
                          {issue.message ??
                            (issue.locale
                              ? `${issue.locale}${issue.duplicate_of ? ` ↔ ${issue.duplicate_of}` : ""}`
                              : "—")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
