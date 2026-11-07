import type { MetadataRoute } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type RobotsApiRule = {
  userAgent: string;
  allow?: string | string[];
  disallow?: string | string[];
};

export default async function robots(): Promise<MetadataRoute.Robots> {
  const fallback: MetadataRoute.Robots = {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/profile",
        "/dashboard",
        "/login",
        "/mock-exams/session",
        "/auth",
      ],
    },
  };

  try {
    const response = await fetch(`${API_BASE}/api/v1/seo/robots-rules`, {
      headers: { Accept: "application/json", "X-Locale": "vi" },
      next: { revalidate: 60, tags: ["seo"] },
    });
    if (!response.ok) throw new Error(String(response.status));
    const res = (await response.json()) as {
      data: {
        rules: RobotsApiRule[];
        sitemap?: string;
      };
    };

    const rules = res.data.rules.map((r) => ({
      userAgent: r.userAgent,
      allow: r.allow,
      disallow: r.disallow,
    }));

    return {
      rules,
      sitemap: res.data.sitemap,
    };
  } catch {
    return fallback;
  }
}
