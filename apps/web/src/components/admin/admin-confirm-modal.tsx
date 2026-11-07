"use client";

import { useTranslations } from "next-intl";
import { AdminModal } from "@/components/admin/admin-modal";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function AdminConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive,
  loading,
  onCancel,
  onConfirm,
}: Props) {
  const t = useTranslations("admin");

  return (
    <AdminModal
      description={description}
      footer={
        <>
          <Button disabled={loading} type="button" variant="outline" onClick={onCancel}>
            {cancelLabel ?? t("modal.cancel")}
          </Button>
          <Button
            disabled={loading}
            type="button"
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
          >
            {confirmLabel ?? t("modal.confirm")}
          </Button>
        </>
      }
      open={open}
      title={title}
      onClose={onCancel}
    >
      <p className="text-sm text-muted-foreground">{description}</p>
    </AdminModal>
  );
}
