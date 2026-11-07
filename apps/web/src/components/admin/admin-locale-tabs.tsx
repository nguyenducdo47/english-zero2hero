"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type AdminContentLocale = "vi" | "en";

type AdminLocaleTabsProps = {
  vi: ReactNode;
  en: ReactNode;
  value?: AdminContentLocale;
  onValueChange?: (value: AdminContentLocale) => void;
  className?: string;
};

export function localeTabLabel(
  code: string,
  translate: (key: "vi" | "en" | "label") => string,
): string {
  if (code === "vi") return translate("vi");
  if (code === "en") return translate("en");
  return code;
}

type AdminLocaleTabSwitchProps = {
  value: AdminContentLocale;
  onValueChange: (value: AdminContentLocale) => void;
  className?: string;
};

/** Chỉ chuyển locale (không bọc nội dung) — dùng khi form dùng chung, state đổi theo tab. */
export function AdminLocaleTabSwitch({
  value,
  onValueChange,
  className,
}: AdminLocaleTabSwitchProps) {
  const tLocale = useTranslations("locale");

  return (
    <Tabs
      className={className}
      value={value}
      onValueChange={(v) => onValueChange(v as AdminContentLocale)}
    >
      <TabsList className="w-full justify-start">
        <TabsTrigger value="vi">{tLocale("vi")}</TabsTrigger>
        <TabsTrigger value="en">{tLocale("en")}</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export function AdminLocaleTabs({
  vi,
  en,
  value,
  onValueChange,
  className,
}: AdminLocaleTabsProps) {
  const tLocale = useTranslations("locale");
  const [internal, setInternal] = useState<AdminContentLocale>("vi");
  const current = value ?? internal;

  const handleChange = (next: string) => {
    const loc = next as AdminContentLocale;
    onValueChange?.(loc);
    if (value === undefined) setInternal(loc);
  };

  return (
    <Tabs className={className} value={current} onValueChange={handleChange}>
      <TabsList className="w-full justify-start">
        <TabsTrigger value="vi">{tLocale("vi")}</TabsTrigger>
        <TabsTrigger value="en">{tLocale("en")}</TabsTrigger>
      </TabsList>
      <TabsContent value="vi" className="mt-3 space-y-2">
        {vi}
      </TabsContent>
      <TabsContent value="en" className="mt-3 space-y-2">
        {en}
      </TabsContent>
    </Tabs>
  );
}
