"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminSeoFieldLabel } from "@/components/admin/panels/admin-seo-field-label";

type Props = {
  id: string;
  label: string;
  help: string;
  hint?: string;
  value: string;
  accept: string;
  uploading?: boolean;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<void>;
};

export function AdminSeoImageField({
  id,
  label,
  help,
  hint,
  value,
  accept,
  uploading,
  onChange,
  onUpload,
}: Props) {
  const t = useTranslations("admin");
  const inputRef = useRef<HTMLInputElement>(null);
  const [localUploading, setLocalUploading] = useState(false);

  const busy = uploading || localUploading;

  const pickFile = async (file: File | undefined) => {
    if (!file) return;
    setLocalUploading(true);
    try {
      await onUpload(file);
    } finally {
      setLocalUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3">
      <AdminSeoFieldLabel help={help} htmlFor={id} label={label} />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {value ? (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            className="size-12 rounded border border-border object-contain bg-background"
            src={value}
          />
          <span className="line-clamp-2 break-all text-xs text-muted-foreground">
            {value}
          </span>
        </div>
      ) : null}
      <Input
        id={id}
        placeholder="https://..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          accept={accept}
          className="max-w-full text-sm file:mr-2 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:text-primary-foreground"
          disabled={busy}
          type="file"
          onChange={(e) => pickFile(e.target.files?.[0])}
        />
        {value ? (
          <Button
            disabled={busy}
            size="sm"
            type="button"
            variant="outline"
            onClick={() => onChange("")}
          >
            {t("seo.clearImage")}
          </Button>
        ) : null}
      </div>
      {busy ? (
        <p className="text-xs text-muted-foreground">{t("seo.uploading")}</p>
      ) : null}
    </div>
  );
}
