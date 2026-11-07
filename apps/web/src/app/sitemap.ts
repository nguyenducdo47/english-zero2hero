import type { MetadataRoute } from "next";
import { getAllTenseSlugs } from "@/lib/grammar-data";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const tenses = getAllTenseSlugs().map((slug) => ({
    url: `${site}/grammar/${slug}`,
    lastModified: new Date(),
  }));

  return [
    { url: site, lastModified: new Date() },
    { url: `${site}/grammar`, lastModified: new Date() },
    ...tenses,
  ];
}
