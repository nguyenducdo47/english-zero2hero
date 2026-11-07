"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { formatApiError } from "@/lib/api-error";
import { toast } from "@/lib/toast";
import { AdminConfirmModal } from "@/components/admin/admin-confirm-modal";
import { AdminModal } from "@/components/admin/admin-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SlugInput } from "@/components/ui/slug-input";
import { Label } from "@/components/ui/label";

type RoleRow = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  permissions: string[] | null;
  is_system: boolean;
  users_count?: number;
};

type RoleForm = {
  slug: string;
  name: string;
  description: string;
  permissions: string[];
};

const emptyForm = (): RoleForm => ({
  slug: "",
  name: "",
  description: "",
  permissions: ["admin.access"],
});

export function AdminRolesPanel({ token }: { token: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("admin");
  const tToast = useTranslations("toast");

  const [rows, setRows] = useState<RoleRow[]>([]);
  const [permissionCatalog, setPermissionCatalog] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<RoleForm>(emptyForm);

  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RoleRow | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{
        data: RoleRow[];
        meta: { permissions: Record<string, string> };
      }>("/api/v1/admin/roles", locale, token);
      setRows(res.data);
      setPermissionCatalog(res.meta?.permissions ?? {});
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, [locale, token, tToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const permKeys = useMemo(
    () => Object.keys(permissionCatalog).sort(),
    [permissionCatalog],
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setEditorOpen(true);
  };

  const openEdit = (row: RoleRow) => {
    setEditingId(row.id);
    setForm({
      slug: row.slug,
      name: row.name,
      description: row.description ?? "",
      permissions: row.permissions ?? [],
    });
    setEditorOpen(true);
  };

  const requestSave = () => {
    if (!form.name.trim()) {
      toast.error(tToast("errorTitle"), t("roles.nameRequired"));
      return;
    }
    if (!editingId && !form.slug.trim()) {
      toast.error(tToast("errorTitle"), t("roles.slugRequired"));
      return;
    }
    setConfirmSaveOpen(true);
  };

  const persistSave = async () => {
    setSaving(true);
    try {
      const body = {
        slug: form.slug,
        name: form.name,
        description: form.description || null,
        permissions: form.permissions,
      };
      if (editingId) {
        await apiPatch(`/api/v1/admin/roles/${editingId}`, body, locale, token);
      } else {
        await apiPost("/api/v1/admin/roles", body, locale, token);
      }
      setConfirmSaveOpen(false);
      setEditorOpen(false);
      await load();
      toast.success(tToast("successTitle"), t("roles.saved"));
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
      await apiDelete(`/api/v1/admin/roles/${deleteTarget.id}`, locale, token);
      setDeleteTarget(null);
      await load();
      toast.success(tToast("successTitle"), t("roles.deleted"));
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
    } finally {
      setSaving(false);
    }
  };

  const togglePerm = (key: string) => {
    setForm((f) => {
      const has = f.permissions.includes(key);
      return {
        ...f,
        permissions: has
          ? f.permissions.filter((p) => p !== key)
          : [...f.permissions, key],
      };
    });
  };

  const permLabel = (key: string) => {
    const i18nKey = `roles.perm.${key.replace(/\./g, "_")}`;
    if (t.has(i18nKey as "roles.perm.admin_access")) {
      return t(i18nKey as "roles.perm.admin_access");
    }
    return permissionCatalog[key] ?? key;
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" onClick={openCreate}>
          <Plus className="size-4" />
          {t("roles.add")}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">{t("roles.colName")}</th>
              <th className="px-3 py-2">{t("roles.colSlug")}</th>
              <th className="px-3 py-2">{t("roles.colUsers")}</th>
              <th className="px-3 py-2 text-right">{t("roles.colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-b border-border/60" key={row.id}>
                <td className="px-3 py-2">
                  <span className="font-medium">{row.name}</span>
                  {row.is_system ? (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({t("roles.system")})
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2 font-mono text-xs">{row.slug}</td>
                <td className="px-3 py-2">{row.users_count ?? 0}</td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={() => openEdit(row)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      disabled={row.is_system}
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={() => setDeleteTarget(row)}
                    >
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
        description={editingId ? t("roles.editDesc") : t("roles.createDesc")}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>
              {t("modal.cancel")}
            </Button>
            <Button type="button" onClick={requestSave}>
              {t("roles.reviewSave")}
            </Button>
          </>
        }
        open={editorOpen}
        title={editingId ? t("roles.editTitle") : t("roles.createTitle")}
        onClose={() => setEditorOpen(false)}
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="role_name">{t("roles.fieldName")}</Label>
            <Input
              id="role_name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role_slug">{t("roles.fieldSlug")}</Label>
            <SlugInput
              disabled={Boolean(editingId)}
              id="role_slug"
              placeholder="content-manager"
              value={form.slug}
              onChange={(slug) => setForm({ ...form, slug })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role_desc">{t("roles.fieldDesc")}</Label>
            <Input
              id="role_desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("roles.fieldPermissions")}</Label>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-border p-2">
              {permKeys.map((key) => (
                <label className="flex cursor-pointer items-start gap-2 text-sm" key={key}>
                  <input
                    checked={form.permissions.includes(key)}
                    type="checkbox"
                    onChange={() => togglePerm(key)}
                  />
                  <span>
                    <span className="font-medium">{permLabel(key)}</span>
                    <span className="block font-mono text-xs text-muted-foreground">{key}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </AdminModal>

      <AdminConfirmModal
        confirmLabel={t("modal.confirmSave")}
        description={t("roles.confirmSaveDesc")}
        loading={saving}
        open={confirmSaveOpen}
        title={t("roles.confirmSaveTitle")}
        onCancel={() => setConfirmSaveOpen(false)}
        onConfirm={persistSave}
      />

      <AdminConfirmModal
        confirmLabel={t("modal.confirmDelete")}
        description={t("roles.confirmDeleteDesc", { name: deleteTarget?.name ?? "" })}
        destructive
        loading={saving}
        open={Boolean(deleteTarget)}
        title={t("roles.confirmDeleteTitle")}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
