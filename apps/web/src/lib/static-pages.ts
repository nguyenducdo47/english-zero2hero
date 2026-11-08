import type { Locale } from "@/i18n/routing";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type StaticPageSummary = {
  slug: string;
  page_kind: string;
  show_in_header?: boolean;
  show_in_footer?: boolean;
  title: string;
  excerpt: string;
};

export type StaticPageDetail = StaticPageSummary & {
  body: string;
  updated_at?: string;
};

async function apiHeaders(locale: Locale): Promise<HeadersInit> {
  return {
    Accept: "application/json",
    "Accept-Language": locale,
    "X-Locale": locale,
  };
}

export async function fetchPublishedStaticPages(
  locale: Locale,
): Promise<StaticPageSummary[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/pages`, {
      headers: await apiHeaders(locale),
      next: { revalidate: 60, tags: ["static-pages"] },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data: StaticPageSummary[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchFooterStaticPages(
  locale: Locale,
): Promise<StaticPageSummary[]> {
  const all = await fetchPublishedStaticPages(locale);
  return all.filter((p) => p.show_in_footer && p.title);
}

/** Published CMS pages marked “show in header” in admin. */
export async function fetchHeaderNavLinks(
  locale: Locale,
): Promise<{ slug: string; title: string }[]> {
  const all = await fetchPublishedStaticPages(locale);
  return all
    .filter((p) => p.show_in_header && p.title)
    .map(({ slug, title }) => ({ slug, title }));
}

export async function fetchStaticPage(
  slug: string,
  locale: Locale,
): Promise<StaticPageDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/pages/${encodeURIComponent(slug)}`, {
      headers: await apiHeaders(locale),
      next: { revalidate: 60, tags: ["static-pages", `static-page:${slug}`] },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = (await res.json()) as { data: StaticPageDetail };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchPublishedStaticSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/pages`, {
      headers: { Accept: "application/json", "X-Locale": "vi" },
      next: { revalidate: 300, tags: ["static-pages"] },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data: StaticPageSummary[] };
    return (json.data ?? []).map((p) => p.slug);
  } catch {
    return [];
  }
}
