import type { Locale } from "@/i18n/routing";
import { apiGet } from "@/lib/api";

export type CatalogLocale = {
  code: string;
  name: string;
  native_name: string;
  is_default?: boolean;
};

type LocalesResponse = {
  data: CatalogLocale[];
};

export function localeOptionLabel(item: CatalogLocale): string {
  return item.native_name?.trim() || item.name?.trim() || item.code;
}

export async function fetchActiveLocales(uiLocale: Locale): Promise<CatalogLocale[]> {
  const res = await apiGet<LocalesResponse>("/api/v1/locales", uiLocale);
  return res.data ?? [];
}
