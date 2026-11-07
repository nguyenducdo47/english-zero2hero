import type { Locale } from "@/i18n/routing";
import { apiPost } from "@/lib/api";

export type PortalCacheClearResult = {
  data: {
    laravel_cache: boolean;
    settings_cache: boolean;
    grammar: {
      synced: boolean;
      path: string;
      groups: number;
      tenses: number;
      message?: string;
    };
  };
};

/** Laravel cache flush, grammar.json sync, and Next.js revalidation. */
export async function purgeAllPortalCache(
  locale: Locale,
  token: string,
): Promise<PortalCacheClearResult> {
  const api = await apiPost<PortalCacheClearResult>(
    "/api/v1/admin/cache/clear",
    {},
    locale,
    token,
  );

  const res = await fetch("/api/admin/cache/revalidate", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Accept-Language": locale,
      "X-Locale": locale,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Revalidate failed: ${res.status} ${text}`);
  }

  return api;
}
