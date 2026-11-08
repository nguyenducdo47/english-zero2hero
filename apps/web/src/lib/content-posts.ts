import type { Locale } from "@/i18n/routing";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type ContentPostCard = {
  slug: string;
  channel: string;
  title: string;
  excerpt: string;
  published_at?: string | null;
};

export type ContentPostDetail = ContentPostCard & {
  body: string;
  updated_at?: string | null;
};

async function headers(locale: Locale): Promise<HeadersInit> {
  return {
    Accept: "application/json",
    "Accept-Language": locale,
    "X-Locale": locale,
  };
}

export async function fetchHubPosts(
  hubSlug: string,
  locale: Locale,
): Promise<ContentPostCard[]> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/pages/${encodeURIComponent(hubSlug)}/posts`,
      { headers: await headers(locale), next: { revalidate: 60, tags: ["content-posts"] } },
    );
    if (!res.ok) return [];
    const json = (await res.json()) as { data: ContentPostCard[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchContentPost(
  channel: "blog" | "news",
  slug: string,
  locale: Locale,
): Promise<ContentPostDetail | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/${channel}/${encodeURIComponent(slug)}`,
      {
        headers: await headers(locale),
        next: { revalidate: 60, tags: ["content-posts", `content-post:${channel}:${slug}`] },
      },
    );
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = (await res.json()) as { data: ContentPostDetail };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchPublishedPostSlugs(
  channel: "blog" | "news",
): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/pages/${channel}/posts`, {
      headers: { Accept: "application/json", "X-Locale": "vi" },
      next: { revalidate: 300, tags: ["content-posts"] },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data: ContentPostCard[] };
    return (json.data ?? []).map((p) => p.slug);
  } catch {
    return [];
  }
}
