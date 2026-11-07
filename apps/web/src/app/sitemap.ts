import type { MetadataRoute } from "next";
import { getAllTenseSlugs } from "@/lib/grammar-data";
import { routing } from "@/i18n/routing";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
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
