"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Pencil, Trash2 } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { apiDelete, apiGet, apiPatch } from "@/lib/api";
import { formatApiError } from "@/lib/api-error";
import { toast } from "@/lib/toast";
import { AdminConfirmModal } from "@/components/admin/admin-confirm-modal";
import { AdminModal } from "@/components/admin/admin-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RoleOption = { id: number; slug: string; name: string };

type UserRow = {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  roles: RoleOption[];
};

export function AdminUsersPanel({ token }: { token: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("admin");
  const tToast = useTranslations("toast");

  const [rows, setRows] = useState<UserRow[]>([]);
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, current_page: 1, last_page: 1 });

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [name, setName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleIds, setRoleIds] = useState<number[]>([]);

  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const [usersRes, rolesRes] = await Promise.all([
          apiGet<{
            data: UserRow[];
            meta: { total: number; current_page: number; last_page: number };
          }>(`/api/v1/admin/users?per_page=20&page=${page}`, locale, token),
          apiGet<{ data: RoleOption[] }>(
            "/api/v1/admin/users/roles-list",
            locale,
            token,
          ),
        ]);
        setRows(usersRes.data);
        setMeta(usersRes.meta);
        setRoleOptions(rolesRes.data);
      } catch (e) {
        toast.error(tToast("errorTitle"), formatApiError(e));
      } finally {
        setLoading(false);
      }
    },
    [locale, token, tToast],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const openEdit = (row: UserRow) => {
    setEditing(row);
    setName(row.name);
    setIsAdmin(row.is_admin);
    setRoleIds(row.roles.map((r) => r.id));
    setEditorOpen(true);
  };

  const requestSave = () => {
    if (!name.trim()) {
      toast.error(tToast("errorTitle"), t("users.nameRequired"));
      return;
    }
    setConfirmSaveOpen(true);
  };

  const persistSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await apiPatch(
        `/api/v1/admin/users/${editing.id}`,
        { name, is_admin: isAdmin, role_ids: roleIds },
        locale,
        token,
      );
      setConfirmSaveOpen(false);
      setEditorOpen(false);
      await load(meta.current_page);
      toast.success(tToast("successTitle"), t("users.saved"));
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
      await apiDelete(`/api/v1/admin/users/${deleteTarget.id}`, locale, token);
      setDeleteTarget(null);
      await load(meta.current_page);
      toast.success(tToast("successTitle"), t("users.deleted"));
    } catch (e) {
      toast.error(tToast("errorTitle"), formatApiError(e));
    } finally {
      setSaving(false);
    }
  };

  const toggleRole = (id: number) => {
    setRoleIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">{t("users.colEmail")}</th>
              <th className="px-3 py-2">{t("users.colName")}</th>
              <th className="px-3 py-2">{t("users.colRoles")}</th>
              <th className="px-3 py-2">{t("users.colAdmin")}</th>
              <th className="px-3 py-2 text-right">{t("users.colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-b border-border/60" key={row.id}>
                <td className="px-3 py-2">{row.email}</td>
                <td className="px-3 py-2">{row.name}</td>
                <td className="px-3 py-2 text-xs">
                  {row.roles.length
                    ? row.roles.map((r) => r.name).join(", ")
                    : "—"}
                </td>
                <td className="px-3 py-2">{row.is_admin ? t("users.yes") : "—"}</td>
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
        description={t("users.editDesc")}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>
              {t("modal.cancel")}
            </Button>
            <Button type="button" onClick={requestSave}>
              {t("users.reviewSave")}
            </Button>
          </>
        }
        open={editorOpen}
        title={t("users.editTitle")}
        onClose={() => setEditorOpen(false)}
      >
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">{editing?.email}</p>
          <div className="space-y-1.5">
            <Label htmlFor="user_name">{t("users.fieldName")}</Label>
            <Input
              id="user_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              checked={isAdmin}
              type="checkbox"
              onChange={(e) => setIsAdmin(e.target.checked)}
            />
            {t("users.fieldIsAdmin")}
          </label>
          <div className="space-y-2">
            <Label>{t("users.fieldRoles")}</Label>
            <div className="space-y-2 rounded-md border border-border p-2">
              {roleOptions.map((r) => (
                <label className="flex items-center gap-2 text-sm" key={r.id}>
                  <input
                    checked={roleIds.includes(r.id)}
                    type="checkbox"
                    onChange={() => toggleRole(r.id)}
                  />
                  {r.name}
                </label>
              ))}
            </div>
          </div>
        </div>
      </AdminModal>

      <AdminConfirmModal
        confirmLabel={t("modal.confirmSave")}
        description={t("users.confirmSaveDesc")}
        loading={saving}
        open={confirmSaveOpen}
        title={t("users.confirmSaveTitle")}
        onCancel={() => setConfirmSaveOpen(false)}
        onConfirm={persistSave}
      />

      <AdminConfirmModal
        confirmLabel={t("modal.confirmDelete")}
        description={t("users.confirmDeleteDesc", { email: deleteTarget?.email ?? "" })}
        destructive
        loading={saving}
        open={Boolean(deleteTarget)}
        title={t("users.confirmDeleteTitle")}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
