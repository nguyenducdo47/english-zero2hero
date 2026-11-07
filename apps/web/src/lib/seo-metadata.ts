import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { staticSiteMetadata } from "@/lib/site-metadata";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type SeoResolved = {
  route_key: string;
  locale: string;
  path: string;
  title: string | null;
  description: string | null;
  keywords: string | null;
  open_graph: {
    title: string | null;
    description: string | null;
    image: string | null;
  };
  twitter: { card: string };
  canonical: string | null;
  robots: { index: boolean; follow: boolean };
  structured_data: unknown;
  page_override?: boolean;
  json_ld: Record<string, unknown>[];
  alternates: Record<string, string>;
  site_name: string;
  favicon_url: string | null;
  site_logo_url: string | null;
};

/** Cache-friendly fetch for RSC / generateMetadata (Next.js cacheComponents). */
export async function fetchSeoResolve(
  path: string,
  locale: Locale,
): Promise<SeoResolved | null> {
  try {
    const q = new URLSearchParams({ path, locale });
    const res = await fetch(`${API_BASE}/api/v1/seo/resolve?${q}`, {
      headers: {
        Accept: "application/json",
        "Accept-Language": locale,
        "X-Locale": locale,
      },
      next: { revalidate: 60, tags: ["seo"] },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data: SeoResolved };
    return json.data;
  } catch {
    return null;
  }
}

export function mergeMetadataWithSeo(
  resolved: SeoResolved | null,
  overlay?: Partial<Metadata>,
): Metadata {
  const base =
    typeof staticSiteMetadata.title === "object"
      ? staticSiteMetadata
      : { ...staticSiteMetadata };

  if (!resolved) {
    return { ...base, ...overlay };
  }

  const robots = {
    index: resolved.robots.index,
    follow: resolved.robots.follow,
  };

  const languages =
    Object.keys(resolved.alternates).length > 0
      ? resolved.alternates
      : undefined;

  const meta: Metadata = {
    ...base,
    title: resolved.title ?? overlay?.title ?? base.title,
    description:
      resolved.description ?? overlay?.description ?? base.description,
    keywords: resolved.keywords ?? undefined,
    robots,
    alternates: {
      canonical: resolved.canonical ?? undefined,
      languages,
    },
    openGraph: {
      title: resolved.open_graph.title ?? resolved.title ?? undefined,
      description:
        resolved.open_graph.description ?? resolved.description ?? undefined,
      images: resolved.open_graph.image
        ? [{ url: resolved.open_graph.image }]
        : undefined,
    },
    twitter: {
      card:
        resolved.twitter.card === "summary"
          ? "summary"
          : "summary_large_image",
    },
    ...(resolved.favicon_url
      ? {
          icons: {
            icon: [{ url: resolved.favicon_url }],
            shortcut: resolved.favicon_url,
          },
        }
      : {}),
    ...overlay,
  };

  return meta;
}

export async function metadataForPath(
  path: string,
  locale: Locale,
  overlay?: Partial<Metadata>,
): Promise<Metadata> {
  const resolved = await fetchSeoResolve(path, locale);
  return mergeMetadataWithSeo(resolved, overlay);
}
