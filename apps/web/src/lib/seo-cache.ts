import type { Locale } from "@/i18n/routing";
import { purgeAllPortalCache } from "@/lib/runtime-cache";

/** Clears Laravel SEO resolve cache and Next.js `seo` fetch cache tag. */
export async function purgeSeoRuntimeCache(
  locale: Locale,
  token: string,
): Promise<void> {
  await purgeAllPortalCache(locale, token);
}
