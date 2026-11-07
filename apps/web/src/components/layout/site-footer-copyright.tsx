"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

/** Snapshot cố định khi prerender — hydrate lấy năm thật trên client. */
const PRERENDER_YEAR = 2026;

function getClientYear() {
  return new Date().getFullYear();
}

function subscribeYear() {
  return () => {};
}

export function SiteFooterCopyright() {
  const t = useTranslations("footer");
  const year = useSyncExternalStore(subscribeYear, getClientYear, () => PRERENDER_YEAR);

  return <p className="text-xs">{t("copyright", { year })}</p>;
}
