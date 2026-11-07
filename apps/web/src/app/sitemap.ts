import type { MetadataRoute } from "next";
import { getAllTenseSlugs } from "@/lib/grammar-data";
import { routing } from "@/i18n/routing";
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/seo/sitemap-entries`, {
      headers: { Accept: "application/json", "X-Locale": "vi" },
      next: { revalidate: 60, tags: ["seo"] },
    });
    if (!response.ok) throw new Error(String(response.status));
    const res = (await response.json()) as {
      data: { url: string; lastModified?: string; index: boolean }[];
    };

    const fromApi = res.data
      .filter((e) => e.index)
      .map((e) => ({
        url: e.url.startsWith("http") ? e.url : `${site}${e.url}`,
        lastModified: e.lastModified ? new Date(e.lastModified) : new Date(),
      }));

    if (fromApi.length > 0) {
      return fromApi;
    }
  } catch {
    /* fallback below */
  }

  const paths = ["", "/grammar"];
  const tenses = getAllTenseSlugs();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    for (const path of paths) {
      entries.push({
        url: `${site}${prefix}${path}`,
        lastModified: new Date(),
      });
    }
    for (const slug of tenses) {
      entries.push({
        url: `${site}${prefix}/grammar/${slug}`,
        lastModified: new Date(),
      });
    }
  }

  return entries;
}
